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
            <Link key={key} to={`/admin/${to}`} className={`${card} group p-6 transition hover:border-[#c9a96e]/40`}>
              <div className="flex items-center justify-between text-sm text-neutral-400">
                {label}
                <i className={`fa-solid ${icon} text-xs text-[#c9a96e]/70`} />
              </div>
              <p className="mt-5 font-serif text-5xl text-white">{stats ? stats[key] : '—'}</p>
              <div className="mt-5 h-px w-8 bg-[#c9a96e]/60 transition-all group-hover:w-16" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
