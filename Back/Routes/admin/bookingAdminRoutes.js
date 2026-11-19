// Booking Service: /api/admin/bookings, /api/admin/locations + /internal/booking
import express from 'express';
import { verifyToken } from '../../Middlewares/authMiddleware.js';
import { staffOnly, managerOnly, audit } from '../../Middlewares/adminAccess.js';
import { internalOnly } from '../../Services/internal.js';
import { getAllBookings, getBookingById, deleteBooking } from '../../Controllers/bookingsController.js';
import {
  adminCreateBooking, adminUpdateBooking, updateBookingStatus, getLocations, saveLocation, deleteLocation, internalStats, internalCount,
} from '../../Controllers/admin/bookingAdmin.js';

const router = express.Router();
router.use(['/bookings', '/locations'], verifyToken, staffOnly);

router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingById);
router.post('/bookings', audit('bookings', 'CREATE'), adminCreateBooking);
router.put('/bookings/:id/status', audit('bookings', 'STATUS'), updateBookingStatus);
router.put('/bookings/:id', audit('bookings', 'UPDATE'), adminUpdateBooking);
router.delete('/bookings/:id', managerOnly, audit('bookings', 'DELETE'), deleteBooking);

router.get('/locations', getLocations);
router.post('/locations', managerOnly, audit('locations', 'CREATE'), saveLocation);
router.put('/locations/:id', managerOnly, audit('locations', 'UPDATE'), saveLocation);
router.delete('/locations/:id', managerOnly, audit('locations', 'DELETE'), deleteLocation);

export const internal = express.Router();
internal.use(internalOnly);
internal.get('/stats', internalStats);
internal.get('/count', internalCount);

export default router;
