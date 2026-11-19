// Booking Service: การจอง / สาขา (schema booking)
import { bookingDb as supabase } from '../../Config/db.js';

const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

// แอดมินจองแทนลูกค้า: ใช้ customer_id ที่เลือกในฟอร์ม (createBooking ของทีมใช้คนที่ login อยู่)
export const adminCreateBooking = async (req, res) => {
  try {
    const { booking_date, booking_time, inventory_id, location_name, product_name, customer_id, note } = req.body;
    if (!booking_date || !booking_time) return res.status(400).json({ message: 'กรุณาเลือกวันและเวลา' });

    let check = supabase.from('bookings').select('id').eq('booking_date', booking_date).eq('booking_time', booking_time).neq('status', 'cancelled');
    if (location_name) check = check.eq('location_name', location_name);
    const { data: taken, error: checkError } = await check;
    if (checkError) throw checkError;
    if (taken.length) return res.status(400).json({ message: 'ช่วงเวลานี้ที่สาขานี้ถูกจองไปแล้ว' });

    const { data, error } = await supabase
      .from('bookings')
      .insert({ booking_date, booking_time, inventory_id, location_name, product_name, note, customer_id: customer_id || 'guest', status: 'pending' })
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json({ message: 'เพิ่มการจองแล้ว', data });
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
    const { data, error } = await supabase.from('bookings').update({ status }).eq('id', req.params.id).select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบข้อมูลการจอง' });
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
export const internalStats = async (req, res) => {
  const total = await supabase.from('bookings').select('*', { count: 'exact', head: true });
  const pending = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  if (total.error || pending.error) return res.status(500).json({ message: (total.error || pending.error).message });
  res.json({ bookings: total.count ?? 0, pendingBookings: pending.count ?? 0 });
};

export const internalCount = async (req, res) => {
  let query = supabase.from('bookings').select('*', { count: 'exact', head: true });
  if (req.query.inventory_id) query = query.eq('inventory_id', req.query.inventory_id);
  const { count, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  res.json({ count: count ?? 0 });
};
