import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ToastContainer } from 'react-toastify'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import EmailVerify from './pages/EmailVerify'
import Register from './pages/Register'
import Home from './pages/Home'
import MenuBar from './components/MenuBar'
import Dashboard from './pages/Dashboard'
import Recommendation from './pages/Recommendation'




function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <ToastContainer/>
      <MenuBar/>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/' element={<Home/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
        <Route path='/recommendation/:activityId' element={<Recommendation/>}/>
      </Routes>
    </div>
  )
}

export default App
