import { adminDb } from '../Config/adminSupabase.js';

// ==========================================
// สิทธิ์: allow('Admin', 'Manager') = ให้ผ่านเฉพาะ role ที่ระบุ
// อ่าน role ล่าสุดจากฐานข้อมูล (ไม่ใช้ค่าใน token) ถ้าโดนลดสิทธิ์จะมีผลทันที
// ==========================================
export const STAFF_ROLES = ['Admin', 'Manager', 'Staff'];

export const allow = (...roles) => async (req, res, next) => {
  try {
    if (!req.role) {
      const { data, error } = await adminDb.from('Profiles').select('role').eq('id', req.user.id).maybeSingle();
      if (error) throw error;
      req.role = data && data.role;
    }
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: `ส่วนนี้สำหรับ ${roles.join(' / ')} เท่านั้น` });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const staffOnly = allow(...STAFF_ROLES);
export const managerOnly = allow('Admin', 'Manager');

// ข้อมูลของลูกค้า: เจ้าของดูได้เฉพาะของตัวเอง, พนักงานดูได้ทุกคน
export const selfOrStaff = (param) => (req, res, next) => {
  if (String(req.params[param]) === String(req.user.id)) return next();
  return staffOnly(req, res, next);
};

export const ownsNotification = async (req, res, next) => {
  const { data } = await adminDb.from('notifications').select('customer_id').eq('id', req.params.id).maybeSingle();
  if (data && String(data.customer_id) === String(req.user.id)) return next();
  return staffOnly(req, res, next);
};

// ==========================================
// Audit log: audit('products', 'UPDATE') = บันทึกลงตาราง Audit_logs เมื่อทำรายการสำเร็จ
// เก็บค่าก่อนแก้ (old_value) และค่าที่ส่งมา (new_value)
// ==========================================
const TABLES = {
  users: 'Profiles',
  products: 'Products',
  brands: 'brands',
  locations: 'locations',
  categories: 'Categories',
  inventory: 'Inventory',
  bookings: 'bookings',
};
const SECRET_FIELDS = ['password_hash', 'otp', 'otp_expires_at'];

const toText = (value) => {
  if (!value || Object.keys(value).length === 0) return null;
  const copy = { ...value };
  SECRET_FIELDS.forEach((key) => delete copy[key]);
  return JSON.stringify(copy);
};

// หา id ของรายการที่เพิ่งสร้าง จาก response ของ controller (แต่ละตัวส่งกลับไม่เหมือนกัน)
const createdId = (body) => {
  const data = body && (body.data !== undefined ? body.data : body);
  const row = Array.isArray(data) ? data[0] : data;
  return (row && row.id) || null;
};

export const audit = (entity, action) => async (req, res, next) => {
  const id = req.params.id || null;
  let before = null;
  if (id) {
    const { data } = await adminDb.from(TABLES[entity]).select('*').eq('id', id).maybeSingle();
    before = data;
  }

  const sendJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode < 400) {
      adminDb.from('Audit_logs').insert({
        user_id: req.user.id,
        action,
        entity,
        entity_id: id || createdId(body),
        old_value: toText(before),
        new_value: action === 'DELETE' ? null : toText(req.body),
      }).then(({ error }) => {
        if (error) console.error('Audit log error:', error.message);
      });
    }
    return sendJson(body);
  };
  next();
};
