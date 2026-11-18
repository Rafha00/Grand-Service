import express from 'express';
import { getUserNotifications, markAsRead } from '../Controllers/notificationsController.js';
import { verifyToken } from '../Middlewares/authMiddleware.js';
import { selfOrStaff, ownsNotification } from '../Middlewares/adminAccess.js';

const router = express.Router();

router.get('/:customerId', verifyToken, selfOrStaff('customerId'), getUserNotifications);
router.patch('/:id/read', verifyToken, ownsNotification, markAsRead);

export default router;