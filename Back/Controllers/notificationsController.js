import { bookingDb as supabase, authDb } from '../Config/db.js';

// ซิงก์ข้อมูลพื้นฐานผู้ใช้จาก auth_svc.Profiles มาไว้ใน Profiles ของ bookingDb (เพื่อให้ผ่าน Foreign Key)
const ensureProfile = async (userId) => {
  if (!userId) return null;

  // 1. เช็กว่ามี ID นี้ใน Profiles แล้วหรือยัง
  const { data: existing } = await supabase
    .from('Profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // 2. ถ้ายังไม่มี ให้ดึงข้อมูลพื้นฐานจาก auth_svc.Profiles (ไม่ดึง password_hash)
  const { data: authUser, error: authErr } = await authDb
    .from('Profiles')
    .select('id, email, role, full_name, phone')
    .eq('id', userId)
    .maybeSingle();

  if (authErr || !authUser) return userId;

  // 3. ซิงก์ลงตาราง Profiles
  const { data: created, error: insertErr } = await supabase
    .from('Profiles')
    .upsert([{
      id: authUser.id,
      email: authUser.email,
      role: authUser.role || 'Customer',
      full_name: authUser.full_name || null,
      phone: authUser.phone || null
    }])
    .select('id')
    .single();

  if (insertErr) return userId;
  return created.id;
};

// ดึงรายการแจ้งเตือน (เช็กสิทธิ์เจ้าของบัญชี ป้องกัน IDOR)
export const getUserNotifications = async (req, res) => {
  try {
    const loggedInUserId = req.user?.id;
    const requestedId = req.params.customerId;

    if (!loggedInUserId || loggedInUserId !== requestedId) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลแจ้งเตือนของผู้อื่น' });
    }

    const { data, error } = await supabase
      .from('Notifications')
      .select('*')
      .eq('user_id', loggedInUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// อัปเดตสถานะเป็น "อ่านแล้ว" (ทีละรายการ เฉพาะของตัวเอง)
export const markAsRead = async (req, res) => {
  try {
    const loggedInUserId = req.user?.id;
    const { id } = req.params;

    if (!loggedInUserId) {
      return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบ' });
    }

    const { data, error } = await supabase
      .from('Notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', loggedInUserId)
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// อัปเดตสถานะเป็น "อ่านแล้วทั้งหมด" (เฉพาะของตัวเอง)
export const markAllAsRead = async (req, res) => {
  try {
    const loggedInUserId = req.user?.id;
    const requestedId = req.params.customerId;

    if (!loggedInUserId || loggedInUserId !== requestedId) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์แก้ไขข้อมูลของผู้อื่น' });
    }

    const { data, error } = await supabase
      .from('Notifications')
      .update({ is_read: true })
      .eq('user_id', loggedInUserId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// สร้างการแจ้งเตือนใหม่ (เรียกใช้ภายใน Backend เท่านั้น)
export const createNotification = async ({ userId, title, message, type = 'info' }) => {
  const validProfileId = await ensureProfile(userId);

  const { data, error } = await supabase
    .from('Notifications')
    .insert([{
      user_id: validProfileId,
      title,
      message,
      type,
      is_read: false
    }])
    .select();

  if (error) {
    console.error('❌ Error creating notification:', error.message);
    throw error;
  }
  return data;
};