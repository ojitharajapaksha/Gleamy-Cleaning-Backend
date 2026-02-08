import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  uploadEnvironmentImages,
} from '../controllers/booking.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import { memoryUpload } from '../middleware/upload.middleware.js';

const router = Router();

// All booking routes require authentication
router.use(authenticateUser);

// Customer routes
router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.delete('/:id', cancelBooking);

// Upload environment images
router.post(
  '/:id/upload-images',
  memoryUpload.array('images', 10),
  uploadEnvironmentImages
);

export default router;
