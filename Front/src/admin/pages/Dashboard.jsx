import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getAuditLogs, bookingApi } from '../adminApi';
import { PageHeader, useLoad, card } from '../ui';
import { useCan } from '../AdminMenuLink';

// [สถานะ, ชื่อ, สีจุด, สีในกราฟ]
const STOCK = [
  ['available', 'พร้อมขาย', 'bg-emerald-400', '#34d399'],
  ['reserved', 'จองแล้ว', 'bg-amber-300', '#fcd34d'],
  ['sold', 'ขายแล้ว', 'bg-neutral-500', '#737373'],
];
const BOOKING = [
  ['pending', 'รอยืนยัน', 'bg-amber-300', '#fcd34d'],
  ['confirmed', 'ยืนยันแล้ว', 'bg-emerald-400', '#34d399'],
  ['completed', 'เสร็จสิ้น', 'bg-neutral-500', '#737373'],
  ['cancelled', 'ยกเลิก', 'bg-red-400', '#f87171'],
];
const BOOKING_LABEL = Object.fromEntries(BOOKING.map(function ([k, label, color]) { return [k, [label, color]]; }));
const ACTIONS = { CREATE: 'เพิ่ม', UPDATE: 'แก้ไข', STATUS: 'เปลี่ยนสถานะ', ROLE: 'เปลี่ยน Role', IMAGES: 'เพิ่มรูป', DELETE: 'ลบ' };
const ENTITIES = { products: 'สินค้า', brands: 'แบรนด์', categories: 'หมวดหมู่', inventory: 'สต็อก', bookings: 'การจอง', users: 'ผู้ใช้', locations: 'สาขา' };

const today = new Date().toLocaleDateString('sv-SE');

function n(value) {
  return value == null ? '—' : Number(value).toLocaleString('th-TH');
}

function StatCard({ to, label, icon, value, children }) {
  return (
    <Link to={`/admin/${to}`} className={`${card} group flex flex-col p-6 transition hover:border-white/50`}>
      <div className="flex items-center justify-between text-sm text-neutral-300">
        {label}
        <i className={`fa-solid ${icon} text-xs text-gray-300`} />
      </div>
      <p className="mt-4 text-5xl font-light tracking-tight text-white">{value}</p>
      <div className="mt-auto space-y-1.5 border-t border-white/[0.1] pt-4 text-xs text-neutral-300">{children}</div>
    </Link>
  );
}

// แถวข้อมูลย่อยในการ์ด: [[ชื่อ, ค่า, สีจุด?], ...]
function Line({ items }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map(function ([label, value, dot]) {
        return (
          <span key={label} className="inline-flex items-center gap-1.5">
            {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
            {label} <span className="text-neutral-200">{n(value)}</span>
          </span>
        );
      })}
    </div>
  );
}

// กราฟโดนัท: แต่ละสถานะเป็นเส้นโค้งยาวตามสัดส่วน, ตรงกลางแสดงยอดรวม (ชี้สถานะไหนแสดงของสถานะนั้น)
const RADIUS = 46;
const RING = 2 * Math.PI * RADIUS;
const GAP = 3; // ช่องว่างระหว่างสี (เมื่อมีมากกว่า 1 สถานะ)

function Donut({ statuses, values, total, active, onHover }) {
  const parts = statuses.filter(function ([key]) { return values[key] > 0; });
  const gap = parts.length > 1 ? GAP : 0;
  let offset = 0;

  return (
    <svg viewBox="0 0 120 120" className="h-40 w-40 shrink-0 -rotate-90">
      <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
      {total > 0 && parts.map(function ([key, , , hex]) {
        const length = (values[key] / total) * RING;
        const dash = Math.max(length - gap, 0.5);
        const segment = (
          <circle key={key} cx="60" cy="60" r={RADIUS} fill="none" stroke={hex}
            strokeWidth={active === key ? 18 : 14}
            strokeDasharray={`${dash} ${RING - dash}`} strokeDashoffset={-offset}
            opacity={active && active !== key ? 0.35 : 1}
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={function () { onHover(key); }} onMouseLeave={function () { onHover(null); }} />
        );
        offset += length;
        return segment;
      })}
    </svg>
  );
}

