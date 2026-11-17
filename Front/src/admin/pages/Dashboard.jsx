import { Link } from 'react-router-dom';
import { getStats } from '../adminApi';
import { PageHeader, useLoad, card } from '../ui';

const CARDS = [
  ['users', 'ผู้ใช้ทั้งหมด', 'users', 'fa-user'],
  ['products', 'สินค้า', 'products', 'fa-clock'],
  ['inventory', 'รายการในสต็อก', 'inventory', 'fa-box'],
  ['bookings', 'การจองทั้งหมด', 'bookings', 'fa-calendar'],
  ['pendingBookings', 'รอยืนยัน', 'bookings', 'fa-hourglass-half'],
];

export default function Dashboard() {
  const [stats] = useLoad(getStats);

  return (
    <div>
      <PageHeader title="ภาพรวม" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map(function ([key, label, to, icon]) {
          return (
            <Link key={key} to={`/admin/${to}`} className={`${card} group p-6 transition hover:border-white/50`}>
              <div className="flex items-center justify-between text-sm text-neutral-400">
                {label}
                <i className={`fa-solid ${icon} text-xs text-gray-400`} />
              </div>
              <p className="mt-5 text-5xl font-light tracking-tight text-white">{stats ? stats[key] : '—'}</p>
              <div className="mt-5 h-px w-8 bg-white/10 transition-all group-hover:w-16" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
