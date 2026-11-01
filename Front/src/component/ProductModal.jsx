import React, { useState, useEffect } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='42' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductModal({ product, isOpen, onClose }) {
    // รีเซ็ต index รูปภาพหลักเมื่อเปลี่ยนสินค้าหรือเปิด Modal ใหม่
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [product]);

    if (!isOpen || !product) return null;

    // ดึงรูปภาพทั้งหมดจาก Product_Images (รองรับหลายรูปภาพ)
    const images = Array.isArray(product.Product_Images) && product.Product_Images.length > 0
        ? product.Product_Images.map((img) => img.image_url).filter(Boolean)
        : [];

    const currentImage = images[activeImageIndex] || fallbackImage;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            {/* กล่อง Modal หลัก */}
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                
                {/* ปุ่มปิด Modal (X) */}
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 bg-gray-200 hover:bg-red-500 text-black rounded-full p-2 transition-colors cursor-pointer"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* ฝั่งซ้าย: รูปภาพหลักและรูปภาพย่อย */}
                <div className="w-full md:w-1/2 p-6 flex flex-col bg-gray-50 border-r border-gray-100">
                    {/* รูปภาพหลักขนาดใหญ่ */}
                    <div className="relative w-full h-72 md:h-80 rounded-xl overflow-hidden bg-gray-200 shadow-inner mb-4">
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
                        {/* ตัวเลขบอกตำแหน่งรูปภาพ  */}
                        {images.length > 0 && (
                            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                                {activeImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>

                    {/* แถบรูปภาพย่อย (Thumbnails) รองรับหลายรูปภาพ */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                        activeImageIndex === index ? "border-pink-500 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    <img src={img} alt={`thumbnail-${index}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                            
                        </div>
                    )}
                </div>
                       
                {/* ฝั่งขวา: ข้อมูลรายละเอียดสินค้าตามฟิลด์ Model */}
                <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between ">
                    <div>
                        <span class=" text-4xl  "><i className="fa-solid fa-shield-halved" style={{color: 'rgb(235, 17, 17)'}}></i></span>
                        
                        <br />
                       
                      
                         {/* ป้ายชื่อแบรนด์ */}  
                        {product.brands?.name && (
                            <span className="inline-block mb-2 px-2 py-0.5 text-xs font-semibold text-white bg-black rounded-md">
                                {product.brands.name}
                            </span>
                            
                        )}
                       
                       
                          
                       
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h2>
                        
                       
                        <p className="text-pink-600 font-semibold text-sm mb-4">
                            {product.model || product.sub_model || ""}
                        </p>

                       
                        <div className="text-3xl font-extrabold text-black mb-6">
                            THB  {Number(product.price || 0).toLocaleString()}
                        </div>

                        {/* ตารางแสดงข้อมูลรายละเอียดสินค้า */}
                        <div className="space-y-3 text-sm border-t border-black pt-4">
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500"><i className="fa-solid fa-hashtag" style={{ color: 'rgb(235, 17, 17)' }}></i> รหัสอ้างอิง (Reference)</span>
                            <span className="font-medium text-black text-center w-20 inline-block bg-blue-300 rounded-md py-1">{product.reference_number || "-"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500"><i className="fa-brands fa-opencart" style={{ color: 'rgb(235, 17, 17)' }}></i> สภาพสินค้า</span>
                            <span className="font-medium text-black text-center w-20 inline-block bg-blue-300 rounded-md py-1">{product.condition || "-"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500"><i className="fa-regular fa-calendar" style={{ color: 'rgb(235, 17, 17)' }}></i> ปีที่ผลิต</span>
                            <span className="font-medium text-black text-center w-20 inline-block bg-blue-300 rounded-md py-1">{product.year || "-"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500"><i className="fa-solid fa-gear" style={{ color: 'rgb(235, 17, 17)' }}></i> ระบบกลไก (Movement)</span>
                            <span className="font-medium text-black text-center w-20 inline-block bg-blue-300 rounded-md py-1">{product.movement || "-"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500"> <i className="fa-solid fa-down-left-and-up-right-to-center" style={{ color: 'rgb(235, 17, 17)' }}></i> ขนาดตัวเรือน</span>
                            <span className="font-medium text-black text-center w-20 inline-block bg-blue-300 rounded-md py-1">{product.case_size || "-"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500"><i className="fa-regular fa-gem" style={{ color: 'rgb(235, 17, 17)' }}></i> วัสดุตัวเรือน</span>
                            <span className="font-medium text-black text-center w-20 inline-block bg-blue-300 rounded-md py-1">{product.case_material || "-"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500"><i className="fa-solid fa-hourglass" style={{ color: 'rgb(235, 17, 17)' }}></i> การรับประกัน</span>
                            <span className="font-medium text-black text-center w-20 inline-block bg-blue-300 rounded-md py-1">{product.warranty || "-"}</span>
                        </div>
                    </div>
                    </div>
                </div>

            </div>
        </div>
    );
}