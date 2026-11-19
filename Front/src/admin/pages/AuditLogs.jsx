import { useState } from 'react';
import { getAuditLogs } from '../adminApi';
import { PageHeader, FilterBar, DateFilter, countTabs, Table, Td, Badge, SearchInput, FilterSelect, useLoad, card } from '../ui';

const ACTIONS = { CREATE: ['เพิ่ม', 'on'], UPDATE: ['แก้ไข', 'off'], STATUS: ['เปลี่ยนสถานะ', 'off'], ROLE: ['เปลี่ยน Role', 'off'], IMAGES: ['เพิ่มรูป', 'on'], DELETE: ['ลบ', 'bad'] };
// ตัวกรองแบบ CRUD: เปลี่ยนสถานะ / Role / เพิ่มรูป นับเป็นการแก้ไข
const CRUD = { CREATE: 'CREATE', UPDATE: 'UPDATE', STATUS: 'UPDATE', ROLE: 'UPDATE', IMAGES: 'UPDATE', DELETE: 'DELETE' };
const CRUD_OPTIONS = [['CREATE', 'เพิ่ม'], ['UPDATE', 'แก้ไข'], ['DELETE', 'ลบ']];
const ENTITIES = { products: 'สินค้า', brands: 'แบรนด์', categories: 'หมวดหมู่', inventory: 'สต็อก', bookings: 'การจอง', users: 'ผู้ใช้', locations: 'สาขา' };

const noFilter = { entity: '', action: '', date: '' };

// วันที่ตามเวลาเครื่อง รูปแบบ YYYY-MM-DD (ตรงกับค่าของ <input type="date">)
function localDate(value) {
  return new Date(value).toLocaleDateString('sv-SE');
}

