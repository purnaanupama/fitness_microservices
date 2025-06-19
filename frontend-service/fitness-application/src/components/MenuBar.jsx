import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useContext, useState, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios';
import { AppConstants } from '../utils/constants';

const MenuBar = () => {
  const { userData, getUserData, isLoggedIn, setIsLoggedIn, setUserData } = useContext(AppContext)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    getUserData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  const handleLogout = async () => {
    setIsLoggedIn(false)
    setDropdownOpen(false)
    try {
      const response = await axios.get(`${AppConstants.BACKEND_URL}/api/users/logout`, { withCredentials: true })
      if (response.status === 200) {
        toast.success("Logout Success", { className: "custom-toast" })
        navigate("/login")
        setUserData(null)
        setIsLoggedIn(false)
      } else {
        toast.error(`Error: ${response.data.error}`, { className: "custom-toast" })
        console.error("Auth error:", response.data.error)
      }
    } catch (error) {
      toast.error(`Error: ${error.response.data.message}`, { className: "custom-toast" })
      console.error("Auth error:", error)
    }
  }

  const sendVerificatioOtp = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${AppConstants.BACKEND_URL}/api/users/send-otp`, {}, { withCredentials: true })
      if (response.status === 200) {
        toast.success("OTP Sent", { className: "custom-toast" })
        navigate("/email-verify")
      } else {
        toast.error(`Error: ${response.data.error}`, { className: "custom-toast" })
      }
    } catch (error) {
      toast.error(`Error: ${error.response.data.message}`, { className: "custom-toast" })
      console.error("Auth error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav
      className="navbar navbar-expand-lg px-4 py-3 d-flex justify-content-between align-items-center shadow-sm"
      style={{
        background: 'linear-gradient(to right, #ffffff, #f8f9fa)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center w-100">
        <div className="d-flex align-items-center gap-2">
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              src={assets.logo}
              alt="logo"
              width={40}
              height={40}
              className="me-2"
              style={{ transition: 'transform 0.3s ease' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            />
          </div>
          <span
            className="fs-4"
            style={{
              fontWeight: '700',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(to right, #333, #555)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              borderBottom: '3px solid #2b2b2b'
            }}
          >
            Power Nation
          </span>
        </div>

        {!userData ? (
          <Link
            to="/login"
            className="btn bg-white border border-dark border-2 text-dark d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
            style={{ borderRadius: '5px' }}
          >
            <i className="bi bi-box-arrow-in-right"></i>
            <span>Login</span>
          </Link>
        ) : (
          <div className="position-relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              aria-label="User profile"
              style={{
                cursor: 'pointer',
                display: 'flex',
                borderRadius: '50%',
                border: '1px solid transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            >
              <i className="bi bi-person-circle fs-4"></i>
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '320px',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  padding: '1.25rem',
                  zIndex: 1000,
                  marginTop: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '150px',
                  animation: 'fadeIn 0.25s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem' }}>
                  <i className="bi bi-person-circle" style={{
                    fontSize: '2.75rem',
                    color: '#4e73df',
                    marginRight: '1rem',
                    borderRadius: '50%',
                    padding: '0.25rem',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'none'
                  }}></i>
                  <div>
                    <h6 style={{ marginBottom: '0.25rem', fontWeight: 600, color: '#333' }}>{userData?.name || 'User'}</h6>
                    <small style={{ fontSize: '0.8rem', color: '#6c757d', wordBreak: 'break-word' }}>
                      {userData?.email || 'No email available'}
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', marginTop: '-13px' }}>
                  <span style={{
                    padding: '5px 18px',
                    borderRadius: '5px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: userData?.isAccountVerified ? '#e6f7ee' : '#ffe2e2',
                    color: userData?.isAccountVerified ? '#28a745' : '#f31d15'
                  }}>
                    {userData?.isAccountVerified ? 'Verified' : 'Not Verified'}
                  </span>

                  {!userData?.isAccountVerified && (
                    <button
                      onClick={sendVerificatioOtp}
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(90deg, #4e73df 0%, #3a5fd1 100%)',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {loading ? 'Sendin OTP...' : 'Verify User'}
                    </button>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 13px',
                    marginTop: 'auto',
                    alignSelf: 'flex-end',
                    cursor: 'pointer',
                    textAlign: 'right',
                    width: 'fit-content',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                >
                  Logout <i className="bi bi-box-arrow-right ms-2"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default MenuBar
