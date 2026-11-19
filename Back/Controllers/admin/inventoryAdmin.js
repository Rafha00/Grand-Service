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
export const internalStats = async (req, res) => {
  const { count, error } = await supabase.from('Inventory').select('*', { count: 'exact', head: true });
  if (error) return res.status(500).json({ message: error.message });
  res.json({ inventory: count ?? 0 });
};

export const internalCount = async (req, res) => {
  let query = supabase.from('Inventory').select('*', { count: 'exact', head: true });
  if (req.query.product_id) query = query.eq('product_id', req.query.product_id);
  const { count, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  res.json({ count: count ?? 0 });
};