function parse(text) {
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

// ชื่อช่องภาษาไทย (ช่องที่ไม่อยู่ในนี้แสดงชื่อเดิม)
const FIELD_LABELS = {
  email: 'อีเมล', full_name: 'ชื่อ-นามสกุล', phone: 'เบอร์โทร', role: 'Role',
  name: 'ชื่อ', model: 'รุ่น', reference_number: 'Reference No.', price: 'ราคา', condition: 'สภาพ', year: 'ปี',
  movement: 'Movement', case_size: 'ขนาดตัวเรือน', case_material: 'วัสดุตัวเรือน', warranty: 'การรับประกัน',
  brand_id: 'แบรนด์ (id)', category_id: 'หมวดหมู่ (id)', is_active: 'แสดง / เปิดใช้', description: 'รายละเอียด', logo_url: 'โลโก้',
  product_id: 'สินค้า (id)', sku: 'SKU', serial_number: 'Serial No.', status: 'สถานะ', location: 'ที่เก็บ / สาขา',
  booking_date: 'วันที่จอง', booking_time: 'เวลา', location_name: 'สาขา', product_name: 'สินค้า', customer_id: 'ลูกค้า (id)',
  inventory_id: 'สต็อก (id)', note: 'หมายเหตุ', address: 'ที่อยู่', image_urls: 'รูป (ลิงก์)',
  created_at: 'สร้างเมื่อ', updated_at: 'แก้ไขเมื่อ',
};

function display(value) {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value === 'boolean' || value === 'true' || value === 'false') return String(value) === 'true' ? 'ใช่' : 'ไม่ใช่';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString('th-TH');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// ช่องที่เปลี่ยน: แก้ไข = เฉพาะช่องที่ค่าไม่เหมือนเดิม, เพิ่ม/ลบ = ทุกช่อง
function changedFields(log) {
  const before = parse(log.old_value) || {};
  const after = parse(log.new_value) || {};
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(function (k) { return k !== 'id'; });
  const fields = log.action === 'DELETE' ? Object.keys(before) : Object.keys(after);
  return {
    before, after,
    keys: keys.filter(function (k) { return fields.includes(k) && (log.action === 'DELETE' || String(before[k] ?? '') !== String(after[k] ?? '')); }),
  };
}

function ChangesModal({ log, onClose }) {
  if (!log) return null;
  const { before, after, keys } = changedFields(log);
  const showBefore = log.action !== 'CREATE';
  const showAfter = log.action !== 'DELETE';
  const [label] = ACTIONS[log.action] || [log.action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={function (e) { e.stopPropagation(); }} className={`${card} flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden shadow-2xl`}>
        <div className="flex items-start justify-between border-b border-white/[0.1] px-7 pt-6 pb-4">
          <div>
            <h2 className="text-xl font-light text-white">{label}{ENTITIES[log.entity] || log.entity}</h2>
            <p className="mt-1 text-xs text-neutral-300">
              {log.user ? (log.user.full_name || log.user.email) : '-'} · {new Date(log.created_at).toLocaleString('th-TH')}
              {log.entity_id && <span className="ml-2 font-mono text-neutral-400">#{String(log.entity_id).slice(0, 8)}</span>}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิด" className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-neutral-300 hover:bg-white/5 hover:text-white">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-white/[0.12] bg-[#141416] text-xs text-neutral-300">
              <tr>
                <th className="w-48 px-7 py-3 font-normal">ช่อง</th>
                {showBefore && <th className="px-4 py-3 font-normal">{showAfter ? 'ค่าเดิม' : 'ข้อมูลที่ถูกลบ'}</th>}
                {showAfter && <th className="px-4 py-3 font-normal">{showBefore ? 'ค่าใหม่' : 'ข้อมูลที่เพิ่ม'}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.1]">
              {keys.map(function (k) {
                return (
                  <tr key={k}>
                    <td className="px-7 py-3 text-neutral-300">{FIELD_LABELS[k] || k}</td>
                    {showBefore && <td className={`px-4 py-3 break-all ${showAfter ? 'text-red-300/90' : 'text-neutral-100'}`}>{display(before[k])}</td>}
                    {showAfter && <td className={`px-4 py-3 break-all ${showBefore ? 'text-emerald-300' : 'text-neutral-100'}`}>{display(after[k])}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AuditLogs() {
  const [logs] = useLoad(getAuditLogs);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(noFilter);
  const [viewing, setViewing] = useState(null);
  const filtering = filter.entity || filter.date;

  function setF(key) {
    return function (v) { setFilter({ ...filter, [key]: v }); };
  }

  const rows = logs && logs.filter(function (l) {
    const who = l.user ? `${l.user.full_name} ${l.user.email}` : '';
    return (!filter.entity || l.entity === filter.entity)
      && (!filter.action || CRUD[l.action] === filter.action)
      && (!filter.date || localDate(l.created_at) === filter.date)
      && `${who} ${l.entity_id}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader title="ประวัติการแก้ไข">
        <SearchInput placeholder="ค้นหาผู้ทำรายการ" value={search} onChange={setSearch} />
      </PageHeader>

      <FilterBar tabs={countTabs(logs, CRUD_OPTIONS, function (l) { return CRUD[l.action]; })} value={filter.action} onChange={setF('action')}
        onClear={filtering && function () { setFilter({ ...noFilter, action: filter.action }); }}>
        <FilterSelect value={filter.entity} onChange={setF('entity')} all="ทุกส่วน" options={Object.entries(ENTITIES)} />
        <DateFilter value={filter.date} onChange={setF('date')} />
      </FilterBar>
      <Table
        headers={['เวลา', 'ผู้ทำรายการ', 'การกระทำ', 'ส่วน', 'รายการ', 'รายละเอียด']}
        rows={rows}
        renderRow={function (l) {
          const [label, tone] = ACTIONS[l.action] || [l.action, 'off'];
          return (
            <>
              <Td className="whitespace-nowrap text-neutral-300">{new Date(l.created_at).toLocaleString('th-TH')}</Td>
              <Td>
                <div>{l.user ? (l.user.full_name || l.user.email) : '-'}</div>
                {l.user && <div className="text-xs text-neutral-400">{l.user.role}</div>}
              </Td>
              <Td><Badge tone={tone}>{label}</Badge></Td>
              <Td>{ENTITIES[l.entity] || l.entity}</Td>
              <Td className="font-mono text-xs text-neutral-300">{l.entity_id ? String(l.entity_id).slice(0, 8) : '-'}</Td>
              <Td className="max-w-xs">
                {(function () {
                  const { keys } = changedFields(l);
                  if (keys.length === 0) return <span className="text-neutral-400">-</span>;
                  const names = keys.slice(0, 2).map(function (k) { return FIELD_LABELS[k] || k; }).join(', ');
                  return (
                    <button type="button" onClick={function () { setViewing(l); }}
                      className="inline-flex max-w-full cursor-pointer items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-neutral-200 transition hover:border-white/50 hover:text-white">
                      <i className="fa-solid fa-table-list text-[10px]" />
                      <span className="truncate">{names}{keys.length > 2 && ` +${keys.length - 2}`}</span>
                    </button>
                  );
                })()}
              </Td>
            </>
          );
        }}
      />

      <ChangesModal log={viewing} onClose={function () { setViewing(null); }} />
    </div>
  );
}
