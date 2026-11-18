import { authDb, catalogDb, inventoryDb, bookingDb } from '../Config/db.js';
import { callService } from '../Services/internal.js';

// ==========================================
// สิทธิ์: allow('Admin', 'Manager') = ให้ผ่านเฉพาะ role ที่ระบุ
// อ่าน role ล่าสุดจาก Auth Service (ไม่ใช้ค่าใน token) ถ้าโดนลดสิทธิ์จะมีผลทันที
// ==========================================
export const STAFF_ROLES = ['Admin', 'Manager', 'Staff'];

export const allow = (...roles) => async (req, res, next) => {
  try {
    if (!req.role) {
      const user = await callService('auth', `/internal/auth/users/${encodeURIComponent(req.user.id)}`).catch(() => null);
      req.role = user && user.role;
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
export const adminOnly = allow('Admin');

// ข้อมูลของลูกค้า: เจ้าของดูได้เฉพาะของตัวเอง, พนักงานดูได้ทุกคน
export const selfOrStaff = (param) => (req, res, next) => {
  if (String(req.params[param]) === String(req.user.id)) return next();
  return staffOnly(req, res, next);
};

// ใช้ใน Booking Service (เจ้าของตาราง Notifications)
export const ownsNotification = async (req, res, next) => {
  const { data } = await bookingDb.from('Notifications').select('customer_id').eq('id', req.params.id).maybeSingle();
  if (data && String(data.customer_id) === String(req.user.id)) return next();
  return staffOnly(req, res, next);
};

// ==========================================
// Audit log: audit('products', 'UPDATE')
// อ่านค่าก่อนแก้จาก database ของ service ที่เป็นเจ้าของ แล้วส่งบันทึกไปที่ Admin Service
// ==========================================
const TABLES = {
  users: [authDb, 'Profiles'],
  products: [catalogDb, 'Products'],
  brands: [catalogDb, 'brands'],
  categories: [catalogDb, 'Categories'],
  inventory: [inventoryDb, 'Inventory'],
  bookings: [bookingDb, 'bookings'],
  locations: [bookingDb, 'locations'],
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
  const data = body && (body.data !== undefined ? body.data : body.product || body);
  const row = Array.isArray(data) ? data[0] : data;
  return (row && row.id) || null;
};

export const audit = (entity, action) => async (req, res, next) => {
  const id = req.params.id || null;
  let before = null;
  if (id) {
    const [db, table] = TABLES[entity];
    const { data } = await db.from(table).select('*').eq('id', id).maybeSingle();
    before = data;
  }

  const sendJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode < 400) {
      callService('admin', '/internal/admin/audit', {
        method: 'POST',
        body: {
          user_id: req.user.id,
          action,
          entity,
          entity_id: id || createdId(body),
          old_value: toText(before),
          new_value: action === 'DELETE' ? null : toText(req.body),
        },
      }).catch((err) => console.error('Audit log error:', err.message));
    }
    return sendJson(body);
  };
  next();
};
