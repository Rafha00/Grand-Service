const supabase = require('../Config/supabaseClient'); // อ้างอิงตามไฟล์ Config ของคุณ

exports.createBooking = async (req, res) => {
    try {
        // รับข้อมูลที่ส่งมาจาก Frontend
        const { booking_date, booking_time, note, customer_id, inventory_id } = req.body;

        // เช็คว่าส่งข้อมูลสำคัญมาครบไหม
        if (!booking_date || !booking_time || !inventory_id) {
            return res.status(400).json({ message: 'กรุณาระบุข้อมูลการจองให้ครบถ้วน' });
        }

        // สร้างรหัสการจองอัตโนมัติ
        const booking_number = `BK-${Date.now()}`;

        // บันทึกลงตาราง Bookings
        const { data, error } = await supabase
            .from('Bookings') 
            .insert([{
                booking_number: booking_number,
                customer_id: customer_id, // ถ้ายังไม่มีระบบ Login ให้ส่ง UUID จำลองมาลองก่อนได้
                inventory_id: inventory_id,
                booking_date: booking_date,
                booking_time: booking_time,
                status: 'pending',
                note: note || ''
            }]);

        if (error) throw error;

        res.status(201).json({ message: 'บันทึกการจองสำเร็จ', data });
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์', error: error.message });
    }
};