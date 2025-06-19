import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppConstants } from '../utils/constants';
import { toast } from 'react-toastify';

const Recommendation = () => {
  const { activityId } = useParams();
  const [recommendation, setRecommendation] = useState(null);
  const [activity, setActivity] = useState(null);

  const fetchRecommendation = async () => {
    try {
      const response = await axios.get(`${AppConstants.BACKEND_URL}/api/recommendations/activity/${activityId}`, { withCredentials: true });
      if (response.status === 200) {
        setRecommendation(response.data);
      }
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await axios.get(`${AppConstants.BACKEND_URL}/api/activities/${activityId}`, { withCredentials: true });
      if (response.status === 200) {
        setActivity(response.data);
      }
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  useEffect(() => {
    fetchRecommendation();
    fetchActivity();
  }, [activityId]);

  if (!activity || !recommendation) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Left Column - Fixed Activity Summary */}
        <div className="col-lg-4">
          <div className="position-sticky" style={{ top: '2rem' }}>
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '4px', overflow: 'hidden' }}>
              <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0">
                  <i className={`bi ${
                    activity.type === 'RUNNING' ? 'bi-person-walking' : 
                    activity.type === 'CYCLING' ? 'bi-bicycle' : 'bi-person'
                  } me-2`}></i>
                  Activity Summary
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-uppercase fw-bold" style={{ 
                    color: activity.type === 'RUNNING' ? '#4e73df' : 
                           activity.type === 'CYCLING' ? '#1cc88a' : '#f6c23e'
                  }}>
                    {activity.type}
                  </h6>
                  <span className="badge bg-light text-dark">
                    {new Date(activity.startTime).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded">
                      <div className="small text-muted">Duration</div>
                      <div className="fw-bold">{activity.duration} min</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded">
                      <div className="small text-muted">Calories</div>
                      <div className="fw-bold">{activity.caloriesBurned} kcal</div>
                    </div>
                  </div>
                </div>
                
                <h6 className="text-muted mb-3">Additional Metrics</h6>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Average Speed</span>
                    <span className="badge bg-primary rounded-pill">{activity.additionalMetrics?.averageSpeed || 'N/A'} kmph</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Max Heart Rate</span>
                    <span className="badge bg-danger rounded-pill">{activity.additionalMetrics?.maxHeartRate || 'N/A'} bpm</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Distance</span>
                    <span className="badge bg-success rounded-pill">{activity.additionalMetrics?.distance || 'N/A'} km</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Scrollable Recommendations */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-primary text-white py-3">
              <h5 className="mb-0">
                <i className="bi bi-robot me-2"></i>
                AI Recommendations
              </h5>
            </div>
            <div className="card-body">
              <div className="recommendation-section mb-4">
                <h5 className="border-bottom pb-2 mb-3">Overall Assessment</h5>
                <p className="lead">{recommendation.recommendation}</p>
              </div>
              
              <div className="recommendation-section mb-4">
                <h5 className="border-bottom pb-2 mb-3">
                  <i className="bi bi-arrow-up-circle text-success me-2"></i>
                  Areas for Improvement
                </h5>
                <ul className="list-group list-group-flush">
                  {recommendation.improvements.map((item, index) => (
                    <li key={index} className="list-group-item border-0 ps-0">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="recommendation-section mb-4">
                <h5 className="border-bottom pb-2 mb-3">
                  <i className="bi bi-lightbulb text-warning me-2"></i>
                  Suggestions for Next Workout
                </h5>
                <ul className="list-group list-group-flush">
                  {recommendation.suggestions.map((item, index) => (
                    <li key={index} className="list-group-item border-0 ps-0">
                      <i className="bi bi-arrow-right-circle-fill text-primary me-2"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="recommendation-section">
                <h5 className="border-bottom pb-2 mb-3">
                  <i className="bi bi-shield-check text-danger me-2"></i>
                  Safety Tips
                </h5>
                <ul className="list-group list-group-flush">
                  {recommendation.safety.map((item, index) => (
                    <li key={index} className="list-group-item border-0 ps-0">
                      <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendation;
