import React, { useState, useEffect } from 'react';
import Img009 from '../assets/009.png'
import { Link } from 'react-router-dom';

import {getBrands} from '../api/brandsAPI'
import Navbar from '../layout/Navbar.';



export default function Home () {

  const [brandsData, setBrandsData] = useState([]);

 useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBrands();
        console.log("API response", data);
        
        //  จัดการข้อมูลให้ปลอดภัย: ตรวจสอบว่าเป็น Array หรือไม่ หรือดึงค่าข้างใน Object ออกมา
        if (Array.isArray(data)) {
          setBrandsData(data);
        } else if (data && typeof data === 'object') {
          // ถ้า Backend ส่งมาเป็น Object ที่ครอบ Array อยู่ (เช่น data.brands หรือ data.data) ให้ปรับคีย์ให้ตรงกับ Backend ของคุณ
          const arrayData = data.brands || data.data || Object.values(data);
          setBrandsData(Array.isArray(arrayData) ? arrayData : []);
        } else {
          setBrandsData([]);
        }

      } catch (error) {
        console.error("Error fetching brands", error);
      }
    };
    fetchBrands();
  }, []);

  
  return (
    <div >
      < Navbar />
      
      {/* แทรก Style สำหรับฟอนต์ และ Animation คล้ายใน HTML ต้นฉบับ */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .font-sans {
          font-family: 'Inter', sans-serif;
        }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}} />

    

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-24 py-12 relative z-10">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[75vh]">
          
          {/* Text Content Block */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start justify-center">
            {/* Subtitle / Eyebrow */}
            <p className="text-gray-400 font-light tracking-widest text-sm sm:text-base uppercase">
              Introducing the new
            </p>
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-tight">
              Fitbit Versa <br className="hidden sm:inline" />
              <span className="font-normal text-gray-200">Watch</span>
            </h1>
            
            {/* Short Description */}
            <p className="text-gray-400 font-light text-base sm:text-lg max-w-md leading-relaxed pt-2">
              Elevate your everyday health and fitness tracking with advanced insights, sleek modern aesthetics, and seamless connectivity.
            </p>
            
            {/* Action Button */}
            <div className="pt-6">
              <Link
              to='/product'
              className='inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black font-medium text-sm rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-white/5'>
             
                
                <span>Explore Product</span>
                <i className="fa-solid font-light fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </div>

          {/* Visual Graphic / Smartwatch SVG Showcase */}
          <div className="lg:col-span-6 flex justify-center items-center relative">
            <div className="relative w-full max-w-[420px] lg:max-w-[500px] aspect-square flex items-center justify-center">
              <div className="w-full h-full animate-float flex items-center justify-center">
                
                          <div class="lg:col-span-6 flex justify-center items-center relative">
              {/* <!-- กรอบ container สำหรับจัดรูปภาพ พร้อมใส่ Animation ลอย (animate-float) --> */}
              <div class="relative w-full max-w-[420px] lg:max-w-[500px] aspect-square flex items-center justify-center animate-float">
                  
                  {/* <!-- ใช้ img tag ดึงรูปภาพเข้ามาแสดงผล --> */}
                  <img src={Img009} alt="Fitbit Versa Watch" class="w-full h-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]" />

              </div>
          </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Social Media Aside Sidebar */}
      <aside className="fixed left-6 bottom-8 hidden md:flex flex-col gap-5 text-gray-500 z-20">
        <a href="#" className="hover:text-white transition-colors duration-200 text-sm" aria-label="Facebook">
          <i className="fa-brands fa-facebook-f"></i>
        </a>
        <a href="#" className="hover:text-white transition-colors duration-200 text-sm" aria-label="Twitter">
          <i className="fa-brands fa-twitter"></i>
        </a>
        <a href="#" className="hover:text-white transition-colors duration-200 text-sm" aria-label="Instagram">
          <i className="fa-brands fa-instagram"></i>
        </a>
        <a href="#" className="hover:text-white transition-colors duration-200 text-sm" aria-label="Google">
          <i className="fa-brands fa-google"></i>
        </a>
      </aside>
                    
                    
                 {/* ห่อหุ้มทุกอย่างด้วย div ควบคุมความกว้างและจัดกึ่งกลางหน้าจอ */}
<div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12">
    <h1 className='text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-tight mt-12'>
        THE BASE BRANDS
    </h1>
                
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-40 items-end">
        {(() => {
            const fixedBackgrounds = [
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGU0PfSKb3lElzyD6vc6BcDy2tiexPTaOC3YvSrR4ay4GySyNyWWgQlsw&s=10",
                "https://www.fratellowatches.com/wp-content/uploads/2017/05/Grand-Seiko-Spring-Drive-8-Day-1122.jpg",
                "https://img.chrono24.com/images/uhren/48832214-ixta2k7qnlzbc09u6zsm1a9b-ExtraLarge.jpg",
                "https://watchworldwide.net/wp-content/uploads/2026/04/PP_5810_1G-001_LIFESTYLE2.jpg"
            ];

            const translateClasses = [
                "lg:translate-y-0 hover:-translate-y-2",
                "lg:-translate-y-8 hover:-translate-y-10", 
                "lg:-translate-y-16 hover:-translate-y-18", 
                "lg:-translate-y-24 hover:-translate-y-26"  
            ];

            return brandsData.slice(0, 4).map((item, index) => (
                <Link 
                   to={{
                    pathname: `/product/${item.name.toLowerCase().replace(/\s+/g, '-')}`,
                  }}
                    state={{ index: index }}
                    key={item.id}
                    className={`block transition-all duration-300 w-full ${translateClasses[index] || ""}`}
                >
                    <div 
                        style={{ backgroundImage: `url(${fixedBackgrounds[index]})` }}
                        className="w-full h-[420px] bg-cover bg-center bg-no-repeat rounded-2xl p-6 relative flex flex-col justify-between shadow-xl cursor-pointer"
                    >
                        {/* logo brand */}
                        <img src={item.logo_url} alt={item.name} className="w-20 h-20 object-contain" />
                    </div>
                </Link>
            ));
        })()}
    </div>
</div>
        



    </div>
  );
}


