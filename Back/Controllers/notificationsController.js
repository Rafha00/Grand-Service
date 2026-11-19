import { publicDb, authDb } from '../Config/db.js';

// ซิงก์เฉพาะข้อมูลพื้นฐานที่จำเป็น (ไม่ก๊อปปี้ password_hash ข้ามตาราง)
const ensurePublicProfile = async (userId) => {
  if (!userId) return null;

  const { data: existing } = await publicDb
    .from('Profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: authUser, error: authErr } = await authDb
    .from('Profiles')
    .select('id, email, role, full_name, phone')
    .eq('id', userId)
    .maybeSingle();

  if (authErr || !authUser) return userId;

  const { data: created, error: insertErr } = await publicDb
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

// ดึงรายการแจ้งเตือน (เช็กสิทธิ์ว่าต้องเป็นเจ้าของบัญชีเท่านั้น)
export const getUserNotifications = async (req, res) => {
  try {
    const loggedInUserId = req.user?.id;
    const requestedId = req.params.customerId;

    // ป้องกัน IDOR: ห้ามดึงแจ้งเตือนของ User ID อื่นที่ไม่ใช่ตัวเอง
    if (!loggedInUserId || loggedInUserId !== requestedId) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลแจ้งเตือนของผู้อื่น' });
    }

    const { data, error } = await publicDb
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

// อัปเดตสถานะเป็น "อ่านแล้ว" (เช็กว่าเป็นแจ้งเตือนของตัวเองเท่านั้น)
export const markAsRead = async (req, res) => {
  try {
    const loggedInUserId = req.user?.id;
    const { id } = req.params;

    if (!loggedInUserId) {
      return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบ' });
    }

    const { data, error } = await publicDb
      .from('Notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', loggedInUserId) // ล็อกเงื่อนไขต้องเป็นของ user คนนี้เท่านั้น
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// อัปเดตสถานะเป็น "อ่านแล้วทั้งหมด" (เช็กสิทธิ์เจ้าของบัญชี)
export const markAllAsRead = async (req, res) => {
  try {
    const loggedInUserId = req.user?.id;
    const requestedId = req.params.customerId;

    if (!loggedInUserId || loggedInUserId !== requestedId) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์แก้ไขข้อมูลของผู้อื่น' });
    }

    const { data, error } = await publicDb
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

// สร้างการแจ้งเตือนใหม่ (เรียกใช้ภายใน Backend เท่านั้น ไม่เปิดเป็น Public Route)
export const createNotification = async ({ userId, title, message, type = 'info' }) => {
  const validProfileId = await ensurePublicProfile(userId);

  const { data, error } = await publicDb
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