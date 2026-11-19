import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logoutAPI } from '../api/authApi';
import { useContext } from 'react';
import { toastError, ask } from './ui';
import { RoleContext, useCan } from './AdminMenuLink';

// [ลิงก์, ชื่อ, ไอคอน, สิทธิ์ที่ต้องมี]
const MENU = [
  ['/admin', 'ภาพรวม', 'fa-chart-simple'],
  ['/admin/users', 'ผู้ใช้', 'fa-user', 'users'],
  ['/admin/products', 'สินค้า', 'fa-clock'],
  ['/admin/inventory', 'สต็อก', 'fa-box'],
  ['/admin/bookings', 'การจอง', 'fa-calendar'],
  ['/admin/locations', 'สาขา', 'fa-store'],
  ['/admin/audit-logs', 'ประวัติการแก้ไข', 'fa-clock-rotate-left', 'auditLogs'],
];

const linkClass = 'flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition';

export default function AdminLayout() {
  const navigate = useNavigate();
  const role = useContext(RoleContext);
  const can = useCan();

  async function handleLogout() {
    if (!(await ask('ออกจากระบบ?', '', 'ออกจากระบบ'))) return;
    logoutAPI().then(function () { navigate('/login'); }).catch(toastError);
  }

  return (
    <div className="admin-root flex min-h-screen flex-col bg-[#0B0B0C] text-[15px] text-neutral-100 md:flex-row">
      <aside className="flex flex-col border-b border-white/[0.12] bg-[#0B0B0C] p-4 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0 md:p-6">
        <div className="mb-4 px-2 md:mb-12">
          <p className="font-serif text-lg font-bold tracking-widest whitespace-nowrap text-white">GRAND SERVICE</p>
          <p className="mt-1 text-xs tracking-widest text-gray-400 uppercase">{role}</p>
        </div>

        <nav className="flex gap-1 overflow-x-auto md:flex-1 md:flex-col">
          {MENU.filter(function (m) { return !m[3] || can(m[3]); }).map(function ([to, label, icon]) {
            return (
              <NavLink key={to} to={to} end={to === '/admin'} className={function ({ isActive }) {
                return `${linkClass} ${isActive ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/[0.04] hover:text-white'}`;
              }}>
                <i className={`fa-solid ${icon} w-4 text-center text-xs`} />{label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-2 flex gap-1 border-white/[0.12] md:block md:border-t md:pt-4">
          <NavLink to="/profile" className={`${linkClass} text-neutral-300 hover:text-white`}>
            <i className="fa-solid fa-arrow-left w-4 text-center text-xs" />กลับหน้าเว็บ
          </NavLink>
          <button onClick={handleLogout} className={`${linkClass} cursor-pointer md:w-full text-neutral-300 hover:text-red-400`}>
            <i className="fa-solid fa-right-from-bracket w-4 text-center text-xs" />ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-6xl"><Outlet /></div>
      </main>
    </div>
  );
}
