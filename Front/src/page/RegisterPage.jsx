import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import rolexImg from '../assets/Rolex.webp'; 
import { requestOtpAPI, verifyOtpAPI } from '../api/authApi'; 
import OtpForm from '../component/OtpForm'; // นำเข้า Component OTP ที่แยกออกมา

export default function RegisterPage() {
  const [role, setRole] = useState('User');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [step, setStep] = useState(1);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  
  const navigate = useNavigate();

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otpValues];
    newOtp[index] = val;
    setOtpValues(newOtp);

    if (val !== '' && e.target.nextSibling) {
      e.target.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpValues[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    try {
      await requestOtpAPI({ email, password, role });
      setStep(2);
      alert('ส่ง OTP ไปที่อีเมลจำลองแล้ว (กรุณาดูเลข OTP ใน Console ของ Backend)');
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Registration failed');
      } else {
        setError('Cannot connect to server. Is Backend running?');
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpCode = otpValues.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      await verifyOtpAPI({ email, otp: otpCode });
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      navigate('/login'); 
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || err.response.data.error || 'Invalid OTP');
      } else {
        setError('Cannot connect to server.');
      }
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#c4c4c4] shadow-2xl overflow-hidden flex flex-col md:block md:min-h-[600px]">
        
        {/* ================= ฝั่งรูปภาพ (ขยายขนาดความกว้างและสูงเป็น w-72 h-72 md:w-96 md:h-96 ให้ใหญ่เต็มตา) ================= */}
        <div 
          className={`w-full md:w-1/2 bg-[#121212] relative flex flex-col items-center justify-center p-8 min-h-[350px] md:h-full md:absolute md:top-0 md:left-0 z-20 transition-transform duration-700 ease-in-out ${
            role === 'Admin' ? 'md:translate-x-full' : 'translate-x-0'
          }`}
        >
          <h1 className="text-[#a5a5a5] font-serif text-3xl md:text-4xl tracking-widest absolute top-12 text-center uppercase z-10 font-bold">
            Grand Service
          </h1>
          
          {/* กรอบรูปนาฬิกาขนาดใหญ่ สวยงาม หรูหรา */}
          <div className="w-72 h-72 md:w-96 md:h-96 mt-12 bg-black/40 border border-neutral-800 rounded-3xl flex items-center justify-center p-6 shadow-2xl backdrop-blur-sm z-0">
             <img 
               src={rolexImg} 
               alt="Grand Service Watch" 
               className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(255,255,255,0.15)] scale-110 hover:scale-115 transition-transform duration-500"
             />
          </div>
        </div>

        {/* ================= ฝั่งฟอร์ม ================= */}
        <div 
          className={`w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center md:h-full md:absolute md:top-0 md:right-0 z-10 transition-transform duration-700 ease-in-out ${
            role === 'Admin' ? 'md:-translate-x-full' : 'translate-x-0'
          }`}
        >
          
          {step === 1 && (
            <div className="flex justify-center space-x-6 mb-6">
              <button
                type="button"
                onClick={() => setRole('User')}
                className={`px-8 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  role === 'User' ? 'bg-black text-white shadow-lg scale-105' : 'bg-transparent text-gray-700 border border-gray-400 hover:bg-black hover:text-white'
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`px-8 py-2 rounded-full text-sm font-semibold transition-all duration-300  cursor-pointer ${
                  role === 'Admin' ? 'bg-black text-white shadow-lg scale-105' : 'bg-transparent text-gray-700 border border-gray-400 hover:bg-black hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          )}

          {error && <div className="mb-2 text-red-600 text-sm font-semibold text-center animate-pulse">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="flex flex-col space-y-3">
              <div className="transition-all duration-300">
                <label className="block text-xs font-medium text-black mb-1">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="example@domain.com" 
                  required 
                  className="w-full px-3 py-1.5 border f border-gray-400 bg-white/50 text-black placeholder-gray-500 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all rounded-md" 
                />
              </div>
              
              <div className="transition-all duration-300">
                <label className="block text-xs font-medium text-black mb-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    minLength={6} 
                    className="w-full px-3 py-1.5 border border-gray-400 bg-white/50 text-black placeholder-gray-500 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all rounded-md pr-10" 
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

              <div className="transition-all duration-300">
                <label className="block text-xs font-medium text-black mb-1">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    minLength={6} 
                    className="w-full px-3 py-1.5 border border-gray-400 bg-white/50 text-black placeholder-gray-500 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all rounded-md pr-10" 
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

              <div className="pt-4 flex flex-col items-center space-y-3">
                <button 
                  type="submit" 
                  className="bg-black cursor-pointer text-white px-10 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 hover:scale-105 transition-all shadow-lg w-3/4"
                >
                  Register
                </button>
                <div className="text-xs font-medium text-black">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold hover:text-gray-600 transition-colors">Login</Link>
                </div>
              </div>
            </form>
          ) : (
            /* เรียกใช้งานคอมโพเนนต์ OtpForm ที่แยกไฟล์ออกมา */
            <OtpForm
              otpValues={otpValues}
              onOtpChange={handleOtpChange}
              onOtpKeyDown={handleOtpKeyDown}
              onSubmit={handleVerifyOTP}
              onBack={() => setStep(1)}
            />
          )}
          
        </div>
      </div>
    </div>
  );
}