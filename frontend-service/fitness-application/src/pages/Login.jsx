import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import '../index.css'



const Login = () => {
  const [ isCreateAccount, setIsCreateAccount ] = React.useState(false)
  const [ name, setName ] = React.useState('')
  const [ email, setEmail ] = React.useState('')
  const [ password, setPassword ] = React.useState('')
  const [ loading, setLoading ] = React.useState(false)
  const { backendURL, isLoggedIn, setIsLoggedIn, getUserData } = React.useContext(AppContext)
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const payload = isCreateAccount 
      ? { name, email, password } 
      : { email, password };

    const url = isCreateAccount
      ? `${backendURL}/api/users/register`
      : `${backendURL}/api/users/login`;

    const response = await axios.post(url, payload, { withCredentials: true });

    if (isCreateAccount && response.status === 201) {
      toast.success("Account Created Successfully", {
      className: "custom-toast",
      });
      navigate("/");
    } else if (!isCreateAccount && response.status === 200) {
      setIsLoggedIn(true);
      getUserData();
      toast.success("Welcome Back", {
      className: "custom-toast",
      });
      navigate("/"); 
    }
  } catch (error) {
    if(error.response.data.message === "Email Already Exist"){
      toast.error("User Already Exist", {
        className: "custom-toast",
        });
      return;
    }
    if(error.response.data.message === "Email Or Password Is Incorrect"){
      toast.error("Invalid Credentials", {
        className: "custom-toast",
        });
      return;
    }
    const errorMsg = error?.response?.data?.message || "Something went wrong";
    toast.error("Something Went Wrong", {
      className: "custom-toast",
      });
    console.error("Auth error:", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      style={{ background: '#232323' }}
      className="position-relative min-vh-100 d-flex justify-content-center align-items-center"
    >
    
      <div
        className="p-4 shadow"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'white',
          borderRadius: '8px',
          color: 'black',
          position:'relative',
          marginTop:'-50px'
        }}
      >
        
      { isCreateAccount ? ( <h2 className="mb-4 text-center">Let's Get Started</h2> ) : ( <h3 className="mb-4 text-center">Welcome Back</h3> )} 
       
       <div style={{ position: 'absolute', top: '20px', left: '30px' }}>
        <Link to="/"
          style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '24px', textDecoration: 'none' }} >
          <img src={assets.logo} alt="logo" height={32} width={32} />
        </Link>
       </div>

      { isCreateAccount && (
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
             type="text" 
             className="form-control" 
             required 
             id="name" 
             value={name}
             placeholder="Enter your name"
             onChange={(e) => setName(e.target.value)} />
        </div>
       )}

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input 
             type="email" 
             className="form-control" 
             required 
             id="email" 
             value={email}
             placeholder="Enter your email"
             onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mb-2">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input 
             type="password" 
             className="form-control" 
             required 
             value={password}
             id="password" 
             placeholder="Enter your password"
             onChange={(e) => setPassword(e.target.value)} />
        </div>

        {!isCreateAccount && 
        (<div className="mb-3 text-start" style={{ fontSize: "14px" }}>
          <Link to="/reset-password" className="text-decoration-none" style={{ color: '#4e73df' }}>
            Forgot Password ?
          </Link>
        </div>)}

        <button
          className="btn w-100 mb-3 "
          style={{
            background: 'linear-gradient(90deg, #4e73df 0%, #3a5fd1 100%)',
            color: 'white',
            border: 'none',
            marginTop:'10px'
          }}
          disabled={loading}
          onClick={handleSubmit}
        >
         { loading ? 'Loading...' : isCreateAccount ? 'Create Account' : 'Login' } 
        </button>

       { isCreateAccount ? 
       ( <div className="text-center">
            Already have an account ?{' '}
            <Link onClick={() => setIsCreateAccount(false)} className="text-decoration-none" style={{ color: '#4e73df' }}>
              Login
            </Link>
          </div>) : 
       ( <div className="text-center">
            Don’t have an account ?{' '}
            <Link onClick={() => setIsCreateAccount(true)}  className="text-decoration-none" style={{ color: '#4e73df' }}>
              Register
            </Link>
          </div> )
       } 
      </div>
    </div>
  )
}

export default Login
