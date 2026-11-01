const express = require('express');
const router = express.Router();
const bookingsController = require('../Controllers/bookingsController');

router.post('/', bookingsController.createBooking);

module.exports = router;