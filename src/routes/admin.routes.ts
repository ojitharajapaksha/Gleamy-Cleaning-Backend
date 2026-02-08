import { Router } from 'express';
import {
  getDashboardStats,
  getAllBookings,
  getAllCustomers,
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  assignJobToEmployee,
  getAnalytics,
} from '../controllers/admin.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateUser);
router.use(authorizeRoles('ADMIN', 'SUPER_ADMIN'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// Bookings management
router.get('/bookings', getAllBookings);

// Customer management
router.get('/customers', getAllCustomers);

// Employee management
router.get('/employees', getAllEmployees);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

// Job assignments
router.post('/jobs/assign', assignJobToEmployee);

export default router;
