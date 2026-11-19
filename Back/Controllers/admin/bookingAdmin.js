// Booking Service: การจอง / สาขา (schema booking)
import { bookingDb as supabase } from '../../Config/db.js';
import { createNotification } from '../notificationsController.js';

const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

// ช่วงเวลานี้ที่สาขานี้มีคนจองแล้วไหม (ไม่นับที่ยกเลิก และไม่นับรายการที่กำลังแก้)
const slotTaken = async ({ booking_date, booking_time, location_name }, exceptId) => {
  let check = supabase.from('bookings').select('id')
    .eq('booking_date', booking_date).eq('booking_time', booking_time)
    .or('status.is.null,status.neq.cancelled');
  if (location_name) check = check.eq('location_name', location_name);
  if (exceptId) check = check.neq('id', exceptId);
  const { data, error } = await check;
  if (error) throw error;
  return data.length > 0;
};

// แอดมินจองแทนลูกค้า: ใช้ customer_id ที่เลือกในฟอร์ม (createBooking ของทีมใช้คนที่ login อยู่)
export const adminCreateBooking = async (req, res) => {
  try {
    const { booking_date, booking_time, inventory_id, location_name, product_name, customer_id, note } = req.body;
    if (!booking_date || !booking_time) return res.status(400).json({ message: 'กรุณาเลือกวันและเวลา' });
    if (await slotTaken(req.body)) return res.status(400).json({ message: 'ช่วงเวลานี้ที่สาขานี้ถูกจองไปแล้ว' });

    const { data, error } = await supabase
      .from('bookings')
      .insert({ booking_date, booking_time, inventory_id, location_name, product_name, note, customer_id: customer_id || 'guest', status: 'pending' })
      .select('*')
      .single();
    if (error) throw error;

    // ส่งแจ้งเตือนให้ลูกค้าหากมี customer_id จริง
    if (data?.customer_id && data.customer_id !== 'guest') {
      try {
        await createNotification({
          userId: data.customer_id,
          title: 'สร้างรายการจองคิวสำเร็จ',
          message: `เจ้าหน้าที่ได้สร้างรายการจอง ${data.product_name || 'เข้าชมสินค้า'} วันที่ ${data.booking_date} เวลา ${data.booking_time} น. ให้คุณเรียบร้อยแล้ว`,
          type: 'info'
        });
      } catch (notiErr) {
        console.error('⚠️ แจ้งเตือนตอน adminCreateBooking ไม่สำเร็จ:', notiErr.message);
      }
    }

    res.status(201).json({ message: 'เพิ่มการจองแล้ว', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// แก้ไขรายละเอียดการจอง (สถานะเปลี่ยนผ่าน updateBookingStatus)
const EDIT_FIELDS = ['booking_date', 'booking_time', 'inventory_id', 'product_name', 'location_name', 'customer_id', 'note'];

export const adminUpdateBooking = async (req, res) => {
  try {
    const row = Object.fromEntries(EDIT_FIELDS.filter((k) => req.body[k] !== undefined).map((k) => [k, req.body[k] === '' ? null : req.body[k]]));
    if (!row.booking_date || !row.booking_time) return res.status(400).json({ message: 'กรุณาเลือกวันและเวลา' });
    if (!row.customer_id) row.customer_id = 'guest';
    if (await slotTaken(row, req.params.id)) return res.status(400).json({ message: 'ช่วงเวลานี้ที่สาขานี้ถูกจองไปแล้ว' });

    const { data, error } = await supabase.from('bookings').update(row).eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบข้อมูลการจอง' });
    res.json({ message: 'แก้ไขการจองแล้ว', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({ message: `สถานะต้องเป็น ${BOOKING_STATUSES.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบข้อมูลการจอง' });

    // ส่งแจ้งเตือนให้ลูกค้าตามสถานะที่ Admin กดเปลี่ยน
    if (data.customer_id && data.customer_id !== 'guest') {
      try {
        if (status === 'confirmed') {
          await createNotification({
            userId: data.customer_id,
            title: 'ยืนยันการจองคิวสำเร็จ',
            message: `รายการจอง ${data.product_name || 'เข้าชมสินค้า'} วันที่ ${data.booking_date} เวลา ${data.booking_time} น. ได้รับการยืนยันเรียบร้อยแล้ว`,
            type: 'success'
          });
        } else if (status === 'completed') {
          await createNotification({
            userId: data.customer_id,
            title: 'การเข้าใช้บริการเสร็จสมบูรณ์',
            message: `รายการจอง ${data.product_name || 'เข้าชมสินค้า'} วันที่ ${data.booking_date} เวลา ${data.booking_time} น. ดำเนินการเสร็จสิ้นแล้ว ขอบคุณที่ใช้บริการ`,
            type: 'success'
          });
        } else if (status === 'cancelled') {
          await createNotification({
            userId: data.customer_id,
            title: 'รายการจองถูกยกเลิก',
            message: `รายการจอง ${data.product_name || 'เข้าชมสินค้า'} วันที่ ${data.booking_date} เวลา ${data.booking_time} น. ถูกยกเลิกแล้ว`,
            type: 'error'
          });
        }
      } catch (notiErr) {
        console.error('⚠️ สร้างแจ้งเตือนตอนอัปเดตสถานะไม่สำเร็จ:', notiErr.message);
      }
    }

    return res.status(200).json({ message: 'อัปเดตสถานะเรียบร้อย', data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ---------- สาขา ----------
const locationBody = (body) => ({
  name: String(body.name || '').trim(),
  description: String(body.description || '').trim() || null,
  address: String(body.address || '').trim() || null,
  is_active: body.is_active === undefined ? true : body.is_active === true || body.is_active === 'true',
});

export const getLocations = async (req, res) => {
  try {
    const { data, error } = await supabase.from('locations').select('*').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const saveLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const row = locationBody(req.body);
    if (!row.name) return res.status(400).json({ message: 'กรุณาใส่ชื่อสาขา' });

    let query = supabase.from('locations').select('id').ilike('name', row.name);
    if (id) query = query.neq('id', id);
    const { data: taken } = await query.limit(1);
    if (taken && taken.length) return res.status(400).json({ message: `มีสาขาชื่อ ${row.name} แล้ว` });

    const { data: before } = id ? await supabase.from('locations').select('name').eq('id', id).maybeSingle() : { data: null };
    const request = id ? supabase.from('locations').update(row).eq('id', id) : supabase.from('locations').insert(row);
    const { data, error } = await request.select('*').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบสาขา' });

    // bookings เก็บชื่อสาขาเป็นข้อความ เปลี่ยนชื่อสาขาแล้วให้การจองเดิมเปลี่ยนตาม (อยู่ service เดียวกัน)
    if (before && before.name !== row.name) {
      await supabase.from('bookings').update({ location_name: row.name }).eq('location_name', before.name);
    }
    res.json({ message: 'บันทึกสาขาแล้ว', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const { data: loc } = await supabase.from('locations').select('name').eq('id', req.params.id).maybeSingle();
    if (!loc) return res.status(404).json({ message: 'ไม่พบสาขา' });

    const { count } = await supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('location_name', loc.name);
    if (count) return res.status(400).json({ message: `สาขานี้มีการจอง ${count} รายการ ปิดใช้งานแทนการลบ` });

    const { error } = await supabase.from('locations').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'ลบสาขาแล้ว' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- internal API ----------
// จำนวนการจองทั้งหมด + แยกตามสถานะ (ไม่มีสถานะ = รอยืนยัน)
export const internalStats = async (req, res) => {
  const count = (status) => {
    const query = supabase.from('bookings').select('*', { count: 'exact', head: true });
    if (!status) return query;
    return status === 'pending' ? query.or('status.is.null,status.eq.pending') : query.eq('status', status);
  };
  // วันนี้ตามเวลาไทย (container ใช้เวลา UTC)
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' });
  const results = await Promise.all([
    count(), ...BOOKING_STATUSES.map(count),
    count().eq('booking_date', today).or('status.is.null,status.neq.cancelled'),
    count().gt('booking_date', today).or('status.is.null,status.neq.cancelled'),
  ]);
  const failed = results.find((r) => r.error);
  if (failed) return res.status(500).json({ message: failed.error.message });

  const byStatus = Object.fromEntries(BOOKING_STATUSES.map((s, i) => [s, results[i + 1].count ?? 0]));
  const [todayCount, upcomingCount] = results.slice(-2).map((r) => r.count ?? 0);
  res.json({
    bookings: results[0].count ?? 0, pendingBookings: byStatus.pending, bookingsByStatus: byStatus,
    todayBookings: todayCount, upcomingBookings: upcomingCount,
  });
};

export const internalCount = async (req, res) => {
  let query = supabase.from('bookings').select('*', { count: 'exact', head: true });
  if (req.query.inventory_id) query = query.eq('inventory_id', req.query.inventory_id);
  const { count, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  res.json({ count: count ?? 0 });
};