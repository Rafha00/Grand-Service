import { supabase } from '../Config/supabaseClient.js';

// 1. ดึงข้อมูลการจองทั้งหมด
export const getAllBookings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. ดึงเฉพาะเวลาที่ถูกจองไปแล้ว (ใช้ปิดปุ่มเวลาในหน้า Frontend)
export const getBookedSlots = async (req, res) => {
  try {
    const { date, location_name } = req.query;
    let query = supabase
      .from('bookings')
      .select('booking_time')
      .eq('booking_date', date);

    if (location_name) {
      query = query.eq('location_name', location_name);
    }

    const { data, error } = await query;
    if (error) throw error;

    const bookedTimes = data.map(item => item.booking_time);
    return res.status(200).json({ success: true, bookedTimes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get:id
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบข้อมูลการจอง' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Post: สร้างการจองใหม่ (เช็คเวลาซ้ำอย่างเดียว ไม่ใส่ status)
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

    // ตรวจสอบว่าวัน เวลา และสาขานี้ ถูกจองไปแล้วหรือยัง
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_date', booking_date)
      .eq('booking_time', booking_time)
      .eq('location_name', location_name);

    if (checkError) throw checkError;

    if (existingBookings && existingBookings.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'ขออภัย วันและเวลาดังกล่าวของสาขานี้ถูกจองเต็มแล้ว กรุณาเลือกเวลาอื่น' 
      });
    }

    // บันทึกข้อมูลลงฐานข้อมูลโดยไม่ส่งคอลัมน์ status
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        { 
          customer_id: customer_id || 'guest', 
          booking_date, 
          booking_time,
          inventory_id,
          location_name,
          product_name,
          note
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

// 5. Delete:id
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