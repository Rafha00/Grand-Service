import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BookingModal from "./BookingModal";
import "@fortawesome/fontawesome-free/css/all.min.css";

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='42' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

const getAuthToken = () => {
  try {
    const rawToken = localStorage.getItem("token");
    if (!rawToken) return null;

    const trimmed = rawToken.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
};

const isLoggedIn = () => Boolean(getAuthToken());

// Detail Row
const DetailRow = ({ icon, label, value }) => (
  <div className="flex flex-col min-[420px]:flex-row min-[420px]:justify-between min-[420px]:items-center gap-1 min-[420px]:gap-3 py-2.5 px-3 rounded-lg bg-gray-50/80">
    <span className="text-gray-500 flex items-center gap-2 text-xs sm:text-sm shrink-0">
      <i className={`${icon} w-4 text-center text-red-600`}></i>
      {label}
    </span>

    <span className="font-semibold text-gray-800 text-xs sm:text-sm break-words min-w-0 min-[420px]:text-right">
      {value || "-"}
    </span>
  </div>
);

export default function ProductModal({ product, isOpen, onClose }) {
  const navigate = useNavigate();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  const handleCloseBooking = useCallback(() => {
    setIsBookingOpen(false);
  }, []);

  useEffect(() => {
    setActiveImageIndex(0);
    setIsBookingOpen(false);
    setIsLoginPopupOpen(false);
  }, [product, isOpen]);

  // Close Modal with ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key !== "Escape") return;

      if (isLoginPopupOpen) {
        setIsLoginPopupOpen(false);
        return;
      }
      if (!isBookingOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isBookingOpen, isLoginPopupOpen, onClose]);

  if (!isOpen || !product) return null;

  const isOutOfStock =
    typeof product.availableStock === "number" && product.availableStock <= 0;

  const images =
    Array.isArray(product.Product_Images) && product.Product_Images.length > 0
      ? product.Product_Images.map((img) => img.image_url).filter(Boolean)
      : [];

  const currentImage =
    images[activeImageIndex] || product.image || product.img || fallbackImage;

  const productForBooking = {
    ...product,
    image_url: currentImage,
  };

  // กด Booking: ถ้ายังไม่ login ให้ขึ้น popup login / ถ้าสินค้าหมดให้ไม่เปิด BookingModal
  const handleBookingClick = () => {
    if (isOutOfStock) {
      setIsBookingOpen(false);
      return;
    }

    if (!isLoggedIn()) {
      setIsBookingOpen(false);
      setIsLoginPopupOpen(true);
      return;
    }

    setIsBookingOpen(true);
  };

  const handleGoLogin = () => {
    setIsLoginPopupOpen(false);
    setIsBookingOpen(false);
    onClose();
    navigate("/login");
  };

  return (
    <>
      {/* Main Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Main Modal */}
        <div className="relative w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[96dvh] sm:max-h-[92dvh] min-h-0">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-700 rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* LEFT SIDE: IMAGES */}
          <div className="w-full lg:w-1/2 min-w-0 min-h-0 lg:border-r border-gray-100 bg-gray-50/80 p-4 sm:p-6 flex flex-col overflow-y-auto max-h-[44dvh] lg:max-h-none lg:flex-1">
            {/* Main Image */}
            <div className="relative w-full aspect-square max-h-[260px] sm:max-h-[340px] lg:max-h-[420px] mx-auto rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
              <img
                src={currentImage}
                alt={product.name || "Product image"}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
              />

              {/* Image Counter */}
              {images.length > 0 && (
                <div className="absolute bottom-3 right-3 bg-black/75 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  {activeImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-3 scrollbar-thin shrink-0">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-white ${
                      activeImageIndex === index
                        ? "border-black scale-105 shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`thumbnail-${index}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackImage;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* YouTube Video */}
            <div className="w-full mt-3 sm:mt-4 shrink-0">
              <div className="relative w-full aspect-video max-w-lg mx-auto overflow-hidden rounded-xl bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/pBDXSV8IcI8?si=YC7REqJn3JDxkiBx"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: PRODUCT DETAILS */}
          <div className="w-full lg:w-1/2 min-w-0 min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-white">
            {/* Brand */}
            <div className="flex items-center justify-between mb-4 pr-10">
              {product.brands?.name ? (
                <span className="px-3 py-1.5 text-xs font-bold tracking-wider text-white bg-gray-900 uppercase rounded-md shadow-sm">
                  {product.brands.name}
                </span>
              ) : (
                <span></span>
              )}
            </div>

            {/* Product Name */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center leading-tight mb-2 break-words">
              {product.name}
            </h2>

            {/* Model */}
            {product.model || product.sub_model ? (
              <p className="text-gray-500 font-medium text-xs sm:text-sm mb-4 text-center">
                {product.model || product.sub_model}
              </p>
            ) : null}

            {/* Price */}
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 pb-5 border-b border-gray-100 text-center">
              THB {Number(product.price || 0).toLocaleString()}
            </div>

            {/* Product Details */}
            <div className="space-y-2">
              <DetailRow
                icon="fa-solid fa-hashtag"
                label="รหัสอ้างอิง"
                value={product.reference_number}
              />

              <DetailRow
                icon="fa-brands fa-opencart"
                label="สภาพสินค้า"
                value={product.condition}
              />

              <DetailRow
                icon="fa-regular fa-calendar"
                label="ปีที่ผลิต"
                value={product.year}
              />

              <DetailRow
                icon="fa-solid fa-gear"
                label="ระบบกลไก"
                value={product.movement}
              />

              <DetailRow
                icon="fa-solid fa-down-left-and-up-right-to-center"
                label="ขนาดตัวเรือน"
                value={product.case_size}
              />

              <DetailRow
                icon="fa-regular fa-gem"
                label="วัสดุตัวเรือน"
                value={product.case_material}
              />

              <DetailRow
                icon="fa-solid fa-hourglass"
                label="การรับประกัน"
                value={product.warranty}
              />
            </div>

            {/* Booking Button */}
            <div className="pt-6 pb-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBookingClick}
                className={`w-full py-3 sm:py-3.5 px-6 font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                }`}
              >
                <i className="fa-regular fa-calendar-check mr-2"></i>
                {isOutOfStock ? "สินค้าหมด" : "Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Required Popup */}
      {isLoginPopupOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLoginPopupOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center"
          >
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-lock text-red-600 text-xl"></i>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              กรุณา Login
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              คุณต้องเข้าสู่ระบบก่อนจึงจะทำการจองสินค้าได้
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsLoginPopupOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleGoLogin}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingOpen && isLoggedIn() && !isOutOfStock && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={handleCloseBooking}
          selectedProduct={productForBooking}
        />
      )}
    </>
  );
}