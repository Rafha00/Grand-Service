import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './page/LoginPage.jsx';
import RegisterPage from './page/RegisterPage.jsx';
import ForgotPasswordPage from './page/ForgotPasswordPage.jsx';
import ProductShow from './page/ProductShow.jsx';
import BookingPage from './page/BookingPage.jsx'; // นำเข้าหน้าจองของเรา

function App() {
  return (
    <div>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Route เดิมของเพื่อน */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/product" element={<ProductShow />} />

        {/* Route หน้าจองของเรา */}
        <Route path="/booking" element={<BookingPage />} />
      </Routes>
    </div>
  );
}

export default App;