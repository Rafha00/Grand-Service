import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutAPI } from '../api/authApi';
import Swal from 'sweetalert2';
import AdminMenuLink from '../admin/AdminMenuLink';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
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

  const getNavClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? 'py-2 px-4 bg-white/10 rounded-xl transition-all text-white flex items-center gap-2 text-sm font-medium shadow-inner border border-white/5'
      : 'py-2 px-4 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-gray-100 flex items-center gap-2 text-sm font-medium';
  };

  return (
    <div className="w-full bg-[#0a0a0a] text-white flex flex-wrap items-center justify-between gap-4 px-6 lg:px-10 py-3.5 border-b border-gray-800">
      <div className="flex items-center gap-6 sm:gap-10">
        <Link to="/home" className="text-left block">
          <h2 className="text-xl font-serif font-semibold tracking-widest uppercase leading-none">
            Grand
          </h2>
          <p className="text-[9px] text-gray-400 tracking-[0.3em] mt-1">
            SERVICE
          </p>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link to="/home" className={getNavClass('/home')}>
            Home
          </Link>
          <Link to="/profile" className={getNavClass('/profile')}>
            Profile
          </Link>
          <Link to="/booking-history" className={getNavClass('/booking-history')}>
            Booking History
          </Link>

          <AdminMenuLink className="py-2 px-4 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-gray-100 flex items-center gap-2 text-sm font-medium" />
        </nav>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="py-2 px-4 rounded-xl transition-all text-red-400 font-medium flex items-center gap-2 border border-red-900/50 hover:bg-red-500 hover:text-white hover:border-red-500 text-sm cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;