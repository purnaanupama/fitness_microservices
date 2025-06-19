import React, { useEffect, useState } from 'react';
import { BiSolidTrashAlt } from "react-icons/bi";
import { FaCirclePlus } from "react-icons/fa6";
import axios from 'axios';
import { AppConstants } from '../utils/constants';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { IoPrint } from "react-icons/io5";


const Dashboard = () => {
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [showAdditionalMetrics, setShowAdditionalMetrics] = useState(false);
  const [userActivities, setUserActivities] = useState([]);
  const [reportPrintActivity, setReportPrintActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    distance: '',
    averageSpeed: '',
    maxHeartRate: ''
  });
  const { userData } = React.useContext(AppContext)
  const navigate = useNavigate();
  const pollingIntervalRef = React.useRef(null);


  const handleWorkoutSelect = (workout) => {
    setSelectedWorkout(workout);
    setDropdownOpen(false);
  };

  const handleMetricsChange = (e) => {
    const { id, value } = e.target;
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      [id]: value
    }));
  };

  const toggleAdditionalMetrics = () => {
    setShowAdditionalMetrics(!showAdditionalMetrics);
  };

  const handleSaveWorkout = async() => {
    const workoutData = {
      userId: userData.userId,
      type: selectedWorkout,
      duration: duration,
      caloriesBurned: caloriesBurned,
      startTime: new Date().toISOString(),
      additionalMetrics: {...metrics}
    };
    console.log(workoutData);
    setLoading(true);
    try {
      const response = await axios.post(`${AppConstants.BACKEND_URL}/api/activities`, workoutData, { withCredentials: true });
      if(response.status === 200){
        toast.success("Workout Saved", {
          className: "custom-toast",
          });}
        fetchActivities();
    console.log("Workout Saved", workoutData);
    } catch (error) {
        toast.error(`Error : ${error.response.data.error}`, {
          className: "custom-toast",
          });
    } finally {
      setLoading(false);
    }

  };

    useEffect(() => {
    fetchActivities();
  }, [])

  const fetchActivities = async() => {
    try {
      const response = await axios.get(`${AppConstants.BACKEND_URL}/api/activities/user-activities/${userData.userId}`, { withCredentials: true });
      if(response.status === 200){
        setUserActivities(response.data);
      }
    } catch (error) {
      toast.error(`Error : ${error.response.data.error}`, {
        className: "custom-toast",
        });
    }
  }

 const startPolling = (activityId) => {
  if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

  pollingIntervalRef.current = setInterval(() => {
    pollReportStatus(activityId);
  }, 5000);
};


  const  handlePrint = async(event,activityId) =>{
    event.stopPropagation();
    try {
      const response = await axios.get(`${AppConstants.BACKEND_URL}/api/activities/print-report/${activityId}`, { withCredentials: true });
      if(response.status === 200){
       setReportPrintActivity(activityId);
       startPolling(activityId);
      }
    } catch (error) {
      toast.error(`Something Went Wrong`, {
        className: "custom-toast",
        });
    }
  }

  const handleDelete = async(event, activityId) => {
    event.stopPropagation();
    try {
      const response = await axios.delete(`${AppConstants.BACKEND_URL}/api/activities/${activityId}`, { withCredentials: true });
      if(response.status === 204){
        toast.success("Activity deleted successfully", {
          className: "custom-toast",
        });
         fetchActivities();
      }
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.error || 'Failed to delete activity'}`, {
        className: "custom-toast",
      });
    }
  }


const pollReportStatus = async (activityId) => {
  try {
    const response = await axios.get(`${AppConstants.BACKEND_URL}/api/reports/${activityId}`, { withCredentials: true });
    const data = response.data;

    if (data.status === 'COMPLETED' && data.reportData) {
      console.log('Report ready! Opening in browser...');

      // Define the base64ToBlob function here
      function base64ToBlob(base64, mimeType = 'application/pdf') {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: mimeType });
      }

      const blob = base64ToBlob(data.reportData);
      const url = URL.createObjectURL(blob);

      // Open in new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.location.href = url;
      } else {
        console.warn('Popup blocked! Fallback to download.');
        const link = document.createElement('a');
        link.href = url;
        link.download = `report_${activityId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      // Clear the polling interval and loading state
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setReportPrintActivity(null); // Clear loading state

      toast.success("Report generated successfully!", {
        className: "custom-toast",
      });
    } else {
      console.log('Report not ready yet. Retrying...');
    }
  } catch (error) {
    console.error('Error fetching report:', error);
    clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = null;
    setReportPrintActivity(null); // Clear loading state on error

    toast.error("Failed to generate report", {
      className: "custom-toast",
    });
  }
};



  return (
    <div className="mt-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h3 className="mb-4">Dashboard</h3>
      <div className="row  mb-5">
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Enter Workout Details</h5>

              {/* Bootstrap Dropdown */}
              <div className="dropdown mb-3">
                <button
                  className="btn btn-light border dropdown-toggle d-flex justify-content-between align-items-center w-100"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ textAlign: 'left', padding: '10px 15px' }}
                >
                  <span>{selectedWorkout || "Select Exercise"}</span>
                </button>
                <ul className="dropdown-menu w-100">
                  <li><button className="dropdown-item" onClick={() => handleWorkoutSelect("CYCLING")}>Cycling</button></li>
                  <li><button className="dropdown-item" onClick={() => handleWorkoutSelect("RUNNING")}>Running</button></li>
                  <li><button className="dropdown-item" onClick={() => handleWorkoutSelect("WALKING")}>Walking</button></li>
                </ul>
              </div>

              {/* Bootstrap Form Inputs */}
              <div className="mb-3">
                <label htmlFor="duration" className="form-label">Duration (minutes)</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-clock"></i>
                  </span>
                  <input
                    type="number"
                    className="form-control"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Enter duration"
                  />
                  <span className="input-group-text">min</span>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="calories" className="form-label">Calories Burned</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-fire"></i>
                  </span>
                  <input
                    type="number"
                    className="form-control"
                    id="calories"
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(e.target.value)}
                    placeholder="Enter calories"
                  />
                  <span className="input-group-text">kcal</span>
                </div>
              </div>

              <div className="mb-3">
                <div
                  onClick={toggleAdditionalMetrics}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <span>Add Additional Metrics</span>
                  <FaCirclePlus style={{ marginLeft: '10px', fontSize: '1.2rem', color: '#4e73df' }} />
                </div>
              </div>

              {/* Additional Metrics (conditionally rendered) */}
              {showAdditionalMetrics && (
                <div className="additional-metrics mb-3">
                  <div className="mb-3">
                    <label htmlFor="distance" className="form-label">Distance</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-map"></i>
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        id="distance"
                        value={metrics.distance}
                        onChange={handleMetricsChange}
                        placeholder="Enter distance"
                      />
                      <span className="input-group-text">km</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="averageSpeed" className="form-label">Average Speed</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-speedometer"></i>
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        id="averageSpeed"
                        value={metrics.averageSpeed}
                        onChange={handleMetricsChange}
                        placeholder="Enter average speed"
                      />
                      <span className="input-group-text">km/h</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="maxHeartRate" className="form-label">Max Heart Rate</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-heart-pulse"></i>
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        id="maxHeartRate"
                        value={metrics.maxHeartRate}
                        onChange={handleMetricsChange}
                        placeholder="Enter max heart rate"
                      />
                      <span className="input-group-text">bpm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button onClick={handleSaveWorkout} className="btn btn-primary w-100 mt-3">
                Save Workout
              </button>

              {selectedWorkout && (
                <div className="alert alert-info mt-3">
                  <i className="bi bi-info-circle me-2"></i>
                  You selected: <strong>{selectedWorkout}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5 mb-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">My Workouts</h5>
              {userActivities && userActivities.length > 0 ? (
                <div className="activity-list" style={{ overflowY: 'auto' }}>
                  {userActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="card mb-3 border-0"
                      style={{
                        borderRadius: '10px',
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer',
                        backgroundColor: '#373737',
                        color: '#fff'
                      }}
                    >
                      <div className="card-body" onClick={() => navigate(`/recommendation/${activity.id}`)}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="card-subtitle mb-0" style={{
                            fontWeight: '600',
                            color: activity.type === 'RUNNING' ? '#c5d1ff' :
                                   activity.type === 'CYCLING' ? '#1cc88a' : '#f6c23e'
                          }}>
                            <i className={`bi ${
                              activity.type === 'RUNNING' ? 'bi-person-walking' :
                              activity.type === 'CYCLING' ? 'bi-bicycle' : 'bi-person'
                            } me-2`}></i>
                            {activity.type}
                          </h6>
                          <small style={{ color: '#adb5bd' }}>
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="card-text mb-1" style={{ color: '#e9ecef' }}>
                              <i className="bi bi-clock me-2"></i>
                              {activity.duration} min
                            </p>
                            <p className="card-text mb-1" style={{ color: '#e9ecef' }}>
                              <i className="bi bi-fire me-2"></i>
                              {activity.caloriesBurned} kcal
                            </p>

                          </div>
                          <div className='d-flex gap-2'>
                         <button
                            className="btn btn-sm rounded-circle"
                            style={{
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#444',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                            onClick={(e) => handleDelete(e, activity.id)}
                          >
                            <BiSolidTrashAlt style={{ color: '#ff9999', fontSize: '1.2rem' }}/>
                          </button>
                          <button
                            className="btn btn-sm rounded-circle"
                            style={{
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#444',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                              position: 'relative'
                            }}
                            onClick={(e) => handlePrint(e, activity.id)}
                            disabled={reportPrintActivity === activity.id}
                          >
                            {reportPrintActivity === activity.id ? (
                              <div
                                className="spinner-border spinner-border-sm"
                                role="status"
                                style={{
                                  color: '#6cfc5b',
                                  width: '1.2rem',
                                  height: '1.2rem'
                                }}
                              >
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            ) : (
                              <IoPrint style={{ color: '#6cfc5b', fontSize: '1.2rem' }}/>
                            )}
                          </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted text-center">Your recent workouts will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
