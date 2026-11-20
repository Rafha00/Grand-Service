import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutAPI, getProfileAPI } from '../api/authApi'; // เช็ค Path ให้ตรงกับโครงสร้างของคุณ
import AdminMenuLink from '../admin/AdminMenuLink';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // null = กำลังเช็ค, true = login แล้ว, false = ยังไม่ login
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // login อยู่ไหม ทุกครั้งที่เปลี่ยนหน้า
  //  login เสร็จแล้ว navigate('/')
  useEffect(() => {
    let cancelled = false;

    getProfileAPI()
      .then(() => {
        if (!cancelled) setIsLoggedIn(true);
      })
      .catch(() => {
        if (!cancelled) setIsLoggedIn(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // ปิด Dropdown และ Mobile Menu 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('.hamburger-btn')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ฟังก์ชันออกจากระบบ
  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggedIn(false);
      setIsDropdownOpen(false);
      navigate('/login');
    }
  };

  const navLinkClass =
    'relative text-white transition-colors duration-300 hover:text-red-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-red-300 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100';

  return (
    <nav className="text-white relative sticky top-0 z-50 bg-[#0B0B0C]/80 backdrop-blur-md">
      {/* แถบหลักของ Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4">

        {/*  โลโก้ด้านซ้าย */}
        <Link
          to="/"
          className="text-xl md:text-2xl font-serif font-bold tracking-widest hover:text-red-300 transition-colors"
        >
          GRAND SERVICE
        </Link>

        {/* เมนูตรงกลาง  */}
        <div className="hidden md:flex items-center gap-8 lg:gap-15 px-4">
          <Link to="/" className={navLinkClass}>HOME</Link>
          <Link to="/product" className={navLinkClass}>PRODUCT</Link>
          <Link to="/about" className={navLinkClass}>ABOUT</Link>
        </div>

        {/* โซนปุ่มฝั่งขวา */}
        <div className="flex items-center space-x-3 md:space-x-5">

          {isLoggedIn === null ? null : isLoggedIn ? (
              <>
                <div className="relative w-9 h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center border border-gray-400 cursor-pointer hover:bg-gray-100 shadow-sm text-base md:text-lg transition-colors">
                  <i className="fa-regular fa-bell" style={{ color: 'rgb(255, 212, 59)' }}></i>
                </div>

                <div className="relative" ref={dropdownRef}>
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-9 h-9 md:w-10 md:h-10 bg-black text-white rounded-full flex items-center justify-center border-2 border-transparent hover:border-white cursor-pointer shadow-sm text-base md:text-lg transition-all"
                  >
                    <i className="fa-regular fa-user" style={{ color: 'rgb(238, 238, 240)' }}></i>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-200">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors font-medium text-center"
                      >
                        Profile
                      </Link>
                      <AdminMenuLink
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors font-medium text-center"
                      />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <span className="mr-2">
                          <i className="fa-solid fa-arrow-right-from-bracket" style={{ color: 'rgb(222, 4, 4)' }}></i>
                        </span>{' '}
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
            /* ยังไม่ได้ login  แสดงปุ่ม LOGIN */
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium border border-white rounded-full hover:bg-white hover:text-black transition-colors"
            >
              LOGIN
            </Link>
          )}

          {/* ปุ่ม Hamburger Menu  */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="hamburger-btn block md:hidden p-2 focus:outline-none text-white hover:text-red-300 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

        </div>
      </div>

      {/*  กล่องเมนูสไลด์ลงมาสำหรับมือถือ */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-[#0B0B0C] rounded-2xl border-t border-gray-700 absolute top-full left-0 w-full z-40 shadow-xl"
        >
          <div className="flex flex-col py-3 px-6 space-y-3 font-medium">
            <Link to="/home" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-red-300 transition-colors border-b border-gray-700/50">Home</Link>
            <Link to="/product" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-red-300 transition-colors border-b border-gray-700/50">Product</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-red-300 transition-colors">About</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

