// src/components/OtpForm.jsx
import React from 'react';

export default function OtpForm({ otpValues, onOtpChange, onOtpKeyDown, onSubmit, onBack }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col items-center w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-black">OTP</h2>
      
      <div className="w-full text-left mb-1 pl-1">
        <span className="text-sm font-medium text-black">Sizes</span>
      </div>

      <div className="flex justify-between w-full mb-1">
        {otpValues.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={data}
            onChange={(e) => onOtpChange(e, index)}
            onKeyDown={(e) => onOtpKeyDown(e, index)}
            className="w-10 h-10 md:w-11 md:h-11 text-center text-lg bg-white/80 border border-gray-400 rounded-md focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-black shadow-sm transition-all duration-200"
          />
        ))}
      </div>

      <div className="w-full text-right mb-6 pr-1">
        <button type="button" className="text-xs font-semibold text-black hover:text-gray-600 transition-colors cursor-pointer">
          Code Again
        </button>
      </div>

      <button 
        type="submit" 
        className="bg-black text-white px-10 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 hover:scale-105 transition-all w-3/4 shadow-lg"
      >
        Confirm
      </button>

      <button 
        type="button" 
        onClick={onBack} 
        className="mt-6 bg-black text-white w-10 h-10 flex items-center justify-center rounded hover:bg-gray-800 hover:scale-105 shadow-md transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
    </form>
  );
}