import jwt from 'jsonwebtoken';

// 1. ตรวจสอบว่าได้ Login แล้วหรือยัง
export const verifyToken = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // นำข้อมูล user (id, role, email) แปะไว้ใน req
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};

// 2. ตรวจสอบว่าคนนี้มีสิทธิ์ "จัดการ Role" (Admin เท่านั้น)
export const requireAdmin = (req, res, next) => {
  // เช็คตามตารางสิทธิ์: Admin เท่านั้นที่จัดการ Role ได้
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ใช้งานส่วนนี้ (ต้องเป็น Admin เท่านั้น)' });
  }
};