import React, { useState, useEffect } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='42' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductModal({ product, isOpen, onClose }) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [product]);

    if (!isOpen || !product) return null;

    const images = Array.isArray(product.Product_Images) && product.Product_Images.length > 0
        ? product.Product_Images.map((img) => img.image_url).filter(Boolean)
        : [];

    const currentImage = images[activeImageIndex] || fallbackImage;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            {/* กล่อง Modal หลัก */}
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                
                {/* ปุ่มปิด Modal (X) */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-700 rounded-full p-2.5 transition-all duration-200 cursor-pointer shadow-sm"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* ฝั่งซ้าย: รูปภาพหลักและรูปภาพย่อย */}
                <div className="w-full md:w-1/2 p-6 flex flex-col bg-gray-50/80 border-r border-gray-100 justify-between">
                    <div>
                        {/* รูปภาพหลักขนาดใหญ่ */}
                        <div className="relative w-full h-72 md:h-80 rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100 mb-4 flex items-center justify-center">
                            <img 
                                src={currentImage} 
                                alt={product.name || "Product image"} 
                                className="w-full h-full object-cover object-center"
                                onError={(e) => {
                                    if (e.currentTarget.src !== fallbackImage) {
                                        e.currentTarget.src = fallbackImage;
                                    }
                                }}
                            />
                            {images.length > 0 && (
                                <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium">
                                    {activeImageIndex + 1} / {images.length}
                                </div>
                            )}
                        </div>

                        {/* แถบรูปภาพย่อย (Thumbnails) */}
                        {images.length > 1 && (
                            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImageIndex(index)}
                                        className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-white shadow-sm ${
                                            activeImageIndex === index ? "border-black scale-105 shadow-md" : "border-transparent opacity-75 hover:opacity-100"
                                        }`}
                                    >
                                        <img src={img} alt={`thumbnail-${index}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ฝั่งขวา: ข้อมูลรายละเอียดสินค้า */}
                <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between bg-white">
                    <div>
                        {/* ส่วนหัว: แบรนด์และไอคอน */}
                        <div className="flex items-center justify-between mb-3">
                            {product.brands?.name ? (
                                <span className="px-3 py-1 text-xs font-bold tracking-wider text-white bg-gray-900 uppercase rounded-md shadow-sm">
                                    {product.brands.name}
                                </span>
                            ) : (
                                <span></span>
                            )}
                            
                        </div>

                        {/* ชื่อและรุ่นสินค้า */}
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{product.name}</h2>
                        {product.model || product.sub_model ? (
                            <p className="text-gray-500 font-medium text-sm mb-4">
                                {product.model || product.sub_model}
                            </p>
                        ) : null}

                        {/* ราคา */}
                        <div className="text-3xl font-extrabold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                            THB {Number(product.price || 0).toLocaleString()}
                        </div>

                        {/* ตารางแสดงข้อมูลรายละเอียดสินค้า */}
                        <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-gray-50/60">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <i className="fa-solid fa-hashtag w-4 text-center text-red-600"></i> รหัสอ้างอิง
                                </span>
                                <span className="font-semibold text-gray-800 bg-white px-3 py-1 rounded-md shadow-2xs border border-gray-100">
                                    {product.reference_number || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-gray-50/60">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <i className="fa-brands fa-opencart w-4 text-center text-red-600"></i> สภาพสินค้า
                                </span>
                                <span className="font-semibold text-gray-800 bg-white px-3 py-1 rounded-md shadow-2xs border border-gray-100">
                                    {product.condition || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-gray-50/60">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <i className="fa-regular fa-calendar w-4 text-center text-red-600"></i> ปีที่ผลิต
                                </span>
                                <span className="font-semibold text-gray-800 bg-white px-3 py-1 rounded-md shadow-2xs border border-gray-100">
                                    {product.year || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-gray-50/60">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <i className="fa-solid fa-gear w-4 text-center text-red-600"></i> ระบบกลไก
                                </span>
                                <span className="font-semibold text-gray-800 bg-white px-3 py-1 rounded-md shadow-2xs border border-gray-100">
                                    {product.movement || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-gray-50/60">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <i className="fa-solid fa-down-left-and-up-right-to-center w-4 text-center text-red-600"></i> ขนาดตัวเรือน
                                </span>
                                <span className="font-semibold text-gray-800 bg-white px-3 py-1 rounded-md shadow-2xs border border-gray-100">
                                    {product.case_size || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-gray-50/60">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <i className="fa-regular fa-gem w-4 text-center text-red-600"></i> วัสดุตัวเรือน
                                </span>
                                <span className="font-semibold text-gray-800 bg-white px-3 py-1 rounded-md shadow-2xs border border-gray-100">
                                    {product.case_material || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-gray-50/60">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <i className="fa-solid fa-hourglass w-4 text-center text-red-600"></i> การรับประกัน
                                </span>
                                <span className="font-semibold text-gray-800 bg-white px-3 py-1 rounded-md shadow-2xs border border-gray-100">
                                    {product.warranty || "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}