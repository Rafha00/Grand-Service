import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import rolexImg from '../assets/Rolex.webp'; 
import { forgotPasswordAPI, resetPasswordAPI } from '../api/authApi'; 
import Swal from 'sweetalert2';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
      
      Swal.fire({
        title: 'ส่ง OTP สำเร็จ!',
        text: 'ส่งรหัส OTP สำหรับรีเซ็ตรหัสผ่านไปที่อีเมลจำลองแล้ว',
        icon: 'success',
        background: '#111',
        color: '#fff',
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: 'rounded-2xl border border-gray-800',
          confirmButton: 'bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all'
        }
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to request reset';
      setError(errMsg);
      
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: errMsg,
        icon: 'error',
        background: '#111',
        color: '#fff',
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: 'rounded-2xl border border-gray-800',
          confirmButton: 'bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all'
        }
      });
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
      
      Swal.fire({
        title: 'เปลี่ยนรหัสผ่านสำเร็จ!',
        text: 'กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่ของคุณ',
        icon: 'success',
        background: '#111',
        color: '#fff',
        confirmButtonText: 'เข้าสู่ระบบ',
        customClass: {
          popup: 'rounded-2xl border border-gray-800',
          confirmButton: 'bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all'
        }
      }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
          navigate('/login');
        }
      });
      
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid OTP or failed to reset';
      setError(errMsg);
      
      Swal.fire({
        title: 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
        text: errMsg,
        icon: 'error',
        background: '#111',
        color: '#fff',
        confirmButtonText: 'ลองอีกครั้ง',
        customClass: {
          popup: 'rounded-2xl border border-gray-800',
          confirmButton: 'bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all'
        }
      });
    }
  };

  return (
    <div className="min-h-screen w-full font-sans flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      
      {/* ================= กล่อง Main Card (ปรับขนาดให้เท่ากับหน้า Login และ Register: max-w-[1100px] h-[660px]) ================= */}
      <div className="w-full max-w-[1100px] h-[660px] flex bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.2)] border border-white/10 relative z-10">
        
        {/* ================= ฝั่งซ้าย: รูปภาพและแบรนดิ้ง ================= */}
        <div className="hidden lg:flex lg:w-1/2 h-full relative bg-black flex-col justify-between p-12 border-r border-white/5">
          
          <div className="flex justify-between items-center z-20">
            <span className="text-[11px] tracking-[0.35em] font-bold text-gray-300">GRAND SERVICE</span>
            <div className="w-12 h-[1px] bg-gray-600"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none pr-6">
            <img 
              src={rolexImg} 
              alt="Grand Service Watch" 
              className="w-[90%] max-w-[440px] h-auto object-contain mix-blend-lighten opacity-95 drop-shadow-2xl translate-x-8" 
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10 w-4/5"></div>

          <div className="relative z-20 flex-1 flex flex-col justify-center items-start w-full">
            <h1 className="font-serif text-4xl xl:text-5xl font-medium leading-[1.1] mb-5 tracking-wide text-white drop-shadow-lg">
              GRAND<br />SERVICE
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-6 h-[1px] bg-gray-500"></div>
              <p className="text-[10px] tracking-[0.4em] text-gray-400 font-medium">TIME IS PRECIOUS</p>
            </div>
          </div>
        </div>

        {/* ================= ฝั่งขวา: ฟอร์มรีเซ็ตรหัสผ่าน ================= */}
        <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-10 relative bg-transparent">
          
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-gradient-to-bl from-gray-500/10 to-transparent rounded-full blur-[100px] z-0 pointer-events-none"></div>

          <div className="w-full max-w-[380px] relative z-10">
            
            <div className="mb-6 text-center lg:text-left">
              <h2 className="font-serif text-3xl font-semibold mb-2 text-white tracking-wide">
                {step === 1 ? 'Reset Password' : 'New Password'}
              </h2>
              <p className="text-gray-400/80 text-[13px] font-light tracking-wide">
                {step === 1 ? 'Enter your email to receive OTP' : 'Enter the 6-digit code and your new password'}
              </p>
            </div>
            
            {error && (
              <div className="mb-4 text-red-400 text-sm font-medium bg-red-950/30 p-3 rounded-xl border border-red-900/50 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 group-focus-within:text-gray-200 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Email address" 
                    required 
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all duration-300 text-[14px] shadow-inner truncate" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-white text-black py-3 rounded-full text-[13px] font-semibold flex justify-center items-center space-x-2 hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 mt-2"
                >
                  <span className="tracking-wide">Send Reset OTP</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>

                <div className="flex items-center justify-center space-x-4 py-1">
                  <div className="h-[1px] bg-white/10 flex-1"></div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Or</span>
                  <div className="h-[1px] bg-white/10 flex-1"></div>
                </div>

                <Link 
                  to="/login" 
                  className="w-full block text-center border border-white/20 bg-transparent text-gray-300 py-3 rounded-full text-[13px] font-medium hover:border-white hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  Back to login
                </Link>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                {/* ช่องกรอก OTP 6 ช่อง */}
                <div className="flex justify-between space-x-1.5 my-2">
                  {otpValues.map((data, index) => (
                    <input 
                      key={index} 
                      type="text" 
                      maxLength="1" 
                      value={data} 
                      onChange={(e) => handleOtpChange(e, index)} 
                      onKeyDown={(e) => handleOtpKeyDown(e, index)} 
                      className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-xl text-center text-white text-lg font-bold focus:outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all shadow-inner" 
                    />
                  ))}
                </div>

                {/* ช่องรหัสผ่านใหม่ */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 group-focus-within:text-gray-200 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="New Password"
                    required 
                    minLength={6} 
                    className="w-full pl-11 pr-11 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all duration-300 text-[14px] shadow-inner truncate" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
                
                {/* ช่องยืนยันรหัสผ่านใหม่ */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 group-focus-within:text-gray-200 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Confirm New Password"
                    required 
                    minLength={6} 
                    className="w-full pl-11 pr-11 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all duration-300 text-[14px] shadow-inner truncate" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white focus:outline-none transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-white text-black py-3 rounded-full text-[13px] font-semibold flex justify-center items-center space-x-2 hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 mt-2"
                >
                  <span className="tracking-wide">Confirm Reset</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>

                <div className="mt-3 flex justify-center">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="cursor-pointer bg-white/[0.03] text-gray-300 border border-white/10 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}