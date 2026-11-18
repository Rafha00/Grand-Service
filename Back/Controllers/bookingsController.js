import jwt from 'jsonwebtoken';
import { supabase } from '../Config/supabaseClient.js';

export const getAllBookings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

    const bookedTimes = data.map(item =>
      item.booking_time ? item.booking_time.toString().slice(0, 5) : ''
    );

    return res.status(200).json({ success: true, bookedTimes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const { customerId } = req.params;

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', customerId)
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

    // ดึง id ของผู้ใช้ที่ล็อกอินอยู่จาก Cookie หรือ Header อัตโนมัติ
    let authUserId = req.user?.id || null;
    const token =
      req.cookies?.auth_token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!authUserId && token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        authUserId = decoded.id;
      } catch (err) {
        // กรณีไม่ได้ล็อกอินหรือ token หมดอายุ
      }
    }

    const finalCustomerId =
      authUserId || (customer_id && customer_id !== 'guest' ? customer_id : 'guest');

    // ตรวจสอบว่าเวลาและสาขานี้ถูกจองไปหรือยัง
    let checkQuery = supabase
      .from('bookings')
      .select('id')
      .eq('booking_date', booking_date)
      .eq('booking_time', booking_time);

    if (location_name) {
      checkQuery = checkQuery.eq('location_name', location_name);
    }

    const { data: existing, error: checkError } = await checkQuery;
    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ช่วงเวลานี้ถูกจองไปแล้ว กรุณาเลือกเวลาอื่น'
      });
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          booking_date,
          booking_time,
          inventory_id,
          location_name,
          product_name,
          customer_id: finalCustomerId,
          note
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'ลบรายการจองสำเร็จ' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};