function StatusBreakdown({ title, to, statuses, counts }) {
  const [active, setActive] = useState(null);
  const values = counts || {};
  const total = statuses.reduce(function (sum, [key]) { return sum + (values[key] || 0); }, 0);
  const shown = active ? statuses.find(function ([key]) { return key === active; }) : null;
  const percent = function (count) { return total > 0 ? Math.round((count / total) * 100) : 0; };

  return (
    <div className={`${card} p-6`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-300">{title}</p>
        <Link to={`/admin/${to}`} className="text-xs text-neutral-400 transition hover:text-white">ดูทั้งหมด</Link>
      </div>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative">
          <Donut statuses={statuses} values={values} total={total} active={active} onHover={setActive} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-light text-white">{counts ? n(shown ? values[shown[0]] || 0 : total) : '—'}</span>
            <span className="mt-0.5 text-xs text-neutral-300">{shown ? `${shown[1]} · ${percent(values[shown[0]] || 0)}%` : 'ทั้งหมด'}</span>
          </div>
        </div>

        <div className="w-full flex-1 space-y-1">
          {statuses.map(function ([key, label, color]) {
            const count = values[key] || 0;
            return (
              <Link key={key} to={`/admin/${to}?status=${key}`}
                onMouseEnter={function () { setActive(key); }} onMouseLeave={function () { setActive(null); }}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${active === key ? 'bg-white/[0.06]' : ''} ${count === 0 ? 'text-neutral-400' : 'text-neutral-100'}`}>
                <span className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${color} ${count === 0 ? 'opacity-40' : ''}`} />{label}
                </span>
                <span>
                  <span className="text-base">{counts ? n(count) : '—'}</span>
                  <span className="ml-2 inline-block w-10 text-right text-xs text-neutral-400">{percent(count)}%</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, to, children, empty }) {
  return (
    <div className={`${card} p-6`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-neutral-300">{title}</p>
        <Link to={`/admin/${to}`} className="text-xs text-neutral-400 transition hover:text-white">ดูทั้งหมด</Link>
      </div>
      {children == null ? <p className="py-8 text-center text-sm text-neutral-400">กำลังโหลด...</p>
        : children.length === 0 ? <p className="py-8 text-center text-sm text-neutral-400">{empty}</p>
          : <div className="divide-y divide-white/[0.1]">{children}</div>}
    </div>
  );
}

function shortDate(date) {
  if (date === today) return 'วันนี้';
  return new Date(`${date}T00:00:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const can = useCan();
  const [stats] = useLoad(getStats);
  const [bookings] = useLoad(bookingApi.list);
  const [logs] = useLoad(can('auditLogs') ? getAuditLogs : function () { return Promise.resolve([]); });
  const s = stats || {};
  const roles = s.usersByRole || {};
  const stock = s.inventoryByStatus || {};

  const upcoming = bookings && bookings
    .filter(function (b) { return b.booking_date >= today && b.status !== 'cancelled'; })
    .sort(function (a, b) { return `${a.booking_date} ${a.booking_time}`.localeCompare(`${b.booking_date} ${b.booking_time}`); })
    .slice(0, 5);

  return (
    <div>
      <PageHeader title="ภาพรวม" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard to="users" label="ผู้ใช้" icon="fa-user" value={n(s.users)}>
          <Line items={[['ลูกค้า', roles.Customer], ['พนักงาน', stats && (roles.Staff || 0) + (roles.Manager || 0) + (roles.Admin || 0)]]} />
          <Line items={[['Staff', roles.Staff], ['Manager', roles.Manager], ['Admin', roles.Admin]]} />
        </StatCard>

        <StatCard to="products" label="สินค้า" icon="fa-clock" value={n(s.products)}>
          <Line items={[['แสดง', s.activeProducts, 'bg-emerald-400'], ['ซ่อน', stats && s.products - s.activeProducts, 'bg-neutral-500']]} />
          <Line items={[['แบรนด์', s.brands], ['หมวดหมู่', s.categories]]} />
        </StatCard>

        <StatCard to="inventory" label="สต็อก" icon="fa-box" value={n(s.inventory)}>
          <Line items={[['พร้อมขาย', stock.available, 'bg-emerald-400'], ['จองแล้ว', stock.reserved, 'bg-amber-300']]} />
          <Line items={[['ขายแล้ว', stock.sold, 'bg-neutral-500']]} />
        </StatCard>

        <StatCard to="bookings" label="การจอง" icon="fa-calendar" value={n(s.bookings)}>
          <Line items={[['รอยืนยัน', s.pendingBookings, 'bg-amber-300']]} />
          <Line items={[['วันนี้', s.todayBookings], ['ล่วงหน้า', s.upcomingBookings]]} />
        </StatCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <StatusBreakdown title="สต็อกแยกสถานะ" to="inventory" statuses={STOCK} counts={s.inventoryByStatus} />
        <StatusBreakdown title="การจองแยกสถานะ" to="bookings" statuses={BOOKING} counts={s.bookingsByStatus} />
      </div>

      <div className={`mt-5 grid grid-cols-1 gap-5 ${can('auditLogs') ? 'lg:grid-cols-2' : ''}`}>
        <Panel title="การจองที่จะถึง" to="bookings" empty="ไม่มีการจอง">
          {upcoming && upcoming.map(function (b) {
            const [label, color] = BOOKING_LABEL[b.status || 'pending'] || [b.status, 'bg-neutral-500'];
            return (
              <div key={b.id} className="flex items-center gap-4 py-3 text-sm">
                <div className="w-16 shrink-0">
                  <div className="text-neutral-200">{shortDate(b.booking_date)}</div>
                  <div className="text-xs text-neutral-400">{String(b.booking_time || '').slice(0, 5)}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-neutral-200">{b.product_name || '-'}</div>
                  <div className="truncate text-xs text-neutral-400">{b.location_name || '-'}</div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-neutral-200">
                  <span className={`h-1.5 w-1.5 rounded-full ${color}`} />{label}
                </span>
              </div>
            );
          })}
        </Panel>

        {can('auditLogs') && (
          <Panel title="แก้ไขล่าสุด" to="audit-logs" empty="ยังไม่มีประวัติ">
            {logs && logs.slice(0, 5).map(function (l) {
              return (
                <div key={l.id} className="flex items-center gap-4 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-neutral-200">{ACTIONS[l.action] || l.action}{ENTITIES[l.entity] || l.entity}</div>
                    <div className="truncate text-xs text-neutral-400">{l.user ? (l.user.full_name || l.user.email) : '-'}</div>
                  </div>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {new Date(l.created_at).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </Panel>
        )}
      </div>
    </div>
  );
}
