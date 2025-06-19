
import { useState, useRef, useContext, useEffect } from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppConstants } from '../utils/constants';
import { AppContext } from '../context/AppContext';

const EmailVerify = () => {
  // State to store OTP digits
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { backendURL, isLoggedIn, setIsLoggedIn, getUserData, userData } = useContext(AppContext)

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  const handleOtpChange = (index, value) => {

    if (value && !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input if current input is filled
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle key press for backspace to move to previous input
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus on previous input when backspace is pressed on an empty input
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyEmail = async () => {
    const otpValue = otp.join('');
    if(otpValue.length !== 6) {
      toast.error("Please enter a valid OTP", {
      className: "custom-toast",
      });
      return; 
    }
    setLoading(true);
     try {
      const response = await axios.post(`${AppConstants.BACKEND_URL}/api/users/verify-otp`, { otp: otpValue }, { withCredentials: true });
      if(response.status === 200){
        toast.success("Email Verified", {
          className: "custom-toast",
          });
        getUserData();
        navigate("/");
      } else {
        toast.error(`Invalid OTP`, {
          className: "custom-toast",
          });
      }
     } catch (error) {
        toast.error(`Invalid OTP`, {
          className: "custom-toast",
          });
     } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    isLoggedIn && userData && userData?.isAccountVerified && navigate("/")
    console.log(isLoggedIn, userData);
  }, [isLoggedIn, userData]);

  return (
    <div
      style={{ background: '#f8f9fa' }}
      className="position-relative min-vh-100 d-flex justify-content-center align-items-center"
    >
      <div
        className="p-4 shadow"
        style={{
          width: '100%',
          maxWidth: '450px',
          background: 'white',
          borderRadius: '8px',
          color: 'black',
          position: 'relative',
          marginTop: '-50px'
        }}
      >
        <div className="text-center mb-4">
          <Link to="/">
            <img src={assets.logo} alt="Power Nation Logo" height={50} width={50} />
          </Link>
          <h2 className="mt-3" style={{ fontWeight: '700', color: '#333' }}>Email Verification</h2>
          <p className="text-muted" style={{ fontSize: '0.95rem', maxWidth: '350px', margin: '0 auto', marginTop: '10px' }}>
            Please enter the 6-digit verification code sent to your email address to complete your registration
          </p>
        </div>

        <div className="d-flex justify-content-center gap-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="form-control text-center fw-bold fs-4"
              style={{
                width: '50px',
                height: '60px',
                borderRadius: '8px',
                borderColor: digit ? '#4e73df' : '#ced4da',
                boxShadow: digit ? '0 0 0 1px rgba(78, 115, 223, 0.25)' : 'none',
                transition: 'all 0.2s ease',
                fontSize: '1.5rem'
              }}
            />
          ))}
        </div>

        <button
          disabled={loading}
          className="btn w-100 mb-3"
          style={{
            background: 'linear-gradient(90deg, #4e73df 0%, #3a5fd1 100%)',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '6px',
            fontWeight: '600',
            boxShadow: '0 4px 10px rgba(78, 115, 223, 0.25)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 15px rgba(78, 115, 223, 0.35)';
            e.currentTarget.style.background = 'linear-gradient(90deg, #3a5fd1 0%, #2e4cbe 100%)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 10px rgba(78, 115, 223, 0.25)';
            e.currentTarget.style.background = 'linear-gradient(90deg, #4e73df 0%, #3a5fd1 100%)';
          }}
          onClick={handleVerifyEmail}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        <div className="text-center mt-3">
          <p className="mb-0">
            Didn't receive the code?{' '}
            <Link to="#" className="text-decoration-none" style={{ color: '#4e73df' }}>
              Resend
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;