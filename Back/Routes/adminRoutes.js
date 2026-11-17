import express from 'express';
import { verifyToken } from '../Middlewares/authMiddleware.js';
import { allow, audit, STAFF_ROLES } from '../Middlewares/adminAccess.js';
import upload from '../Middlewares/uploadMiddleware.js';

// ใช้ controller เดิมของทีม (ไม่ได้แก้ไฟล์เหล่านี้)
import { CreateProducts, UpdateProducts } from '../Controllers/productsController.js';
import { CreateBrands, UpdateBrands, DeleteBrands } from '../Controllers/brandsController.js';
import { CreateCategories, UpdateCategories, DeleteCategories } from '../Controllers/categoriesController.js';
import { getAllBookings, getBookingById, createBooking, deleteBooking } from '../Controllers/bookingsController.js';
import { createInventory, updateInventory } from '../Controllers/inventoryController.js';

// ฟังก์ชันที่เพิ่มมาสำหรับแอดมิน
import {
  getStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  updateUser,
  deleteProduct,
  addProductImages,
  updateBookingStatus,
  deleteInventory,
  getAuditLogs,
  getLocations,
  saveLocation,
  deleteLocation,
} from '../Controllers/adminController.js';

const router = express.Router();

// ตารางสิทธิ์
//                    Admin  Manager  Staff
// ภาพรวม               ✓       ✓       ✓
// ผู้ใช้ / Role          ✓       -       -
// สินค้า/แบรนด์/หมวด    ✓       ✓       ดูอย่างเดียว (ใช้ GET ของทีม)
// สต็อก                ✓       ✓       เพิ่ม/แก้ (ลบไม่ได้)
// การจอง               ✓       ✓       เพิ่ม/เปลี่ยนสถานะ (ลบไม่ได้)
// Audit Log            ✓       ✓       -
const admin = allow('Admin');
const manager = allow('Admin', 'Manager');

// ทุก route ต้อง Login และเป็นพนักงาน (Admin / Manager / Staff)
router.use(verifyToken, allow(...STAFF_ROLES));

router.get('/stats', getStats);
router.get('/audit-logs', manager, getAuditLogs);

// ผู้ใช้ / Role
router.get('/users', admin, getAllUsers);
router.get('/users/:id', admin, getUserById);
router.put('/users/:id/role', admin, audit('users', 'ROLE'), updateUserRole);
router.put('/users/:id', admin, audit('users', 'UPDATE'), updateUser);
router.delete('/users/:id', admin, audit('users', 'DELETE'), deleteUser);

// ราคา/ปี ต้องไม่ติดลบ
const checkPrice = (req, res, next) => {
  const bad = ['price', 'year'].find((k) => req.body[k] !== undefined && req.body[k] !== '' && !(Number(req.body[k]) >= 0));
  return bad ? res.status(400).json({ message: `${bad === 'price' ? 'ราคา' : 'ปี'}ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป` }) : next();
};

// สินค้า
router.post('/products', manager, upload.array('images', 5), checkPrice, audit('products', 'CREATE'), CreateProducts);
router.put('/products/:id', manager, checkPrice, audit('products', 'UPDATE'), UpdateProducts);
router.delete('/products/:id', manager, audit('products', 'DELETE'), deleteProduct);
router.post('/products/:id/images', manager, upload.array('images', 5), audit('products', 'IMAGES'), addProductImages);

// แบรนด์
router.post('/brands', manager, upload.single('logo_url'), audit('brands', 'CREATE'), CreateBrands);
router.put('/brands/:id', manager, upload.single('logo_url'), audit('brands', 'UPDATE'), UpdateBrands);
router.delete('/brands/:id', manager, audit('brands', 'DELETE'), DeleteBrands);

// หมวดหมู่
router.post('/categories', manager, audit('categories', 'CREATE'), CreateCategories);
router.put('/categories/:id', manager, audit('categories', 'UPDATE'), UpdateCategories);
router.delete('/categories/:id', manager, audit('categories', 'DELETE'), DeleteCategories);

// การจอง
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingById);
router.post('/bookings', audit('bookings', 'CREATE'), createBooking);
router.put('/bookings/:id/status', audit('bookings', 'STATUS'), updateBookingStatus);
router.delete('/bookings/:id', manager, audit('bookings', 'DELETE'), deleteBooking);

// สาขา: ทุก role ดูได้, Admin/Manager แก้ไข
router.get('/locations', getLocations);
router.post('/locations', manager, audit('locations', 'CREATE'), saveLocation);
router.put('/locations/:id', manager, audit('locations', 'UPDATE'), saveLocation);
router.delete('/locations/:id', manager, audit('locations', 'DELETE'), deleteLocation);

// สต็อก
router.post('/inventory', audit('inventory', 'CREATE'), createInventory);
router.put('/inventory/:id', audit('inventory', 'UPDATE'), updateInventory);
router.delete('/inventory/:id', manager, audit('inventory', 'DELETE'), deleteInventory);

export default router;
