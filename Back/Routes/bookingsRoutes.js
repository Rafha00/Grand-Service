import express from 'express';
import {
  getAllBookings,
  getBookedSlots,
  getBookingById,
  getUserBookings,
  createBooking,
  deleteBooking
} from '../Controllers/bookingsController.js';
import { verifyToken } from '../Middlewares/authMiddleware.js';
import { staffOnly, managerOnly, selfOrStaff } from '../Middlewares/adminAccess.js';

const router = express.Router();

router.get('/', verifyToken, staffOnly, getAllBookings);
router.get('/booked-slots', getBookedSlots);
router.get('/user/:customerId', verifyToken, selfOrStaff('customerId'), getUserBookings);
router.get('/:id', verifyToken, staffOnly, getBookingById);
router.post('/', createBooking);
router.delete('/:id', verifyToken, managerOnly, deleteBooking);

export default router;