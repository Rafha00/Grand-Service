import axiosClient from './axiosClient'; 

// ==========================================
// ฟังก์ชันสำหรับ Auth
// ==========================================

export const loginAPI = async (data) => {
  const response = await axiosClient.post('/login', data);
  return response.data;
};

export const requestOtpAPI = async (data) => {
  const response = await axiosClient.post('/register/request-otp', data);
  return response.data;
};

export const verifyOtpAPI = async (data) => {
  const response = await axiosClient.post('/register/verify-otp', data);
  return response.data;
};

export const forgotPasswordAPI = async (data) => {
  const response = await axiosClient.post('/forgot-password', data);
  return response.data;
};

export const resetPasswordAPI = async (data) => {
  const response = await axiosClient.post('/reset-password', data);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await axiosClient.post('/logout');
  return response.data;
};

// ==========================================
// ฟังก์ชันสำหรับหน้า Dashboard / Profile
// ==========================================

export const getProfileAPI = async () => {
  const response = await axiosClient.get('/me');
  return response.data;
};

export const updateProfileAPI = async (data) => {
  const response = await axiosClient.put('/profile', data);
  return response.data;
};

// ==========================================
// ฟังก์ชันสำหรับ Admin / Staff (จัดการข้อมูล)
// ==========================================

// GET: ดึงข้อมูลทั้งหมด (เช่น รายชื่อผู้ใช้ทั้งหมด)
export const getAllDataAPI = async () => {
  // เปลี่ยน '/admin/users' เป็น Endpoint จริงที่ใช้ใน Backend ของคุณ
  const response = await axiosClient.get('/admin/users');
  return response.data;
};

// GET: ดึงข้อมูลรายบุคคลตาม ID
export const getDataByIdAPI = async (id) => {
  const response = await axiosClient.get(`/admin/users/${id}`);
  return response.data;
};

// POST: เพิ่มข้อมูลใหม่
export const createDataAPI = async (data) => {
  const response = await axiosClient.post('/admin/users', data);
  return response.data;
};

// PUT: แก้ไขหรืออัปเดตข้อมูลตาม ID
export const updateDataAPI = async (id, data) => {
  const response = await axiosClient.put(`/admin/users/${id}`, data);
  return response.data;
};

// DELETE: ลบข้อมูลตาม ID
export const deleteDataAPI = async (id) => {
  const response = await axiosClient.delete(`/admin/users/${id}`);
  return response.data;
};