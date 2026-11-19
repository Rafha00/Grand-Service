import { bookingDb as supabase } from '../Config/db.js';

export const getLocations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, description, address, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Error in getLocations:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};