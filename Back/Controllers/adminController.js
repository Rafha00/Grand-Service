import { adminDb as supabase } from '../Config/adminSupabase.js';


const ALLOWED_ROLES = ['Customer', 'Staff', 'Manager', 'Admin'];
const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

// ตัดข้อมูลลับออกก่อนส่งกลับไปหน้าเว็บ
const toSafeUser = (user) => {
  const { password_hash, otp, otp_expires_at, ...safe } = user;
  return safe;
};

// Dashboard

export const getStats = async (req, res) => {
  try {
    const countRows = async (table, filter) => {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });
      if (filter) query = filter(query);
      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    };

    const [users, products, bookings, pendingBookings, inventory] = await Promise.all([
      countRows('Profiles'),
      countRows('Products'),
      countRows('bookings'),
      countRows('bookings', (q) => q.eq('status', 'pending')),
      countRows('Inventory'),
    ]);

    return res.status(200).json({ users, products, bookings, pendingBookings, inventory });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ผู้ใช้ / Role

export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('Profiles').select('*');
    if (error) throw error;
    return res.status(200).json(data.map(toSafeUser));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('Profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    return res.status(200).json(toSafeUser(data));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: `Role ต้องเป็น ${ALLOWED_ROLES.join(', ')}` });
    }
    // กันแอดมินลดสิทธิ์ตัวเองจนเข้าระบบไม่ได้
    if (String(req.user.id) === String(id)) {
      return res.status(400).json({ message: 'ไม่สามารถเปลี่ยน Role ของตัวเองได้' });
    }

    const { data, error } = await supabase
      .from('Profiles')
      .update({ role })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    return res.status(200).json({ message: 'เปลี่ยน Role เรียบร้อย', user: toSafeUser(data) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// แก้ข้อมูลทั่วไปของผู้ใช้ (ไม่รวมรหัสผ่าน / role)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const email = String(req.body.email || '').trim().toLowerCase();
    const full_name = String(req.body.full_name || '').trim() || null;
    const phone = String(req.body.phone || '').trim() || null;

    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    if (phone && !/^[0-9+\-\s]{9,15}$/.test(phone)) return res.status(400).json({ message: 'เบอร์โทรไม่ถูกต้อง' });

    const { data: taken } = await supabase.from('Profiles').select('id').eq('email', email).neq('id', id).maybeSingle();
    if (taken) return res.status(400).json({ message: 'อีเมลนี้มีผู้ใช้อื่นใช้แล้ว' });

    const { data, error } = await supabase
      .from('Profiles')
      .update({ email, full_name, phone })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    return res.status(200).json({ message: 'แก้ไขข้อมูลผู้ใช้เรียบร้อย', user: toSafeUser(data) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user.id) === String(id)) {
      return res.status(400).json({ message: 'ไม่สามารถลบบัญชีของตัวเองได้' });
    }

    const { error } = await supabase.from('Profiles').delete().eq('id', id);
    if (error) throw error;
    return res.status(200).json({ message: 'ลบผู้ใช้เรียบร้อย' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================================
// สินค้า: ลบพร้อมรูป (ตาราง Product_Images ผูก foreign key กับ Products ไว้)
// ==========================================
const PRODUCT_BUCKET = 'product-images';

// ดึงชื่อไฟล์ใน Storage จาก public URL (ถ้าเป็นลิงก์ภายนอกจะได้ null)
const storagePathFromUrl = (url) => {
  const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;
  const index = (url || '').indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
};

// สินค้า: เพิ่มรูป ทั้งไฟล์ (images) และลิงก์ (image_urls เป็น JSON array หรือข้อความบรรทัดละลิงก์)
export const addProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    let urls = req.body.image_urls || [];
    if (typeof urls === 'string') {
      try { urls = JSON.parse(urls); } catch { urls = urls.split('\n'); }
    }
    urls = [].concat(urls).map((u) => String(u).trim()).filter(Boolean);
    const bad = urls.find((u) => !/^https?:\/\/\S+$/i.test(u));
    if (bad) return res.status(400).json({ message: `ลิงก์รูปไม่ถูกต้อง: ${bad}` });

    const files = req.files || [];
    if (urls.length + files.length === 0) return res.status(400).json({ message: 'ไม่มีรูปที่จะเพิ่ม' });

    const { count } = await supabase.from('Product_Images').select('*', { count: 'exact', head: true }).eq('product_id', id);
    let order = count || 0;

    for (const file of files) {
      const path = `${id}-${Date.now()}-${order}.${file.originalname.split('.').pop()}`;
      const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      urls.push(supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path).data.publicUrl);
    }

    const rows = urls.map((image_url) => ({ product_id: id, image_url, sort_order: order++ }));
    const { data, error } = await supabase.from('Product_Images').insert(rows).select();
    if (error) throw error;
    res.json({ message: `เพิ่มรูป ${data.length} รูปแล้ว`, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // ไม่ลบสินค้าที่ยังมีของในสต็อก เพื่อไม่ให้ข้อมูลสต็อกหายไปด้วย
    const { count: stockCount, error: stockError } = await supabase
      .from('Inventory')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', id);
    if (stockError) throw stockError;
    if (stockCount > 0) {
      return res.status(400).json({ message: `สินค้านี้ยังมีในสต็อก ${stockCount} รายการ กรุณาลบรายการในหน้าสต็อกก่อน` });
    }

    // ไม่ลบสินค้าที่ยังมีการจองผูกอยู่ (ตาราง bookings เก็บรหัสสินค้าไว้ใน inventory_id)
    const { count: bookingCount, error: bookingError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('inventory_id', id);
    if (bookingError) throw bookingError;
    if (bookingCount > 0) {
      return res.status(400).json({ message: `สินค้านี้ยังมีการจอง ${bookingCount} รายการ กรุณาลบการจองในหน้าการจองก่อน` });
    }

    // 1. เก็บรูปไว้ก่อน เผื่อต้องคืนค่า แล้วลบออกจากตาราง
    const { data: images, error: imagesError } = await supabase
      .from('Product_Images')
      .select('*')
      .eq('product_id', id);
    if (imagesError) throw imagesError;

    // ถ้า Supabase เปิด RLS แต่ไม่มี policy ให้ลบ จะไม่ error แต่ลบได้ 0 แถว จึงต้องเช็คจำนวนที่ลบได้จริง
    const rlsHint = (table) => `ฐานข้อมูลไม่ยอมให้ลบตาราง ${table} (RLS ใน Supabase ไม่มี policy สำหรับ DELETE) ให้เจ้าของโปรเจกต์เพิ่ม policy หรือใช้ service role key`;

    if (images.length > 0) {
      const { data: removed, error } = await supabase.from('Product_Images').delete().eq('product_id', id).select('id');
      if (error) throw error;
      if (removed.length === 0) return res.status(403).json({ message: rlsHint('Product_Images') });
    }

    // 2. ลบสินค้า ถ้าไม่สำเร็จให้คืนรูปกลับ
    const { data: deleted, error: productError } = await supabase.from('Products').delete().eq('id', id).select('id');
    if (productError || deleted.length === 0) {
      if (images.length > 0) await supabase.from('Product_Images').insert(images);
      let message = rlsHint('Products');
      if (productError) {
        message = productError.code === '23503'
          ? 'ลบไม่ได้ เพราะยังมีข้อมูลอื่นอ้างถึงสินค้านี้อยู่ (เช่น การจอง)'
          : productError.message;
      }
      return res.status(400).json({ message });
    }

    // 3. ลบไฟล์รูปใน Storage (เฉพาะรูปที่อัปโหลดผ่านระบบ)
    const paths = images.map((img) => storagePathFromUrl(img.image_url)).filter(Boolean);
    if (paths.length > 0) {
      await supabase.storage.from(PRODUCT_BUCKET).remove(paths);
    }

    return res.status(200).json({ message: 'ลบสินค้าเรียบร้อย' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================================
// การจอง
// ==========================================
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({ message: `สถานะต้องเป็น ${BOOKING_STATUSES.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบข้อมูลการจอง' });
    return res.status(200).json({ message: 'อัปเดตสถานะเรียบร้อย', data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================================
// สต็อก
// ==========================================
export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('Inventory').delete().eq('id', id);
    if (error) throw error;
    return res.status(200).json({ message: 'ลบรายการสต็อกเรียบร้อย' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================================
// Audit log (200 รายการล่าสุด พร้อมชื่อ/อีเมลผู้ทำรายการ)
// ==========================================
export const getAuditLogs = async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('Audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;

    const userIds = [...new Set(logs.map((log) => log.user_id).filter(Boolean))];
    const { data: users } = userIds.length
      ? await supabase.from('Profiles').select('id, email, full_name, role').in('id', userIds)
      : { data: [] };
    const byId = Object.fromEntries((users || []).map((u) => [u.id, u]));

    return res.status(200).json(logs.map((log) => ({ ...log, user: byId[log.user_id] || null })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================================
// สาขา (ตาราง locations)
// ==========================================
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
    const request = id
      ? supabase.from('locations').update(row).eq('id', id)
      : supabase.from('locations').insert(row);
    const { data, error } = await request.select('*').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบสาขา' });

    // bookings เก็บชื่อสาขาเป็นข้อความ เปลี่ยนชื่อสาขาแล้วให้การจองเดิมเปลี่ยนตาม
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
    const { id } = req.params;
    const { data: loc } = await supabase.from('locations').select('name').eq('id', id).maybeSingle();
    if (!loc) return res.status(404).json({ message: 'ไม่พบสาขา' });

    const { count } = await supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('location_name', loc.name);
    if (count) return res.status(400).json({ message: `สาขานี้มีการจอง ${count} รายการ ปิดใช้งานแทนการลบ` });

    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'ลบสาขาแล้ว' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
