import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Sidebar';
import { getProfileAPI } from '../api/authApi';
import axiosClient from '../api/axiosClient';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const profileRes = await getProfileAPI();
        const user = profileRes?.user || profileRes;
        const userId = user?.id || user?.user_id;

        if (userId) {
          const bookingRes = await axiosClient.get(`/bookings/user/${userId}`);
          setBookings(bookingRes.data.data || bookingRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load booking history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const getStatusBadge = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized === 'confirmed' || normalized === 'completed') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (normalized === 'cancelled') {
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = bookings.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="fixed inset-0 flex flex-col h-dvh w-full bg-neutral-950 overflow-hidden select-none">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10
        bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]
        from-neutral-700 via-neutral-950 to-black"
      />

      {/* Top Navigation */}
      <header className="relative z-20 w-full shrink-0">
        <Sidebar />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 min-w-0 min-h-0 w-full overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
          {/* Header */}
          <div className="mb-6 pb-4 border-b border-neutral-800 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-5 bg-neutral-300 rounded-full"></span>
                <h1 className="text-2xl font-bold text-white tracking-wide font-serif">
                  Booking History
                </h1>
              </div>
              <p className="text-xs text-neutral-400 mt-1 ml-3">
                ประวัติการจองคิวเข้าชมสินค้าและสถานะการนัดหมายของคุณ
              </p>
            </div>
            {!loading && bookings.length > 0 && (
              <span className="text-xs text-neutral-500">
                ทั้งหมด {bookings.length} รายการ
              </span>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-8 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl text-center text-xs text-neutral-400">
              กำลังโหลดข้อมูลการจอง...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-8 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl text-center text-xs text-neutral-500">
              ยังไม่มีรายการจองคิวในขณะนี้
            </div>
          ) : (
            <>
              <div className="space-y-2.5 w-full">
                {currentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl hover:border-neutral-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-neutral-200 font-semibold text-sm">
                          {booking.product_name || 'ไม่ระบุรายการสินค้า'}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadge(
                            booking.status
                          )}`}
                        >
                          {booking.status || 'pending'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">
                        📍 {booking.location_name || 'ไม่ระบุสาขา'}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs border-t sm:border-t-0 border-neutral-800/80 pt-2 sm:pt-0 shrink-0">
                      <span className="text-neutral-200 font-medium">
                        📅 {booking.booking_date}
                      </span>
                      <span className="text-neutral-400 sm:mt-0.5">
                        🕒 {booking.booking_time ? booking.booking_time.slice(0, 5) : '--:--'} น.
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-6 select-none">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="w-8 h-8 flex items-center justify-center text-xs text-neutral-500"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-white text-neutral-950 font-bold shadow-md'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}