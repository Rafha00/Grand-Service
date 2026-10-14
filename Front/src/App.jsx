
import './App.css'
import { Routes, Route } from 'react-router-dom'



import LoginPage from './page/LoginPage.jsx'
import RegisterPage from './page/RegisterPage.jsx'
import ForgotPasswordPage from './page/ForgotPasswordPage.jsx'

import Home from './page/Home.jsx'


import ProductShow from './page/ProductShow.jsx'
import ProductDetail from './page/ProductDetail.jsx'

function App() {
 

  return (
  <div>

    <Routes>
       
         
          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
           <Route path="/login" element={<LoginPage />} />
             <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/home" element={<Home/>} />
              <Route path="/product" element={< ProductShow/>} />
              <Route path="/product/:brands" element={<ProductDetail />} />
      </Routes>

  </div>
  )
}

export default App
