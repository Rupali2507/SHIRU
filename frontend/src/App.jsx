import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ShiruFeatures from './components/ShiruFeatures'
import SignIn from './pages/Signin'
import Signup from './pages/Signup'
import { Route ,Routes} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import UserDashboard from './pages/UserDashboard'
import MerchantDashboard from './pages/MerchantDashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import TestCheckout from './pages/TestCheckout'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path="/app" element={<UserDashboard />} />
        <Route path="/merchant" element={<MerchantDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />}/>
        <Route path="/reset-password/:token" element={<ResetPassword />}/>
        <Route path="/test-checkout" element={<TestCheckout />}/>
      </Routes>
    </div>
  )
}

export default App