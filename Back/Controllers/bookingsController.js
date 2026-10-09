const supabase = require('../Config/supabaseClient'); // อ้างอิงตามไฟล์ Config ของคุณ

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, customerId } = req.body; // status: 'approved' หรือ 'rejected'

    // 1. อัปเดตสถานะในตาราง bookings
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (updateError) throw updateError;

    // 2. สร้างข้อความแจ้งเตือนอัตโนมัติส่งให้ User
    const title = status === 'approved' ? 'การจองได้รับการอนุมัติแล้ว 🎉' : 'การจองถูกปฏิเสธ ❌';
    const message = status === 'approved' 
      ? 'เจ้าหน้าที่ได้ยืนยันคิวการจองของคุณเรียบร้อยแล้ว' 
      : 'ขออภัย คิวของคุณไม่ผ่านการอนุมัติ กรุณาเลือกวันเวลาใหม่อีกครั้ง';

    await supabase.from('notifications').insert([{
      customer_id: customerId,
      booking_id: bookingId,
      title,
      message,
      type: status,
      is_read: false
    }]);

    return res.status(200).json({ success: true, message: 'อัปเดตสถานะและแจ้งเตือนผู้ใช้แล้ว' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};