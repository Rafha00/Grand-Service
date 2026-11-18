import express from 'express';
import { getUserNotifications, markAsRead } from '../Controllers/notificationsController.js';

const router = express.Router();

router.get('/:customerId', getUserNotifications);
router.patch('/:id/read', markAsRead);

export default router;