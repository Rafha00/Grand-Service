// Auth Service: จัดการผู้ใช้ / Role (ตาราง Profiles ใน schema auth_svc)
import jwt from 'jsonwebtoken';
import { authDb as supabase } from '../../Config/db.js';

const ALLOWED_ROLES = ['Customer', 'Staff', 'Manager', 'Admin'];

// ตัดข้อมูลลับออกก่อนส่งกลับ
const toSafeUser = (user) => {
  const { password_hash, otp, otp_expires_at, ...safe } = user;
  return safe;
};

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
    const { data, error } = await supabase.from('Profiles').select('*').eq('id', req.params.id).maybeSingle();
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

    const { data, error } = await supabase.from('Profiles').update({ role }).eq('id', id).select('*').maybeSingle();
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

    const { data, error } = await supabase.from('Profiles').update({ email, full_name, phone }).eq('id', id).select('*').maybeSingle();
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

// ---------- internal API (ให้ service อื่นเรียก) ----------
const PUBLIC_FIELDS = 'id, email, full_name, role';

export const internalGetUser = async (req, res) => {
  const { data, error } = await supabase.from('Profiles').select(PUBLIC_FIELDS).eq('id', req.params.id).maybeSingle();
  if (error) return res.status(500).json({ message: error.message });
  if (!data) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
  res.json(data);
};

export const internalLookupUsers = async (req, res) => {
  const ids = [].concat(req.body.ids || []).filter(Boolean);
  if (!ids.length) return res.json([]);
  const { data, error } = await supabase.from('Profiles').select(PUBLIC_FIELDS).in('id', ids);
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

export const internalStats = async (req, res) => {
  const { count, error } = await supabase.from('Profiles').select('*', { count: 'exact', head: true });
  if (error) return res.status(500).json({ message: error.message });
  res.json({ users: count ?? 0 });
};

// ---------- JWT check ที่ API Gateway ----------
// Nginx เรียก endpoint นี้ก่อนส่ง request ต่อ (auth_request)
// ?required=1 = ต้อง login (ใช้กับ /api/admin) ไม่งั้นได้ 401 ที่ Gateway เลย
export const gatewayCheck = async (req, res) => {
  const token = req.cookies && req.cookies.auth_token;
  const required = req.query.required === '1';
  if (!token) return required ? res.status(401).end() : res.status(204).end();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data } = await supabase.from('Profiles').select('role').eq('id', decoded.id).maybeSingle();
    if (!data) return required ? res.status(401).end() : res.status(204).end();
    res.set('X-User-Id', String(decoded.id));
    res.set('X-User-Role', data.role || '');
    return res.status(204).end();
  } catch {
    return required ? res.status(401).end() : res.status(204).end();
  }
};
