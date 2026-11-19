import express from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from '../Controllers/notificationsController.js';
import { verifyToken } from '../Middlewares/authMiddleware.js'; // เช็กชื่อไฟล์ Middleware ของเพื่อน

const router = express.Router();

// บังคับต้องผ่านการตรวจสอบ Token ทุก Route
router.get('/:customerId', verifyToken, getUserNotifications);
router.patch('/:id/read', verifyToken, markAsRead);
router.patch('/read-all/:customerId', verifyToken, markAllAsRead);

export default router;