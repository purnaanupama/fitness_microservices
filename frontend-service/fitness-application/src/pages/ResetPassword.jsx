import React, { useRef, useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false)
  const [isOtpVerified, setIsOtpVerified] = useState(false)

  const { backendURL, isLoggedIn, setIsLoggedIn, getUserData, userData } = useContext(AppContext)

  // Create refs for OTP inputs
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow digits
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
  const handleVerifyOtp = async() => {
    const otpValue = otp.join('');
    if(otpValue.length !== 6) {
      toast.error("Please enter a valid OTP", {
        className: "custom-toast",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${backendURL}/api/users/verify-reset-otp`, { otp: otpValue, email: email })
      if(response.status === 200){
        toast.success("OTP Verified", {
          className: "custom-toast",
          });
        setIsOtpVerified(true);
         setIsOtpSubmitted(true);
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

  // Handle password reset submission
  const handleResetPassword = async(e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill all fields", {
        className: "custom-toast",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        className: "custom-toast",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters", {
        className: "custom-toast",
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${backendURL}/api/users/reset-password`, { email: email, newPassword: newPassword })
      if(response.status === 200){
        toast.success("Password Reset Successfully", {
          className: "custom-toast",
          });
        navigate("/login");
      } else {
        toast.error(`Error : ${response.data.error}`, {
          className: "custom-toast",
          });
      }
    } catch (error) {
      toast.error(`Error : ${error.message}`, {
        className: "custom-toast",
        });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitEmail = async(e) =>{
    e.preventDefault();
    setLoading(true);
    try {
     const response = await axios.post(`${backendURL}/api/users/send-reset-otp?email=${email}`)
     if(response.status === 200){
      toast.success("OTP Sent To Email", {
        className: "custom-toast",
      });
     } else {
      toast.error(`Error : ${response.data.error}`, {
        className: "custom-toast",
        });
     }
     setIsEmailSent(true);
     setIsOtpSubmitted(false);
    } catch (error) {
      toast.error(`Error : ${error.message}`, {
        className: "custom-toast",
        });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='d-flex justify-content-center align-items-center vh-70 mt-5'>
      {/*Reset Password Card - Email Input*/}
      {!isEmailSent && (
        <div className="rounded-4 p-5 text-center" style={{ width:'100%', maxWidth: '400px',backgroundColor:"#ececec" }}>
          <h4 className="mb-2">Reset Password</h4>
          <p className="mb-4">Enter Your Registered Email Address</p>
          <form onSubmit={onSubmitEmail}>
            <div className="input-group mb-4 bg-secondary bg-opacity-10 rounded-sm">
              <span className='input-group-text bg-transparent border-0 ps-4'>
                <i className='bi bi-envelope'></i>
              </span>
              <input 
                type="email" 
                className="form-control bg-transparent border-0 ps-1 pe-4 rounded-end" 
                placeholder="Enter your email"
                style={{height: '50px'}}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </div>
            <button className="btn btn-primary w-100 py-2" disabled={loading} type='submit'>
              {loading ? 'Sending OTP...' : 'Submit'}
            </button>
          </form>
        </div>
      )}
      
      {/*OTP Card*/}
      {isEmailSent && !isOtpSubmitted && (
        <div
          className="p-4 shadow"
          style={{
            width: '100%',
            maxWidth: '450px',
            background: 'white',
            borderRadius: '8px',
            color: 'black',
            position: 'relative',
          }}
        >
          <div className="text-center mb-4">
            <Link to="/">
              <img src={assets.logo} alt="Power Nation Logo" height={50} width={50} />
            </Link>
            <h2 className="mt-3" style={{ fontWeight: '700', color: '#333' }}>Verification Code</h2>
            <p className="text-muted" style={{ fontSize: '0.95rem', maxWidth: '350px', margin: '0 auto', marginTop: '10px' }}>
              Please enter the 6-digit verification code sent to your email address to reset your password
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
            onClick={handleVerifyOtp}
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
          >
            {loading ? 'Verifying...' : 'Verify Code'}
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
      )}

      {/*New Password Card*/}
      {isEmailSent && isOtpSubmitted &&  (
        <div className="p-4 shadow" style={{ width:'100%', maxWidth: '450px', background: 'white', borderRadius: '8px' }}>
          <div className="text-center mb-4">
            <Link to="/">
              <img src={assets.logo} alt="Power Nation Logo" height={50} width={50} />
            </Link>
            <h2 className="mt-3" style={{ fontWeight: '700', color: '#333' }}>Reset Password</h2>
            <p className="text-muted" style={{ fontSize: '0.95rem', maxWidth: '350px', margin: '0 auto', marginTop: '10px' }}>
              Please enter your new password
            </p>
          </div>

          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <div className="input-group mb-3">
                <span className="input-group-text bg-transparent">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="input-group mb-3">
                <span className="input-group-text bg-transparent">
                  <i className="bi bi-lock-fill"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
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
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ResetPassword
