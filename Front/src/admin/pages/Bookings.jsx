import { useState } from 'react';
import { bookingApi, productApi, userApi } from '../adminApi';
import { PageHeader, Table, Td, RowActions, EditorModal, Field, useLoad, useEditor, askRun, confirmRun, inputClass, btnPrimary } from '../ui';
import { useCan } from '../AdminMenuLink';

const STATUSES = { pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิก' };
const COLORS = { confirmed: 'text-white font-semibold', completed: 'text-neutral-400', cancelled: 'text-red-400' };
const empty = { product_id: '', customer_id: '', booking_date: '', booking_time: '', location_name: '', note: '' };

function statusOptions() {
  return Object.entries(STATUSES).map(function ([value, label]) { return <option key={value} value={value}>{label}</option>; });
}

export default function Bookings() {
  const can = useCan();
  const [bookings, reload] = useLoad(bookingApi.list);
  const [products] = useLoad(productApi.list);
  // รายชื่อผู้ใช้ดูได้เฉพาะ Admin, role อื่นใช้รายการว่าง (ช่องลูกค้าจะเหลือแค่ guest)
  const [users] = useLoad(can('users') ? userApi.list : function () { return Promise.resolve([]); });
  const [filter, setFilter] = useState('');
  const ed = useEditor(empty);

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
        <select value={filter} onChange={function (e) { setFilter(e.target.value); }} className={`${inputClass} w-40`}>
          <option value="">ทุกสถานะ</option>
          {statusOptions()}
        </select>
        <button onClick={function () { ed.open({}); }} className={btnPrimary}>+ เพิ่มการจอง</button>
      </PageHeader>
      <Table
        headers={['#', 'วันที่', 'เวลา', 'สินค้า', 'สาขา', 'ลูกค้า', 'หมายเหตุ', 'สถานะ', '']}
        rows={bookings && bookings.filter(function (b) { return !filter || b.status === filter; })}
        renderRow={function (b) {
          const user = (users || []).find(function (u) { return u.id === b.customer_id; });
          return (
            <>
              <Td>{String(b.id).slice(0, 8)}</Td>
              <Td>{b.booking_date || '-'}</Td>
              <Td>{b.booking_time || '-'}</Td>
              <Td>{b.product_name || '-'}</Td>
              <Td>{b.location_name || '-'}</Td>
              <Td>{user ? (user.full_name || user.email) : (b.customer_id || '-')}</Td>
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
        <Field label="สาขา" className="sm:col-span-2"><input placeholder="เช่น สาขาสยาม" {...ed.bind('location_name')} /></Field>
        <Field label="หมายเหตุ" className="sm:col-span-2"><textarea rows={2} {...ed.bind('note')} /></Field>
      </EditorModal>
    </div>
  );
}
