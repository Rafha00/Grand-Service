import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookingApi, productApi, userApi, locationApi } from '../adminApi';
import { PageHeader, FilterBar, DateFilter, countTabs, Table, Td, RowActions, EditorModal, Field, SearchInput, FilterSelect, Combobox, uniqueOptions, searchRows, useLoad, useEditor, askRun, confirmRun, btnPrimary } from '../ui';
import { useCan } from '../AdminMenuLink';

const HEADERS = ['#', 'วันที่', 'เวลา', 'สินค้า', 'สาขา', 'ลูกค้า', 'หมายเหตุ', 'สถานะ', ''];

const STATUSES = { pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิก' };
// ปุ่มสถานะแบบเม็ดยา สีขอบ/ตัวหนังสือตามสถานะ (แบบเดียวกับหน้าสต็อก)
const STATUS_STYLE = {
  pending: 'border-amber-300/40 text-amber-200',
  confirmed: 'border-emerald-400/40 text-emerald-300',
  completed: 'border-white/20 text-neutral-300',
  cancelled: 'border-red-400/40 text-red-300',
};
const noFilter = { status: '', date: '', location: '' };
const empty = { product_id: '', customer_id: '', booking_date: '', booking_time: '', location_name: '', note: '' };

// การจองเก่าจากหน้าลูกค้าใส่ "สาขา: ..." ไว้ในหมายเหตุ ซ้ำกับคอลัมน์สาขา จึงไม่แสดง
function noteOf(b) {
  const note = (b.note || '').trim();
  return note.startsWith('สาขา:') && note.slice(5).trim() === (b.location_name || '').trim() ? '' : note;
}

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
  const [params] = useSearchParams();
  const [filter, setFilter] = useState({ ...noFilter, status: STATUSES[params.get('status')] ? params.get('status') : '' });
  const [search, setSearch] = useState('');
  // เปิดแก้ไข: แปลงข้อมูลการจองเป็นค่าในฟอร์ม (inventory_id ของการจองเก็บ id สินค้า)
  const ed = useEditor(empty, function (b) {
    return {
      product_id: b.inventory_id || '', customer_id: b.customer_id === 'guest' ? '' : b.customer_id || '',
      booking_date: b.booking_date || '', booking_time: String(b.booking_time || '').slice(0, 5),
      location_name: b.location_name || '', note: noteOf(b),
    };
  });

  const all = bookings || [];
  const nameOf = function (b) {
    const user = (users || []).find(function (u) { return u.id === b.customer_id; });
    return user ? (user.full_name || user.email) : (b.customer_id || '');
  };
  const tabs = countTabs(all, Object.entries(STATUSES), function (b) { return b.status || 'pending'; });
  // ตัวเลือกสาขา: จากตาราง locations + ชื่อเก่าที่ยังค้างอยู่ในการจอง
  const locationOptions = uniqueOptions((locations || []).concat(all.map(function (b) { return { name: b.location_name }; })),
    function (l) { return l.name; }, function (l) { return l.name; });
  const openLocations = (locations || []).filter(function (l) { return l.is_active; }).map(function (l) { return { id: l.name, name: l.name }; });
  // ตอนแก้ไข: สาขาเดิมที่ปิดไปแล้ว / ลูกค้าที่ไม่อยู่ในรายชื่อ ยังต้องเลือกค้างไว้ได้
  const locationItems = ed.form.location_name && !openLocations.some(function (l) { return l.id === ed.form.location_name; })
    ? openLocations.concat([{ id: ed.form.location_name, name: ed.form.location_name }]) : openLocations;
  const customerMissing = ed.form.customer_id && !(users || []).some(function (u) { return u.id === ed.form.customer_id; });
  const filtering = filter.date || filter.location;

  const rows = bookings && searchRows(all.filter(function (b) {
    return (!filter.status || (b.status || 'pending') === filter.status)
      && (!filter.date || b.booking_date === filter.date)
      && (!filter.location || b.location_name === filter.location);
  }), search, function (b) { return `${b.product_name} ${nameOf(b)} ${b.note} ${b.id}`; });

  function renderRow(b) {
    return (
      <>
        <Td>{String(b.id).slice(0, 8)}</Td>
        <Td className="whitespace-nowrap">{b.booking_date || '-'}</Td>
        <Td>{String(b.booking_time || '-').slice(0, 5)}</Td>
        <Td>{b.product_name || '-'}</Td>
        <Td>{b.location_name || '-'}</Td>
        <Td>{nameOf(b) || '-'}</Td>
        <Td className="max-w-48 truncate">{noteOf(b) || '-'}</Td>
        <Td>
          <select
            value={b.status || 'pending'}
            onChange={function (e) {
              const next = e.target.value;
              askRun('เปลี่ยนสถานะการจอง?', `${STATUSES[b.status] || b.status || '-'} → ${STATUSES[next]}`, function () { return bookingApi.setStatus(b.id, next); }, 'อัปเดตสถานะแล้ว').then(function (ok) { if (ok) reload(); });
            }}
            className={`cursor-pointer rounded-full border bg-transparent px-3 py-1.5 text-xs focus:outline-none [&>option]:bg-[#141416] [&>option]:text-neutral-200 ${STATUS_STYLE[b.status || 'pending'] || STATUS_STYLE.completed}`}
          >
            {statusOptions()}
          </select>
        </Td>
        <RowActions
          onEdit={function () { ed.open(b); }}
          onDelete={can('deleteBooking') && function () { confirmRun(`การจอง #${String(b.id).slice(0, 8)}`, function () { return bookingApi.remove(b.id); }, 'ลบการจองแล้ว').then(reload); }}
        />
      </>
    );
  }

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
    if (ed.isEdit) return ed.save(function () { return bookingApi.update(ed.id, body); }, 'แก้ไขการจองแล้ว', reload);
    ed.save(function () { return bookingApi.create(body); }, 'เพิ่มการจองแล้ว', reload);
  }

  return (
    <div>
      <PageHeader title="การจอง">
        <SearchInput placeholder="ค้นหาสินค้า / ลูกค้า" value={search} onChange={setSearch} />
        <button onClick={function () { ed.open({}); }} className={btnPrimary}>+ เพิ่มการจอง</button>
      </PageHeader>

      <FilterBar tabs={tabs} value={filter.status} onChange={function (v) { setFilter({ ...filter, status: v }); }}
        onClear={filtering && function () { setFilter({ ...noFilter, status: filter.status }); }}>
        <DateFilter value={filter.date} onChange={function (v) { setFilter({ ...filter, date: v }); }} />
        <FilterSelect value={filter.location} onChange={function (v) { setFilter({ ...filter, location: v }); }} all="ทุกสาขา" options={locationOptions} />
      </FilterBar>

      <Table headers={HEADERS} rows={rows} renderRow={renderRow} />

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
            {customerMissing && <option value={ed.form.customer_id}>{ed.form.customer_id}</option>}
            {(users || []).map(function (u) { return <option key={u.id} value={u.id}>{u.full_name ? `${u.full_name} · ` : ''}{u.email}</option>; })}
          </select>
        </Field>
        <Field label="วันที่ *"><input type="date" required {...ed.bind('booking_date')} /></Field>
        <Field label="เวลา *"><input type="time" required {...ed.bind('booking_time')} /></Field>
        <Field label="สาขา *" className="sm:col-span-2">
          <Combobox required items={locationItems} value={ed.form.location_name} onChange={function (v) { ed.setField('location_name', v); }} placeholder="เลือกสาขา" />
        </Field>
        <Field label="หมายเหตุ" className="sm:col-span-2"><textarea rows={2} {...ed.bind('note')} /></Field>
      </EditorModal>
    </div>
  );
}
