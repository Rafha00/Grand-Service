import { bookingDb as supabase } from '../Config/db.js';
export const getUserNotifications = async (req, res) => {
  try {
    const { customerId } = req.params;

    const { data, error } = await supabase
      .from('Notifications')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// อัปเดตสถานะเป็น "อ่านแล้ว"
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
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