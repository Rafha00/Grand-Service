import { useState } from 'react';
import { getAuditLogs } from '../adminApi';
import { PageHeader, Table, Td, Badge, SearchInput, useLoad, inputClass } from '../ui';

const ACTIONS = { CREATE: ['เพิ่ม', 'on'], UPDATE: ['แก้ไข', 'off'], STATUS: ['เปลี่ยนสถานะ', 'off'], ROLE: ['เปลี่ยน Role', 'off'], IMAGES: ['เพิ่มรูป', 'on'], DELETE: ['ลบ', 'bad'] };
const ENTITIES = { products: 'สินค้า', brands: 'แบรนด์', categories: 'หมวดหมู่', inventory: 'สต็อก', bookings: 'การจอง', users: 'ผู้ใช้', locations: 'สาขา' };

function parse(text) {
  try { return text ? JSON.parse(text) : null; } catch (e) { return text; }
}

// แสดงเฉพาะช่องที่เปลี่ยน: ค่าเดิม → ค่าใหม่ (ถ้าเป็นการเพิ่ม/ลบ แสดงทั้งก้อน)
function Changes({ log }) {
  const before = parse(log.old_value) || {};
  const after = parse(log.new_value) || {};
  const keys = Object.keys(after).length ? Object.keys(after) : Object.keys(before);
  const rows = keys.filter(function (k) { return k !== 'id' && String(before[k] ?? '') !== String(after[k] ?? ''); });
  if (rows.length === 0) return <span className="text-neutral-500">-</span>;
  return (
    <details>
      <summary className="cursor-pointer text-neutral-400 hover:text-white">{rows.length} ช่อง</summary>
      <div className="mt-2 space-y-1 text-xs">
        {rows.map(function (k) {
          return (
            <div key={k}>
              <span className="text-neutral-500">{k}: </span>
              {k in before && <span className="text-red-300/80 line-through">{String(before[k])}</span>}
              {k in before && k in after && ' → '}
              {k in after && <span className="text-white">{String(after[k])}</span>}
            </div>
          );
        })}
      </div>
    </details>
  );
}

export default function AuditLogs() {
  const [logs] = useLoad(getAuditLogs);
  const [search, setSearch] = useState('');
  const [entity, setEntity] = useState('');

  const rows = logs && logs.filter(function (l) {
    const who = l.user ? `${l.user.full_name} ${l.user.email}` : '';
    return (!entity || l.entity === entity) && `${who} ${l.entity_id}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader title="ประวัติการแก้ไข">
        <SearchInput placeholder="ค้นหาผู้ทำรายการ" value={search} onChange={setSearch} />
        <select value={entity} onChange={function (e) { setEntity(e.target.value); }} className={`${inputClass} w-40`}>
          <option value="">ทุกส่วน</option>
          {Object.entries(ENTITIES).map(function ([k, v]) { return <option key={k} value={k}>{v}</option>; })}
        </select>
      </PageHeader>
      <Table
        headers={['เวลา', 'ผู้ทำรายการ', 'การกระทำ', 'ส่วน', 'รายการ', 'รายละเอียด']}
        rows={rows}
        renderRow={function (l) {
          const [label, tone] = ACTIONS[l.action] || [l.action, 'off'];
          return (
            <>
              <Td className="whitespace-nowrap text-neutral-400">{new Date(l.created_at).toLocaleString('th-TH')}</Td>
              <Td>
                <div>{l.user ? (l.user.full_name || l.user.email) : '-'}</div>
                {l.user && <div className="text-xs text-neutral-500">{l.user.role}</div>}
              </Td>
              <Td><Badge tone={tone}>{label}</Badge></Td>
              <Td>{ENTITIES[l.entity] || l.entity}</Td>
              <Td className="font-mono text-xs text-neutral-400">{l.entity_id ? String(l.entity_id).slice(0, 8) : '-'}</Td>
              <Td className="max-w-sm"><Changes log={l} /></Td>
            </>
          );
        }}
      />
    </div>
  );
}
