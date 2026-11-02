import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutAPI } from '../api/authApi';
import Swal from 'sweetalert2';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // เรียก API ล้างคุกกี้ที่หลังบ้าน
      await logoutAPI();
      
      Swal.fire({
        title: 'Logged Out',
        text: 'ออกจากระบบเรียบร้อยแล้ว',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
        background: '#111',
        color: '#fff'
      });

      // พาเด้งกลับหน้า Login
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      Swal.fire({
        title: 'Error',
        text: 'ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        background: '#111',
        color: '#fff'
      });
    }
  };

  return (
    <div className="h-full bg-[#0a0a0a] text-white flex flex-col justify-between p-6 border-r border-gray-800">
      <div>
        {/* Branding */}
        <div className="mb-12 mt-4 text-center">
          <h2 className="text-2xl font-serif font-semibold tracking-widest uppercase">Grand</h2>
          <p className="text-[10px] text-gray-400 tracking-[0.3em] mt-1">SERVICE</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <a href="#" className="p-3.5 px-5 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-gray-100 flex items-center gap-3 text-sm font-medium">
            Home
          </a>
          <a href="/profile" className="p-3.5 px-5 bg-white/10 rounded-xl transition-all text-white flex items-center gap-3 text-sm font-medium shadow-inner border border-white/5">
            Profile
          </a>
          <a href="#" className="p-3.5 px-5 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-gray-100 flex items-center gap-3 text-sm font-medium">
            Booking
          </a>
        </nav>
      </div>
      
      {/* Logout Button */}
      <div className="mt-10 mb-4">
        <button 
          onClick={handleLogout} // 👈 ผูกฟังก์ชันกดคลิกตรงนี้แล้วครับ!
          className="w-full p-3.5 rounded-xl transition-all text-red-400 font-medium flex justify-center items-center gap-2 border border-red-900/50 hover:bg-red-500 hover:text-white hover:border-red-500 text-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;