// Inventory Service: สต็อก (schema inventory)
import { inventoryDb as supabase } from '../../Config/db.js';

export const deleteInventory = async (req, res) => {
  try {
    const { error } = await supabase.from('Inventory').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(200).json({ message: 'ลบรายการสต็อกเรียบร้อย' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ---------- internal API ----------
// จำนวนสต็อกทั้งหมด + แยกตามสถานะ
const STOCK_STATUSES = ['available', 'reserved', 'sold'];

export const internalStats = async (req, res) => {
  const count = (status) => {
    const query = supabase.from('Inventory').select('*', { count: 'exact', head: true });
    return status ? query.eq('status', status) : query;
  };
  const results = await Promise.all([count(), ...STOCK_STATUSES.map(count)]);
  const failed = results.find((r) => r.error);
  if (failed) return res.status(500).json({ message: failed.error.message });

  const byStatus = Object.fromEntries(STOCK_STATUSES.map((s, i) => [s, results[i + 1].count ?? 0]));
  res.json({ inventory: results[0].count ?? 0, inventoryByStatus: byStatus });
};

export const internalCount = async (req, res) => {
  let query = supabase.from('Inventory').select('*', { count: 'exact', head: true });
  if (req.query.product_id) query = query.eq('product_id', req.query.product_id);
  const { count, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  res.json({ count: count ?? 0 });
};
