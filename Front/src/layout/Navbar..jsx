import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutAPI } from '../api/authApi'; // เช็ค Path ให้ตรงกับโครงสร้างของคุณ

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ปิด Dropdown อัตโนมัติเมื่อคลิกพื้นที่อื่นนอกเมนู
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ฟังก์ชันออกจากระบบ
  const handleLogout = async () => {
    try {
      await logoutAPI(); // เรียก API เคลียร์ Cookie ฝั่ง Backend
      navigate('/login'); // ย้ายกลับไปหน้า Login
    } catch (error) {
      console.error('Logout failed:', error);
      // ถึงแม้ API จะขัดข้อง ก็บังคับพากลับไปหน้า Login เพื่อความปลอดภัย
      navigate('/login'); 
    }
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#c4c4c4] text-black shadow-md z-40 relative">
      {/* โลโก้ด้านซ้าย */}
      <Link to="/home" className="text-2xl font-serif font-bold text-gray-800 tracking-widest hover:text-black transition-colors">
        GRAND SERVICE
      </Link>

      {/* เมนูด้านขวา */}
      <div className="flex items-center space-x-5">
        
        {/* ไอคอนแจ้งเตือน */}
        <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-400 cursor-pointer hover:bg-gray-100 shadow-sm text-lg transition-colors">
          🔔
        </div>

        {/* ================= Dropdown บัญชีผู้ใช้ ================= */}
        <div className="relative" ref={dropdownRef}>
          
          {/* ปุ่มไอคอนโปรไฟล์ (ตัวเปิด/ปิด Dropdown) */}
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center border-2 border-transparent hover:border-white cursor-pointer shadow-sm text-lg transition-all"
          >
            👤
          </div>

          {/* กล่องเมนู Dropdown (เหลือแค่ออกจากระบบ) */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-200 transform transition-all duration-200">
              
              <button 
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <span className="mr-2">🚪</span> ออกจากระบบ
              </button>

            </div>
          )}
          
        </div>
        {/* ================= สิ้นสุด Dropdown ================= */}

      </div>
    </nav>
  );
}