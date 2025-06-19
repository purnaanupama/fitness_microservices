import React from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';



const Header = () => {
  const { isLoggedIn, userData } = React.useContext(AppContext);
  const navigate = useNavigate();

  const handleGetStarted = () =>{
    if(isLoggedIn){
      navigate("/dashboard");
    } else {
      navigate("/login");
      toast.success("Please Login To Continue", {
        className: "custom-toast",
        });
    }
  }
  return (
    <div className="header-container">
      <div className="hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-image-container">
            <img
              src={assets.main}
              alt="Power Nation Fitness"
              className="hero-image"
            />
          </div>

          <div className="hero-content">
            <h1 className="slogan">Transform Your Fitness Journey with AI</h1>

            <p className="intro-text">
              Welcome to Power Nation, where cutting-edge AI technology meets fitness expertise.
              Our smart AI-powered platform analyzes your unique body composition, fitness level, and goals
              to create personalized workout recommendations that help you become the best version of yourself.
              Say goodbye to generic workout plans and hello to scientifically optimized fitness routines
              designed specifically for you.
            </p>

            <button onClick={handleGetStarted} className="cta-button">
              Start Your Transformation
            </button>
          </div>
        </div>

        <div className="features-section">
          <div className="feature-card">
            <i className="bi bi-robot feature-icon"></i>
            <h3 className="feature-title">AI-Powered Recommendations</h3>
            <p className="feature-description">
              Our advanced algorithms analyze your progress and adapt your workouts for optimal results.
            </p>
          </div>

          <div className="feature-card">
            <i className="bi bi-graph-up-arrow feature-icon"></i>
            <h3 className="feature-title">Track Your Progress</h3>
            <p className="feature-description">
              Monitor your improvements with detailed analytics and visualization tools.
            </p>
          </div>

          <div className="feature-card">
            <i className="bi bi-person-check feature-icon"></i>
            <h3 className="feature-title">Personalized Experience</h3>
            <p className="feature-description">
              Every workout is tailored to your specific needs, goals, and fitness level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;