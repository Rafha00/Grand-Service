
import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';

import Img009 from '../assets/009.png';
import Img007 from '../assets/007.png';
import Img008 from '../assets/008.png';
import Img006 from '../assets/006.png';

import BookingModal from '../component/BookingModal';

function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();

  // State สำหรับเปิด-ปิด Popup จองคิว
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // ดึง Index ของแบรนด์
  const targetIndex = location.state?.index ?? 0;

  // ---------- Brand Data ----------
  const brandsList = [
    {
      name: "Rolex",
      description: "นาฬิกาสุดหรูระดับโลกที่มีประวัติศาสตร์ยาวนาน",
      bgImage: "https://unsplash.com",
      cardImage: Img009,
      styles: {
        bgGradient: "linear-gradient(rgba(6, 18, 12, 0.92), rgba(3, 10, 6, 0.98))",
        accentText: "from-amber-200 via-yellow-400 to-amber-500",
        buttonBg: "bg-amber-400 hover:bg-amber-300 text-black",
        fontFamily: "font-serif",
        footerBorder: "border-amber-500/10"
      }
    },
    {
      name: "Grand Seiko",
      description: "ความประณีตระดับสูงสุดจากช่างฝีมือชาวญี่ปุ่น",
      bgImage: "https://unsplash.com",
      cardImage: Img007,
      styles: {
        bgGradient: "linear-gradient(rgba(12, 16, 26, 0.92), rgba(5, 7, 12, 0.98))",
        accentText: "from-slate-100 via-indigo-200 to-blue-400",
        buttonBg: "bg-indigo-300 hover:bg-indigo-200 text-black",
        fontFamily: "font-sans",
        footerBorder: "border-indigo-500/10"
      }
    },
    {
      name: "Casio",
      description: "ตลาดซื้อขายนาฬิกาที่ใหญ่ที่สุดในโลก",
      bgImage: "https://unsplash.com",
      cardImage: Img006,
      styles: {
        bgGradient: "linear-gradient(rgba(24, 18, 12, 0.92), rgba(12, 8, 5, 0.98))",
        accentText: "from-orange-200 via-amber-300 to-orange-400",
        buttonBg: "bg-amber-300 hover:bg-amber-200 text-black",
        fontFamily: "font-sans",
        footerBorder: "border-orange-500/10"
      }
    },
    {
      name: "Patek Philippe",
      description: "ที่สุดแห่งความหรูหราและกลไกซับซ้อนที่ประเมินค่าไม่ได้",
      bgImage: "https://unsplash.com",
      cardImage: Img008,
      styles: {
        bgGradient: "linear-gradient(rgba(20, 15, 20, 0.92), rgba(10, 5, 10, 0.98))",
        accentText: "from-rose-200 via-pink-300 to-rose-400",
        buttonBg: "bg-rose-300 hover:bg-rose-200 text-black",
        fontFamily: "font-serif",
        footerBorder: "border-rose-500/10"
      }
    }
  ];

  // ---------- Current Brand ----------
  const currentBrand = brandsList[targetIndex] || brandsList[0];

  // ---------- Product Data ----------
  const productToBook = {
    id: id || null,
    name: currentBrand.name,
    img: currentBrand.cardImage,
    price: 0
  };

  return (
    <div
      className={`w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col text-white relative select-none overflow-x-hidden transition-all duration-700 ${currentBrand.styles.fontFamily}`}
      style={{
        backgroundImage: `${currentBrand.styles.bgGradient}, url(${currentBrand.bgImage})`
      }}
    >

      {/* ---------- HEADER ---------- */}
      <header className="w-full relative z-10 px-5 sm:px-8 md:px-12 lg:px-16 pt-6 sm:pt-8">

        <div className="max-w-7xl mx-auto flex justify-between items-center">

          <Link
            to="/home"
            className="text-xl sm:text-2xl font-bold tracking-tight hover:opacity-80 transition"
          >
            {currentBrand.name}
          </Link>

        </div>

      </header>

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-12 lg:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 xl:gap-20 items-center">

          {/* ---------- LEFT: TEXT ---------- */}
          <div className="flex flex-col items-start text-left w-full max-w-2xl mx-auto lg:mx-0">

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-normal tracking-tight leading-[1.1] mb-5 sm:mb-6">

              Collect your
              <br />

              own

              <span className={`block sm:inline font-semibold text-transparent bg-clip-text bg-gradient-to-r ${currentBrand.styles.accentText}`}>
                {" "}{currentBrand.name.toLowerCase()}
              </span>

            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-400 font-normal leading-relaxed tracking-wide mb-7 sm:mb-8 max-w-lg">

              {currentBrand.description}

            </p>

            {/* Book Appointment Button */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer ${currentBrand.styles.buttonBg}`}
            >
              Book Appointment
            </button>

          </div>

          {/* ---------- RIGHT: WATCH IMAGE ---------- */}
          <div className="flex justify-center items-center relative w-full h-[300px] sm:h-[400px] md:h-[480px] lg:h-[520px] xl:h-[600px]">

            <img
              src={currentBrand.cardImage}
              alt={currentBrand.name}
              className="w-full h-full max-w-[500px] object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
            />

          </div>

        </div>

      </main>

      {/* ---------- FOOTER ---------- */}
      <footer
        className={`w-full relative z-10 border-t py-6 sm:py-8 px-5 sm:px-8 md:px-12 lg:px-16 transition-colors ${currentBrand.styles.footerBorder}`}
      >

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">

          {/* Warranty */}
          <div className="flex items-center justify-center sm:justify-start gap-2">

            <span className="text-3xl sm:text-4xl font-bold tracking-tight">
              3Y
            </span>

            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-tight max-w-[70px]">
              Warranty
            </span>

          </div>

          {/* Condition */}
          <div className="flex items-center justify-center gap-2">

            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              Brand
            </span>

            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-tight max-w-[80px]">
              New Condition
            </span>

          </div>

          {/* Movement */}
          <div className="flex items-center justify-center sm:justify-end gap-2">

            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              System
            </span>

            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-tight max-w-[80px]">
              Mechanical
            </span>

          </div>

        </div>

      </footer>

      {/* ---------- BOOKING MODAL ---------- */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedProduct={productToBook}
      />

    </div>
  );
}

export default ProductDetail;
