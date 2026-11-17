// src/components/OtpForm.jsx
import React from 'react';

export default function OtpForm({ otpValues, onOtpChange, onOtpKeyDown, onSubmit, onBack }) {
  return (
    <form onSubmit={onSubmit} className="w-full relative z-10">
      
      {/* ช่องกรอก OTP 6 ช่อง */}
      <div className="flex justify-between space-x-2 my-6">
        {otpValues.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={data}
            onChange={(e) => onOtpChange(e, index)}
            onKeyDown={(e) => onOtpKeyDown(e, index)}
            className="w-12 h-14 bg-[#151515] border border-[#2a2a2a] rounded-xl text-center text-white text-lg font-bold focus:outline-none focus:border-gray-400 focus:bg-[#1a1a1a] transition-all shadow-inner"
          />
        ))}
      </div>

      {/* ปุ่มส่งรหัสอีกครั้ง (Code Again) */}
      <div className="w-full text-right mb-6 pr-1">
        <button 
          type="button" 
          className="text-xs text-gray-400 hover:text-white transition-colors underline decoration-gray-600 underline-offset-4 cursor-pointer"
        >
          Code Again
        </button>
      </div>

      {/* ปุ่มยืนยัน (Confirm Button) */}
      <button 
        type="submit" 
        className="w-full bg-white text-black py-4 rounded-full text-sm font-bold flex justify-center items-center space-x-2 hover:bg-gray-200 hover:scale-[1.02] transition-all shadow-md cursor-pointer"
      >
        <span>Confirm</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>

      {/* ปุ่มย้อนกลับ (Back Button) */}
      <div className="mt-6 flex justify-center">
        <button 
          type="button" 
          onClick={onBack} 
          className="cursor-pointer bg-[#151515] text-gray-300 border border-[#2a2a2a] w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#222] hover:text-white hover:scale-105 shadow-md transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>
    </form>
  );
}