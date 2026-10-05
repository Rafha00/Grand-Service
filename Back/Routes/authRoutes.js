import express from 'express';
import { 
  requestOtp, 
  verifyOtpAndRegister, 
  login, 
  forgotPassword, 
  resetPassword,
  assignRole,
  getProfile,    // 1. นำเข้าฟังก์ชันดึงข้อมูลโปรไฟล์
  updateProfile  // 2. นำเข้าฟังก์ชันอัปเดตข้อมูลโปรไฟล์
} from '../Controllers/authController.js';
import { verifyToken, requireAdmin } from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Route สำหรับสมัครสมาชิกและเข้าสู่ระบบ
router.post('/register/request-otp', requestOtp);
router.post('/register/verify-otp', verifyOtpAndRegister);
router.post('/login', login);

// Route สำหรับระบบรีเซ็ตรหัสผ่าน (Forgot & Reset Password)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ฟังก์ชันสำหรับ Logout (เคลียร์ Cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.status(200).json({ message: 'Logged out successfully' });
});

// ==========================================
// Route สำหรับจัดการโปรไฟล์ผู้ใช้ (ต้องมี Token ถึงจะเข้าถึงได้)
// ==========================================
router.get('/me', verifyToken, getProfile);          // ดึงข้อมูลผู้ใช้ปัจจุบันมาแสดงที่ Dashboard
router.put('/profile', verifyToken, updateProfile);    // อัปเดตข้อมูลส่วนตัวจากหน้า Dashboard

// ==========================================
// Route: จัดการ Role (Admin เท่านั้น)
// ==========================================
router.put('/assign-role', verifyToken, requireAdmin, assignRole);

export default router;