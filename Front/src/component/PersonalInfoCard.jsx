import React, { useState, useEffect } from 'react';

const formatPhoneNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

export default function PersonalInfoCard({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: formatPhoneNumber(user?.phone || ''),
  });

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      phone: formatPhoneNumber(user?.phone || ''),
    });
  }, [user, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData({ ...formData, phone: formatPhoneNumber(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-white p-4">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-neutral-300 rounded-full"></span>
            <h3 className="text-xl font-bold text-white tracking-wide font-serif">Personal Information</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1 ml-3">จัดการรายละเอียดข้อมูลส่วนตัวและข้อมูลติดต่อของคุณ</p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-xl transition-all border border-neutral-700 shadow-lg cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
            แก้ไข
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="px-4.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl transition-all border border-neutral-700 cursor-pointer"
          >
            ยกเลิก
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-2 w-full">
          <div className="grid grid-cols-[220px_1fr] items-center py-3.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <span className="text-xs font-bold tracking-wide text-neutral-400">ชื่อ-นามสกุล</span>
            </div>
            <div className="text-neutral-200 font-medium text-sm text-left">{user?.name || '-'}</div>
          </div>

          <div className="grid grid-cols-[220px_1fr] items-center py-3.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <span className="text-xs font-bold tracking-wide text-neutral-400">อีเมล</span>
            </div>
            <div className="text-neutral-200 font-medium text-sm text-left">{user?.email || '-'}</div>
          </div>

          <div className="grid grid-cols-[220px_1fr] items-center py-3.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <span className="text-xs font-bold tracking-wide text-neutral-400">เบอร์โทรศัพท์</span>
            </div>
            <div className="text-neutral-200 font-medium text-sm text-left">{user?.phone || '-'}</div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2 w-full">
          <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <span className="text-xs font-bold tracking-wide text-neutral-400">ชื่อ-นามสกุล</span>
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

          <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl opacity-70">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <span className="text-xs font-bold tracking-wide text-neutral-400">อีเมล</span>
            </div>
            <div className="text-neutral-400 text-sm text-left">
              {user?.email || '-'} <span className="text-[10px] text-neutral-500">(ไม่สามารถแก้ไขได้)</span>
            </div>
          </div>

          <div className="grid grid-cols-[220px_1fr] items-center py-2.5 px-4 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="text-neutral-400">
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <span className="text-xs font-bold tracking-wide text-neutral-400">เบอร์โทรศัพท์</span>
            </div>
            <div className="max-w-sm">
              <input
                type="tel"
                inputMode="numeric"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={12}
                placeholder="000-000-0000"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500 transition-all text-left"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium text-xs rounded-xl transition-all border border-neutral-700 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs rounded-xl transition-all shadow-lg cursor-pointer"
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      )}
    </div>
  );
}