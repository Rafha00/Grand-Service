import { createContext, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfileAPI } from '../api/authApi';

// ตารางสิทธิ์ (ต้องตรงกับ Back/Routes/adminRoutes.js)
// ส่วนที่ไม่อยู่ในตารางนี้ = ทุก role ที่เข้าหน้าแอดมินได้ทำได้
const PERMISSIONS = {
  users: ['Admin'],
  catalogEdit: ['Admin', 'Manager'],
  locationEdit: ['Admin', 'Manager'],
  deleteStock: ['Admin', 'Manager'],
  deleteBooking: ['Admin', 'Manager'],
  auditLogs: ['Admin', 'Manager'],
};
export const STAFF_ROLES = ['Admin', 'Manager', 'Staff'];

// ถาม backend ว่า role ปัจจุบันคืออะไร: undefined = กำลังเช็ค, null = ไม่ได้ login
export function useRole() {
  const [role, setRole] = useState(undefined);
  useEffect(function () {
    let active = true;
    getProfileAPI()
      .then(function (res) { if (active) setRole((res.user && res.user.role) || null); })
      .catch(function () { if (active) setRole(null); });
    return function () { active = false; };
  }, []);
  return role;
}

export const RoleContext = createContext(null);

// ใช้ในหน้าแอดมิน: const can = useCan(); if (can('catalogEdit')) ...
export function useCan() {
  const role = useContext(RoleContext);
  return function (permission) {
    return !PERMISSIONS[permission] || PERMISSIONS[permission].includes(role);
  };
}

// ลิงก์ "Admin Panel" ที่เห็นเฉพาะพนักงาน (ใช้ใน Sidebar / Navbar ของทีม)
// ซ่อนแค่ปุ่ม ความปลอดภัยจริงอยู่ที่ backend และ AdminRoutes
export default function AdminMenuLink({ className, onClick }) {
  if (!STAFF_ROLES.includes(useRole())) return null;
  return <Link to="/admin" onClick={onClick} className={className}>Admin Panel</Link>;
}
