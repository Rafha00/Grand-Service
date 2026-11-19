import { useState, useEffect, useRef } from 'react';
import axiosClient from '../api/axiosClient';

export default function NotificationBell({ customerId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  // ปิด Dropdown อัตโนมัติเมื่อคลิกนอกกล่อง
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ดึงแจ้งเตือนของ User
  const fetchNotifications = async () => {
    if (!customerId) return;
    try {
      const res = await axiosClient.get(`/notifications/${customerId}`);
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (!customerId) return;
    fetchNotifications();
    
    // Polling เช็คแจ้งเตือนใหม่ทุก 15 วินาที
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [customerId]);

  // กดเพื่ออ่านทีละรายการ
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await axiosClient.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(item => item.id === id ? { ...item, is_read: true } : item)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // กดเพื่ออ่านทั้งหมด
  const handleMarkAllAsRead = async () => {
    if (!customerId || unreadCount === 0) return;
    try {
      await axiosClient.patch(`/notifications/user/${customerId}/read-all`);
      setNotifications(prev => prev.map(item => ({ ...item, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative inline-block text-left" ref={bellRef}>
      {/* ไอคอนกระดิ่ง (ปรับสไตล์ให้เข้ากับ Navbar สีเข้ม) */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative w-9 h-9 md:w-10 md:h-10 bg-white text-gray-800 rounded-full flex items-center justify-center border border-gray-400 cursor-pointer hover:bg-gray-100 shadow-sm transition-colors"
      >
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* กล่อง Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="p-3 border-b bg-gray-50 flex justify-between items-center text-xs">
            <span className="font-bold text-gray-700">การแจ้งเตือน ({unreadCount})</span>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">ไม่มีการแจ้งเตือน</div>
            ) : (
              notifications.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleMarkAsRead(item.id, item.is_read)}
                  className={`p-3 cursor-pointer transition hover:bg-gray-50 flex gap-2.5 items-start ${
                    !item.is_read ? 'bg-blue-50/60' : 'bg-white'
                  }`}
                >
                  <span className="text-base mt-0.5">
                    {item.type === 'approved' ? '✅' : item.type === 'rejected' ? '❌' : '🔔'}
                  </span>
                  <div className="flex-1">
                    <p className={`text-xs ${!item.is_read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{item.message}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}{' '}
                      {new Date(item.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  </div>
                  {!item.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}