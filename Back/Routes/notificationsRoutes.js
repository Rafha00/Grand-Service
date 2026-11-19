import express from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from '../Controllers/notificationsController.js';

const router = express.Router();

router.get('/:customerId', getUserNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/user/:customerId/read-all', markAllAsRead);

export default router;