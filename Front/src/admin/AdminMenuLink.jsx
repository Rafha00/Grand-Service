import { createContext, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfileAPI } from '../api/authApi';


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

export function useCan() {
  const role = useContext(RoleContext);
  return function (permission) {
    return !PERMISSIONS[permission] || PERMISSIONS[permission].includes(role);
  };
}

export default function AdminMenuLink({ className, onClick }) {
  if (!STAFF_ROLES.includes(useRole())) return null;
  return <Link to="/admin" onClick={onClick} className={className}>Admin Panel</Link>;
}
