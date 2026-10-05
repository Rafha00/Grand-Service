import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import rolexImg from '../assets/Rolex.webp'; 
import { forgotPasswordAPI, resetPasswordAPI } from '../api/authApi'; 

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State สำหรับเปิด/ปิดลูกตารหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const newOtp = [...otpValues];
    newOtp[index] = val;
    setOtpValues(newOtp);
    if (val !== '' && e.target.nextSibling) e.target.nextSibling.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpValues[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  // Step 1: ขอ OTP
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await forgotPasswordAPI({ email });
      setStep(2);
      alert('ส่งรหัส OTP สำหรับรีเซ็ตรหัสผ่านไปที่อีเมลจำลองแล้ว');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset');
    }
  };

  // Step 2: ยืนยัน OTP และรหัสใหม่
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) return setError('รหัสผ่านไม่ตรงกัน');
    
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) return setError('กรุณากรอก OTP ให้ครบ 6 หลัก');

    try {
      await resetPasswordAPI({ email, otp: otpCode, newPassword });
      alert('เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP or failed to reset');
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#c4c4c4] shadow-2xl overflow-hidden flex flex-col md:block md:min-h-[600px]">
        
        {/* ================= ฝั่งรูปภาพ ================= */}
        <div className="w-full md:w-1/2 bg-[#121212] relative flex flex-col items-center justify-center p-8 min-h-[350px] md:h-full md:absolute md:top-0 md:left-0 z-20">
          <h1 className="text-[#a5a5a5] font-serif text-3xl md:text-4xl tracking-widest absolute top-12 text-center uppercase z-10 font-bold">
            Grand Service
          </h1>
          
          <div className="w-72 h-72 md:w-96 md:h-96 mt-12 bg-black/40 border border-neutral-800 rounded-3xl flex items-center justify-center p-6 shadow-2xl backdrop-blur-sm z-0">
             <img 
               src={rolexImg} 
               alt="Watch" 
               className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(255,255,255,0.15)] scale-110 hover:scale-115 transition-transform duration-500" 
             />
          </div>
        </div>

        {/* ================= ฝั่งฟอร์มขวามือ ================= */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center md:h-full md:absolute md:top-0 md:right-0 z-10">
          <h2 className="text-2xl font-bold mb-6 text-black text-center">
            {step === 1 ? 'Reset Password' : 'Create New Password'}
          </h2>
          
          {error && <div className="mb-4 text-red-600 text-sm font-semibold text-center animate-pulse">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestReset} className="flex flex-col space-y-5">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Enter your registered Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="example@domain.com" 
                  required 
                  className="w-full px-4 py-2 border border-gray-400 bg-white/50 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black rounded-md" 
                />
              </div>
              <div className="pt-4 flex flex-col items-center space-y-3">
                <button type="submit" className="bg-black text-white px-12 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 shadow-lg w-3/4">Send Reset OTP</button>
                <Link to="/login" className="text-xs font-bold text-black hover:text-gray-600">Back to Login</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col space-y-4 items-center">
              <span className="text-sm font-medium text-black w-full text-left pl-1">OTP (6-Digits)</span>
              <div className="flex justify-between w-full mb-2">
                {otpValues.map((data, index) => (
                  <input 
                    key={index} 
                    type="text" 
                    maxLength="1" 
                    value={data} 
                    onChange={(e) => handleOtpChange(e, index)} 
                    onKeyDown={(e) => handleOtpKeyDown(e, index)} 
                    className="w-10 h-10 text-center text-lg bg-white/80 border border-gray-400 rounded-md focus:outline-none focus:border-black text-black shadow-sm" 
                  />
                ))}
              </div>

              {/* ช่องรหัสผ่านใหม่ พร้อมปุ่มตา */}
              <div className="w-full">
                <label className="block text-xs font-medium text-black mb-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="••••••••"
                    required 
                    minLength={6} 
                    className="w-full px-3 py-1.5 border border-gray-400 bg-white/50 text-black rounded-md pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black focus:outline-none"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* ช่องยืนยันรหัสผ่านใหม่ พร้อมปุ่มตา */}
              <div className="w-full pb-4">
                <label className="block text-xs font-medium text-black mb-1">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••"
                    required 
                    minLength={6} 
                    className="w-full px-3 py-1.5 border border-gray-400 bg-white/50 text-black rounded-md pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="bg-black text-white px-12 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 shadow-lg w-3/4">Confirm Reset</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}