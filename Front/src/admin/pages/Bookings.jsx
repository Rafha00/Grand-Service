import { useState } from 'react';
import { bookingApi, productApi, userApi, locationApi } from '../adminApi';
import { PageHeader, Table, Td, RowActions, EditorModal, Field, SearchInput, FilterSelect, Combobox, uniqueOptions, searchRows, useLoad, useEditor, askRun, confirmRun, inputClass, btnPrimary, btnGhost } from '../ui';
import { useCan } from '../AdminMenuLink';

const STATUSES = { pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิก' };
const COLORS = { pending: 'text-amber-200', confirmed: 'text-emerald-300', completed: 'text-neutral-400', cancelled: 'text-red-300' };
const noFilter = { status: '', date: '', location: '' };
const empty = { product_id: '', customer_id: '', booking_date: '', booking_time: '', location_name: '', note: '' };

function statusOptions() {
  return Object.entries(STATUSES).map(function ([value, label]) { return <option key={value} value={value}>{label}</option>; });
}

export default function Bookings() {
  const can = useCan();
  const [bookings, reload] = useLoad(bookingApi.list);
  const [products] = useLoad(productApi.list);
  const [locations] = useLoad(locationApi.list);
  // รายชื่อผู้ใช้ดูได้เฉพาะ Admin, role อื่นใช้รายการว่าง (ช่องลูกค้าจะเหลือแค่ guest)
  const [users] = useLoad(can('users') ? userApi.list : function () { return Promise.resolve([]); });
  const [filter, setFilter] = useState(noFilter);
  const [search, setSearch] = useState('');
  const ed = useEditor(empty);

  const all = bookings || [];
  const nameOf = function (b) {
    const user = (users || []).find(function (u) { return u.id === b.customer_id; });
    return user ? (user.full_name || user.email) : (b.customer_id || '');
  };
  const tabs = [['', 'ทั้งหมด', all.length]].concat(Object.entries(STATUSES).map(function ([key, label]) {
    return [key, label, all.filter(function (b) { return (b.status || 'pending') === key; }).length];
  }));
  // ตัวเลือกสาขา: จากตาราง locations + ชื่อเก่าที่ยังค้างอยู่ในการจอง
  const locationOptions = uniqueOptions((locations || []).concat(all.map(function (b) { return { name: b.location_name }; })),
    function (l) { return l.name; }, function (l) { return l.name; });
  const openLocations = (locations || []).filter(function (l) { return l.is_active; }).map(function (l) { return { id: l.name, name: l.name }; });
  const filtering = filter.date || filter.location;

  const rows = bookings && searchRows(all.filter(function (b) {
    return (!filter.status || (b.status || 'pending') === filter.status)
      && (!filter.date || b.booking_date === filter.date)
      && (!filter.location || b.location_name === filter.location);
  }), search, function (b) { return `${b.product_name} ${nameOf(b)} ${b.note} ${b.id}`; });

  function submit() {
    const f = ed.form;
    const product = (products || []).find(function (p) { return String(p.id) === String(f.product_id); });
    const body = {
      booking_date: f.booking_date,
      booking_time: f.booking_time,
      inventory_id: f.product_id,
      product_name: product ? product.name : '',
      location_name: f.location_name,
      customer_id: f.customer_id || 'guest',
      note: f.note,
    };
    ed.save(function () { return bookingApi.create(body); }, 'เพิ่มการจองแล้ว', reload);
  }

  return (
    <div>
      <PageHeader title="การจอง">
        <SearchInput placeholder="ค้นหาสินค้า / ลูกค้า" value={search} onChange={setSearch} />
        <button onClick={function () { ed.open({}); }} className={btnPrimary}>+ เพิ่มการจอง</button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map(function ([key, label, n]) {
            const active = filter.status === key;
            return (
              <button key={key} onClick={function () { setFilter({ ...filter, status: key }); }}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  active ? 'border-white bg-white text-black' : 'border-white/10 text-neutral-400 hover:text-white'
                }`}>
                {label}<span className={`rounded-full px-2 text-xs ${active ? 'bg-black/10' : 'bg-white/5'}`}>{n}</span>
              </button>
            );
          })}
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <input type="date" value={filter.date} onChange={function (e) { setFilter({ ...filter, date: e.target.value }); }}
            className={`${inputClass} sm:w-44 ${filter.date ? 'border-white/40 text-white' : ''}`} />
          <FilterSelect value={filter.location} onChange={function (v) { setFilter({ ...filter, location: v }); }} all="ทุกสาขา" options={locationOptions} />
          {filtering && <button onClick={function () { setFilter({ ...noFilter, status: filter.status }); }} className={btnGhost}>ล้าง</button>}
        </div>
      </div>

      <Table
        headers={['#', 'วันที่', 'เวลา', 'สินค้า', 'สาขา', 'ลูกค้า', 'หมายเหตุ', 'สถานะ', '']}
        rows={rows}
        renderRow={function (b) {
          return (
            <>
              <Td>{String(b.id).slice(0, 8)}</Td>
              <Td className="whitespace-nowrap">{b.booking_date || '-'}</Td>
              <Td>{b.booking_time || '-'}</Td>
              <Td>{b.product_name || '-'}</Td>
              <Td>{b.location_name || '-'}</Td>
              <Td>{nameOf(b) || '-'}</Td>
              <Td className="max-w-48 truncate">{b.note || '-'}</Td>
              <Td>
                <select
                  value={b.status || 'pending'}
                  onChange={function (e) {
                    const next = e.target.value;
                    askRun('เปลี่ยนสถานะการจอง?', `${STATUSES[b.status] || b.status || '-'} → ${STATUSES[next]}`, function () { return bookingApi.setStatus(b.id, next); }, 'อัปเดตสถานะแล้ว').then(function (ok) { if (ok) reload(); });
                  }}
                  className={`${inputClass} w-36 ${COLORS[b.status] || 'text-neutral-300'}`}
                >
                  {statusOptions()}
                </select>
              </Td>
              <RowActions onDelete={can('deleteBooking') && function () { confirmRun(`การจอง #${String(b.id).slice(0, 8)}`, function () { return bookingApi.remove(b.id); }, 'ลบการจองแล้ว').then(reload); }} />
            </>
          );
        }}
      />

      <EditorModal ed={ed} title="การจอง" onSubmit={submit} width="max-w-2xl" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="สินค้า *" className="sm:col-span-2">
          <select required {...ed.bind('product_id')}>
            <option value="">-- เลือก --</option>
            {(products || []).map(function (p) { return <option key={p.id} value={p.id}>{p.brands ? `${p.brands.name} · ` : ''}{p.name}</option>; })}
          </select>
        </Field>
        <Field label="ลูกค้า" className="sm:col-span-2">
          <select {...ed.bind('customer_id')}>
            <option value="">guest (ไม่ระบุ)</option>
            {(users || []).map(function (u) { return <option key={u.id} value={u.id}>{u.full_name ? `${u.full_name} · ` : ''}{u.email}</option>; })}
          </select>
        </Field>
        <Field label="วันที่ *"><input type="date" required {...ed.bind('booking_date')} /></Field>
        <Field label="เวลา *"><input type="time" required {...ed.bind('booking_time')} /></Field>
        <Field label="สาขา *" className="sm:col-span-2">
          <Combobox required items={openLocations} value={ed.form.location_name} onChange={function (v) { ed.setField('location_name', v); }} placeholder="เลือกสาขา" />
        </Field>
        <Field label="หมายเหตุ" className="sm:col-span-2"><textarea rows={2} {...ed.bind('note')} /></Field>
      </EditorModal>
    </div>
  );
}
