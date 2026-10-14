import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Img009 from '../assets/009.png';
import Img007 from '../assets/007.png'
import Img008 from '../assets/008.png'
import Img006 from '../assets/006.png'

function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  
  // ดึงค่าตำแหน่ง index ที่ส่งมาจากหน้าแรก ถ้าไม่มีให้ใช้ค่าเริ่มต้นเป็น 0 (Rolex)
  const targetIndex = location.state?.index ?? 0;

  // เพิ่ม cardImage แยกรูปภาพของแต่ละแบรนด์ตรงนี้
  const brandsList = [
    {
      name: "Rolex",
      description: "นาฬิกาสุดหรูระดับโลกที่มีประวัติศาสตร์ยาวนาน",
      bgImage: "https://unsplash.com", 
      cardImage: Img009, // รูป Rolex
      styles: {
        bgGradient: "linear-gradient(rgba(6, 18, 12, 0.92), rgba(3, 10, 6, 0.98))",
        accentText: "from-amber-200 via-yellow-400 to-amber-500", 
        fontFamily: "font-serif", 
        footerBorder: "border-amber-500/10"
      }
    },
    {
      name: "Grand Seiko",
      description: "ความประณีตระดับสูงสุดจากช่างฝีมือชาวญี่ปุ่น",
      bgImage: "https://unsplash.com",
      cardImage: Img007, // รูป Grand Seiko
      styles: {
        bgGradient: "linear-gradient(rgba(12, 16, 26, 0.92), rgba(5, 7, 12, 0.98))",
        accentText: "from-slate-100 via-indigo-200 to-blue-400", 
        fontFamily: "font-sans", 
        footerBorder: "border-indigo-500/10"
      }
    },
    {
      name: "Casio",
      description: "ตลาดซื้อขายนาฬิกาที่ใหญ่ที่สุดในโลก",
      bgImage: "https://unsplash.com",
      cardImage: Img006, // รูป Chrono24
      styles: {
        bgGradient: "linear-gradient(rgba(24, 18, 12, 0.92), rgba(12, 8, 5, 0.98))",
        accentText: "from-orange-200 via-amber-300 to-orange-400", 
        fontFamily: "font-sans", 
        footerBorder: "border-orange-500/10"
      }
    },
    {
      name: "Patek Philippe",
      description: "ที่สุดแห่งความหรูหราและกลไกซับซ้อนที่ประเมินค่าไม่ได้",
      bgImage: "https://unsplash.com",
      cardImage: Img008, // รูป Patek Philippe
      styles: {
        bgGradient: "linear-gradient(rgba(20, 15, 20, 0.92), rgba(10, 5, 10, 0.98))",
        accentText: "from-rose-200 via-pink-300 to-rose-400", 
        fontFamily: "font-serif", 
        footerBorder: "border-rose-500/10"
      }
    }
  ];

  const currentBrand = brandsList[targetIndex] || brandsList[0];

  return (
    <div 
      className={`w-screen min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-between p-10 md:p-16 text-white relative select-none overflow-x-hidden transition-all duration-700 ${currentBrand.styles.fontFamily}`}
      style={{ backgroundImage: `${currentBrand.styles.bgGradient}, url(${currentBrand.bgImage})` }}
    >
      {/* HEADER SECTION */}
      <header className="flex justify-between items-center w-full relative z-10 px-2 md:px-6">
        <Link to="/home" className="text-xl font-bold tracking-tight hover:opacity-80 transition">
          {currentBrand.name}
        </Link>
      </header>

      {/* MAIN CONTENT */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-1 my-10 relative z-10 w-full px-2 md:px-60">
        
        {/* ฝั่งซ้าย: ข้อความ */}
        <div className="flex flex-col items-start text-left max-w-2xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-none mb-6">
            Collect your <br />
            own <span className={`font-semibold text-transparent bg-clip-text bg-gradient-to-r ${currentBrand.styles.accentText}`}>{currentBrand.name.toLowerCase()}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 font-normal leading-relaxed tracking-wide">
            {currentBrand.description}
          </p>
        </div>

        {/* ฝั่งขวา: เปลี่ยนมาเรียกใช้ currentBrand.cardImage แทน Img009 ตัวเดียว */}
        <div className="flex justify-center lg:justify-end items-center relative w-full h-[600px] ">
          <img src={currentBrand.cardImage} alt={currentBrand.name} className="max-h-full object-contain drop-shadow-2xl" />
        </div>

      </main>

      {/* FOOTER SECTION */}
      <footer className={`flex gap-16 items-center justify-start w-full relative z-10 border-t pt-8 transition-colors px-2 md:px-6 ${currentBrand.styles.footerBorder}`}>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-bold tracking-tight">3Y</span>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-none block max-w-[70px]">Waranty</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-bold tracking-tight">Brand</span>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-none block max-w-[70px]">new condition</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-bold tracking-tight">System</span>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-none block max-w-[70px]">Mechanical</span>
        </div>
      </footer>
    </div>
  );
}

export default ProductDetail;