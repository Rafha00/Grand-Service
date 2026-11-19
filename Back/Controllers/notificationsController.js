import { publicDb, authDb } from '../Config/db.js';

// ฟังก์ชันซิงก์ข้อมูลผู้ใช้จาก auth_svc.Profiles มาไว้ใน public.Profiles อัตโนมัติ (เพื่อให้ผ่าน Foreign Key)
const ensurePublicProfile = async (userId) => {
  if (!userId) return null;

  // 1. เช็กว่ามี ID นี้ใน public.Profiles แล้วหรือยัง
  const { data: existing } = await publicDb
    .from('Profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // 2. ถ้ายังไม่มี ให้ดึงข้อมูลผู้ใช้จาก auth_svc.Profiles (authDb)
  const { data: authUser, error: authErr } = await authDb
    .from('Profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (authErr || !authUser) {
    console.error('❌ ไม่พบข้อมูลผู้ใช้ใน auth_svc.Profiles:', authErr?.message);
    return userId;
  }

  // 3. นำข้อมูลมาสร้างใน public.Profiles ให้มี ID ตรงกัน
  const { data: created, error: insertErr } = await publicDb
    .from('Profiles')
    .upsert([{
      id: authUser.id,
      email: authUser.email,
      password_hash: authUser.password_hash || 'synced_from_auth_svc',
      role: authUser.role || 'Customer',
      full_name: authUser.full_name || null,
      phone: authUser.phone || null
    }])
    .select('id')
    .single();

  if (insertErr) {
    console.error('❌ ซิงก์ข้อมูลลง public.Profiles ไม่สำเร็จ:', insertErr.message);
    return userId;
  }

  return created.id;
};

// ดึงรายการแจ้งเตือนของลูกค้า
export const getUserNotifications = async (req, res) => {
  try {
    const { customerId } = req.params;

    const { data, error } = await publicDb
      .from('Notifications')
      .select('*')
      .eq('user_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// อัปเดตสถานะเป็น "อ่านแล้ว" (ทีละรายการ)
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await publicDb
      .from('Notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// อัปเดตสถานะเป็น "อ่านแล้วทั้งหมด"
export const markAllAsRead = async (req, res) => {
  try {
    const { customerId } = req.params;

    const { data, error } = await publicDb
      .from('Notifications')
      .update({ is_read: true })
      .eq('user_id', customerId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// สร้างการแจ้งเตือนใหม่
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