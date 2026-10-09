const express = require('express');
const router = express.Router();
const { getUserNotifications, markAsRead } = require('../Controllers/notificationsController');

router.get('/:customerId', getUserNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;