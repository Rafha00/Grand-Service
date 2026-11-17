import express from 'express';
import {
  getAllBookings,
  getBookedSlots,
  getBookingById,
  createBooking,
  deleteBooking
} from '../Controllers/bookingsController.js';

const router = express.Router();

router.get('/', getAllBookings);
router.get('/booked-slots', getBookedSlots);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.delete('/:id', deleteBooking);

export default router;