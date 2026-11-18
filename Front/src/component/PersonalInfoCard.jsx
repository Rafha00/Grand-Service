import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export default function PersonalInfoCard({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
    });
  }, [user, isEditing]);

  useEffect(() => {
    const userId = user?.id || user?.user_id;
    if (!userId) {
      setLoadingBookings(false);
      return;
    }

    const fetchUserBookings = async () => {
      try {
        const res = await axiosClient.get(`/bookings/user/${userId}`);
        setBookings(res.data.data || res.data || []);
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to fetch booking history:', err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchUserBookings();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

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

  // คำนวณรายการและเลขหน้าสำหรับ Pagination (สูงสุด 5 แถวต่อหน้า)
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
    <div className="w-full max-w-3xl mx-auto text-white p-4">
      {/* ส่วนหัวข้อและการกดสลับโหมด */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-neutral-300 rounded-full"></span>
            <h3 className="text-xl font-bold text-white tracking-wide font-serif">Personal Information</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1 ml-3">Manage your personal details and contact info.</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-xl transition-all border border-neutral-700 shadow-lg cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
            Edit
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="px-4.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl transition-all border border-neutral-700 cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      {/* โหมดแสดงผลปกติ (View Mode) */}
      {!isEditing ? (
        <div className="space-y-2 w-full">
          {/* Full Name */}
          <div className="grid grid-cols-[220px_1fr] items-center py-3.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Full Name</span>
            </div>
            <div className="text-neutral-200 font-medium text-sm text-left">{user?.name || '-'}</div>
          </div>

          {/* Email Address */}
          <div className="grid grid-cols-[220px_1fr] items-center py-3.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Email</span>
            </div>
            <div className="text-neutral-200 font-medium text-sm text-left">{user?.email || '-'}</div>
          </div>

          {/* Phone Number */}
          <div className="grid grid-cols-[220px_1fr] items-center py-3.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Phone</span>
            </div>
            <div className="text-neutral-200 font-medium text-sm text-left">{user?.phone || '-'}</div>
          </div>
        </div>
      ) : (
        /* โหมดแก้ไขข้อมูล (Edit Mode) */
        <form onSubmit={handleSubmit} className="space-y-2 w-full">
          {/* Edit: Full Name */}
          <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Full Name</span>
            </div>
            <div className="max-w-sm">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500 transition-all text-left"
                required
              />
            </div>
          </div>

          {/* Readonly: Email */}
          <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl opacity-70">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Email</span>
            </div>
            <div className="text-neutral-400 text-sm text-left">
              {user?.email || '-'} <span className="text-[10px] italic text-neutral-500">(Locked)</span>
            </div>
          </div>

          {/* Edit: Phone */}
          <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Phone</span>
            </div>
            <div className="max-w-sm">
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500 transition-all text-left"
              />
            </div>
          </div>

          {/* ปุ่มกดบันทึก */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium text-xs rounded-xl transition-all border border-neutral-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* ส่วนแสดงประวัติและสถานะการจอง (Booking History) */}
      <div className="mt-10">
        <div className="mb-6 pb-4 border-b border-neutral-800 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-neutral-300 rounded-full"></span>
              <h3 className="text-xl font-bold text-white tracking-wide font-serif">Booking History</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1 ml-3">ประวัติการจองคิวเข้าชมสินค้าและสถานะการนัดหมายของคุณ</p>
          </div>
          {bookings.length > 0 && (
            <span className="text-xs text-neutral-500">
              ทั้งหมด {bookings.length} รายการ
            </span>
          )}
        </div>

        {loadingBookings ? (
          <div className="py-6 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl text-center text-xs text-neutral-400">
            กำลังโหลดข้อมูลการจอง...
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-6 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl text-center text-xs text-neutral-500">
            ยังไม่มีรายการจองคิวในขณะนี้
          </div>
        ) : (
          <>
            <div className="space-y-2 w-full">
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

            {/* แถบปุ่มเปลี่ยนหน้า (แสดงเมื่อมีมากกว่า 5 รายการ) */}
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
    </div>
  );
}