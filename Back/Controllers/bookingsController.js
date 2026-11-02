import { supabase } from '../Config/supabaseClient.js';
export const getAllBookings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false }); // เรียงจากล่าสุดไปเก่า (ปรับได้)

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get:id: ดึงข้อมูลการจองเฉพาะรายการ (ใช้ดูรายละเอียดแต่ละเคส)
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single(); // บังคับให้ดึงมาแค่ 1 record

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบข้อมูลการจอง' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Post: สร้างการจองใหม่ (รับข้อมูลจากหน้าเว็บผู้ใช้มาบันทึก)
export const createBooking = async (req, res) => {
  try {
    const { 
      booking_date, 
      booking_time, 
      inventory_id, 
      location_name, 
      product_name, 
      customer_id, 
      note 
    } = req.body;

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        { 
          customer_id: customer_id || 'guest', 
          booking_date: booking_date, 
          booking_time: booking_time,
          inventory_id: inventory_id,
          location_name: location_name,
          product_name: product_name,
          note: note,
          status: 'pending'
        }
      ])
      .select();

    if (error) throw error;
    
    return res.status(201).json({ success: true, message: 'สร้างการจองสำเร็จ', data });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete:id: ลบข้อมูลการจอง
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'ลบข้อมูลการจองสำเร็จ' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};