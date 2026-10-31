import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // นำเข้า crypto สำหรับสุ่ม OTP
import { supabase } from '../Config/supabaseClient.js';

// 1. ฟังก์ชันขอ OTP เพื่อสมัครสมาชิก
export const requestOtp = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: existingUser, error } = await supabase
      .from('Profiles') 
      .select('id, otp')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    if (existingUser && !existingUser.otp) {
      return res.status(400).json({ message: 'Email already exists and verified' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); 

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingUser) {
      const { error: updateError } = await supabase
        .from('Profiles')
        .update({
          password_hash: hashedPassword,
          role: 'Customer', // บังคับเซ็ตเป็น Customer
          otp: otp,
          otp_expires_at: expiresAt
        })
        .eq('email', email);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('Profiles')
        .insert([{
          email: email,
          password_hash: hashedPassword,
          role: 'Customer', // บังคับเซ็ตเป็น Customer
          otp: otp,
          otp_expires_at: expiresAt
        }]);
      if (insertError) throw insertError;
    }

    console.log(`\n📧 [Mock Email Service - Register]`);
    console.log(`To: ${email}`);
    console.log(`Subject: Your Verification Code`);
    console.log(`Body: Your OTP for registration is: ${otp}\n`);

    res.status(200).json({ message: 'OTP sent successfully. Please check your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 2. ฟังก์ชันยืนยัน OTP และสร้างบัญชี
export const verifyOtpAndRegister = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('Profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.otp || !user.otp_expires_at) {
      return res.status(400).json({ message: 'OTP not found or already verified' });
    }
  
    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }
    
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const { error: updateError } = await supabase
      .from('Profiles')
      .update({
        otp: null,
        otp_expires_at: null
      })
      .eq('email', email);

    if (updateError) throw updateError;

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 3. ฟังก์ชัน Login 
export const login = async (req, res) => {
  const { email, password, role: requestedRole } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('Profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.otp) {
      return res.status(401).json({ message: 'Please verify your OTP before login' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (requestedRole === 'Admin' && user.role !== 'Admin') {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าสู่ระบบในช่องทาง Admin' });
    }

    const payload = { id: user.id, role: user.role, email: user.email };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({ 
      message: 'Login successful',
      user: { id: user.id, email: user.email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. ฟังก์ชันขอ OTP เพื่อรีเซ็ตรหัสผ่าน (Forgot Password)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const { data: user, error } = await supabase.from('Profiles').select('id').eq('email', email).maybeSingle();
    
    if (error || !user) {
      return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase.from('Profiles')
      .update({ otp, otp_expires_at: expiresAt })
      .eq('email', email);
    
    if (updateError) throw updateError;

    console.log(`\n🔑 [Mock Email Service - Reset Password]`);
    console.log(`To: ${email}`);
    console.log(`Subject: Password Reset Request`);
    console.log(`Body: Your OTP for resetting password is: ${otp}\n`);

    res.status(200).json({ message: 'ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 5. ฟังก์ชันยืนยัน OTP และเปลี่ยนรหัสผ่านใหม่ (Reset Password)
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const { data: user, error } = await supabase.from('Profiles').select('*').eq('email', email).maybeSingle();
    
    if (error || !user) return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
    if (!user.otp || !user.otp_expires_at) return res.status(400).json({ message: 'ไม่พบคำขอรีเซ็ตรหัสผ่าน' });
    if (new Date(user.otp_expires_at) < new Date()) return res.status(400).json({ message: 'รหัส OTP หมดอายุแล้ว' });
    if (user.otp !== otp) return res.status(400).json({ message: 'รหัส OTP ไม่ถูกต้อง' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { error: updateError } = await supabase.from('Profiles')
      .update({ password_hash: hashedPassword, otp: null, otp_expires_at: null })
      .eq('email', email);

    if (updateError) throw updateError;
    
    res.status(200).json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// =======================================================
// 6. ฟังก์ชันจัดการ Role (สำหรับการมอบหมายสิทธิ์โดย Admin)
// =======================================================
export const assignRole = async (req, res) => {
  const { targetEmail, newRole } = req.body; 
  
  const allowedRoles = ['Customer', 'Staff', 'Manager', 'Admin'];

  if (!allowedRoles.includes(newRole)) {
    return res.status(400).json({ message: 'Role ไม่ถูกต้อง (ต้องเป็น Customer, Staff, Manager หรือ Admin เท่านั้น)' });
  }

  try {
    const { error } = await supabase
      .from('Profiles')
      .update({ role: newRole })
      .eq('email', targetEmail);

    if (error) throw error;
    
    res.status(200).json({ message: `เปลี่ยนสิทธิ์ของ ${targetEmail} เป็น ${newRole} เรียบร้อยแล้ว` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// =======================================================
// 7. ฟังก์ชันดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน (สำหรับหน้า Dashboard)
// =======================================================
export const getProfile = async (req, res) => {
  try {
    // req.user.id ได้มาจาก Middleware verifyToken
    const { data: user, error } = await supabase
      .from('Profiles')
      .select('id, email, role, name, phone, gender, birthDay, birthMonth, birthYear')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// =======================================================
// 8. ฟังก์ชันอัปเดตข้อมูลโปรไฟล์ผู้ใช้
// =======================================================
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, gender, birthDay, birthMonth, birthYear } = req.body;

    const { data: updatedUser, error } = await supabase
      .from('Profiles')
      .update({ 
        name, 
        phone, 
        gender, 
        birthDay, 
        birthMonth, 
        birthYear 
      })
      .eq('id', req.user.id)
      .select('id, email, role, name, phone, gender, birthDay, birthMonth, birthYear')
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'อัปเดตข้อมูลสำเร็จ', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};