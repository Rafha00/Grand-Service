import jwt from 'jsonwebtoken';
import { bookingDb as supabase } from '../Config/db.js';
import { createNotification } from './notificationsController.js';

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

    // 1. ดึง id ของผู้ใช้ที่ล็อกอินอยู่จาก Cookie หรือ Header
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
        return res.status(401).json({
          success: false,
          message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง'
        });
      }
    }

    const finalCustomerId = authUserId || customer_id;

    // 2. ตัด guest ออก: ถ้าไม่ได้ล็อกอิน ให้ปฏิเสธการจองทันที
    if (!finalCustomerId || finalCustomerId === 'guest') {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนทำการจองคิว'
      });
    }

    // 3. ตรวจสอบว่าเวลาและสาขานี้ถูกจองไปหรือยัง
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

    // 4. บันทึกข้อมูลการจอง
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

    // 5. แจ้งเตือนตอนส่งคำขอจองคิวสำเร็จ
    await createNotification({
      userId: finalCustomerId,
      title: 'ส่งคำขอจองคิวสำเร็จ',
      message: `รายการจอง ${product_name || 'เข้าชมสินค้า'} วันที่ ${booking_date} เวลา ${booking_time} น. อยู่ระหว่างรอการตรวจสอบ`,
      type: 'info'
    });

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// อัปเดตสถานะการจอง (สำหรับยืนยันคิว / จองสำเร็จ / ยกเลิกคิว)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // ส่งแจ้งเตือนตามสถานะที่เปลี่ยนไป
    if (data?.customer_id && data.customer_id !== 'guest') {
      const normalizedStatus = (status || '').toLowerCase();

      if (['confirmed', 'approved', 'completed', 'success'].includes(normalizedStatus)) {
        await createNotification({
          userId: data.customer_id,
          title: 'ยืนยันการจองคิวสำเร็จ',
          message: `รายการจอง ${data.product_name || 'เข้าชมสินค้า'} วันที่ ${data.booking_date} เวลา ${data.booking_time} น. ได้รับการยืนยันเรียบร้อยแล้ว`,
          type: 'success'
        });
      } else if (['cancelled', 'canceled', 'rejected'].includes(normalizedStatus)) {
        await createNotification({
          userId: data.customer_id,
          title: 'รายการจองถูกยกเลิก',
          message: `รายการจอง ${data.product_name || 'เข้าชมสินค้า'} วันที่ ${data.booking_date} เวลา ${data.booking_time} น. ถูกยกเลิกแล้ว`,
          type: 'error'
        });
      }
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // ดึงข้อมูลรายการจองก่อนลบ เพื่อส่งแจ้งเตือนให้เจ้าของคิว
    const { data, error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (data?.customer_id && data.customer_id !== 'guest') {
      await createNotification({
        userId: data.customer_id,
        title: 'รายการจองถูกยกเลิก',
        message: `รายการจอง ${data.product_name || 'เข้าชมสินค้า'} วันที่ ${data.booking_date} เวลา ${data.booking_time} น. ถูกยกเลิกเรียบร้อยแล้ว`,
        type: 'error'
      });
    }

    return res.status(200).json({ success: true, message: 'ลบรายการจองสำเร็จ' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};