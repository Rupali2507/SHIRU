import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ShiruFeatures from './components/ShiruFeatures'
import SignIn from './pages/Signin'
import Signup from './pages/Signup'
import { Route ,Routes} from 'react-router-dom'
import Dashboard from './pages/Dashboard'


const App = () => {
  return (
    <div>
      
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
    </div>
  )
}

export default App