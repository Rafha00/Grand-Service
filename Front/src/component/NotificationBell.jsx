import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export default function NotificationBell({ customerId = 'mock-user-123' }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // ดึงแจ้งเตือนของ User
  const fetchNotifications = async () => {
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

  // กดเพื่ออ่าน
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative inline-block text-left">
      {/* ไอคอนกระดิ่ง */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* กล่อง Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-3 border-b bg-gray-50 flex justify-between items-center text-xs">
            <span className="font-bold text-gray-700">การแจ้งเตือน</span>
            <span className="text-blue-600 font-semibold">{unreadCount} รายการใหม่</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">ไม่มีการแจ้งเตือน</div>
            ) : (
              notifications.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleMarkAsRead(item.id, item.is_read)}
                  className={`p-3 cursor-pointer transition hover:bg-gray-50 flex gap-2.5 items-start ${
                    !item.is_read ? 'bg-blue-50/50' : 'bg-white'
                  }`}
                >
                  <span className="text-base">
                    {item.type === 'approved' ? '✅' : item.type === 'rejected' ? '❌' : '🔔'}
                  </span>
                  <div className="flex-1">
                    <p className={`text-xs ${!item.is_read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{item.message}</p>
                    <span className="text-[9px] text-gray-400 mt-1 block">
                      {new Date(item.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  </div>
                  {!item.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1"></span>
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