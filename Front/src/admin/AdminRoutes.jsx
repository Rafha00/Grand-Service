import { Routes, Route, Navigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './admin.css';
import { useRole, RoleContext, STAFF_ROLES } from './AdminMenuLink';
import AdminLayout from './AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Catalog from './pages/Catalog';
import Inventory from './pages/Inventory';
import Bookings from './pages/Bookings';
import AuditLogs from './pages/AuditLogs';

// โหลดฟอนต์ด้วย <link> (ใส่ @import url ใน admin.css แล้ว Tailwind ทำให้ไฟล์ว่าง)
const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=IBM+Plex+Sans+Thai:wght@300;400;500;600&display=swap';
if (!document.querySelector(`link[href="${FONTS_URL}"]`)) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONTS_URL;
  document.head.appendChild(link);
}

export default function AdminRoutes() {
  const role = useRole();
  if (role === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-500">กำลังตรวจสอบสิทธิ์...</div>;
  }
  if (!STAFF_ROLES.includes(role)) return <Navigate to="/login" replace />;

  const only = function (roles, element) {
    return roles.includes(role) ? element : <Navigate to="/admin" replace />;
  };

  return (
    <RoleContext.Provider value={role}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={only(['Admin'], <Users />)} />
          <Route path="products" element={<Catalog />} />
          <Route path="brands" element={<Navigate to="/admin/products?tab=brands" replace />} />
          <Route path="categories" element={<Navigate to="/admin/products?tab=categories" replace />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="audit-logs" element={only(['Admin', 'Manager'], <AuditLogs />)} />
        </Route>
      </Routes>
    </RoleContext.Provider>
  );
}
