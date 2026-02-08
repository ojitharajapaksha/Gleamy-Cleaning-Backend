import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/service.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Admin-only routes
router.post('/', authenticateUser, authorizeRoles('ADMIN', 'SUPER_ADMIN'), createService);
router.put('/:id', authenticateUser, authorizeRoles('ADMIN', 'SUPER_ADMIN'), updateService);
router.delete('/:id', authenticateUser, authorizeRoles('ADMIN', 'SUPER_ADMIN'), deleteService);

export default router;
