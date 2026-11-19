// Admin Service: ภาพรวม + ประวัติการแก้ไข (schema admin)
// ภาพรวมรวบรวมตัวเลขจากทุก service ผ่าน API (ไม่อ่าน database ของ service อื่น)
import { adminDb as supabase } from '../../Config/db.js';
import { callService } from '../../Services/internal.js';

export const getStats = async (req, res) => {
  try {
    const parts = await Promise.all([
      callService('auth', '/internal/auth/stats'),
      callService('catalog', '/internal/catalog/stats'),
      callService('inventory', '/internal/inventory/stats'),
      callService('booking', '/internal/booking/stats'),
    ]);
    return res.status(200).json(Object.assign({}, ...parts));
  } catch (err) {
    return res.status(502).json({ message: `ดึงภาพรวมไม่ได้: ${err.message}` });
  }
};

// 200 รายการล่าสุด พร้อมชื่อ/อีเมลผู้ทำรายการ (ขอจาก Auth Service)
export const getAuditLogs = async (req, res) => {
  try {
    const { data: logs, error } = await supabase.from('Audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;

    const ids = [...new Set(logs.map((log) => log.user_id).filter(Boolean))];
    const users = ids.length ? await callService('auth', '/internal/auth/users/lookup', { method: 'POST', body: { ids } }).catch(() => []) : [];
    const byId = Object.fromEntries(users.map((u) => [u.id, u]));

    return res.status(200).json(logs.map((log) => ({ ...log, user: byId[log.user_id] || null })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ---------- internal API: service อื่นส่งบันทึกมาที่นี่ ----------
const FIELDS = ['user_id', 'action', 'entity', 'entity_id', 'old_value', 'new_value'];

export const internalWriteAudit = async (req, res) => {
  const row = Object.fromEntries(FIELDS.map((k) => [k, req.body[k] ?? null]));
  const { error } = await supabase.from('Audit_logs').insert(row);
  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json({ ok: true });
};
