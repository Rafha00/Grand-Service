import express from 'express';
import { getAllBookings, createBooking,getBookingById,deleteBooking } from '../Controllers/bookingsController.js';

const router = express.Router();

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.delete('/:id', deleteBooking);

export default router;