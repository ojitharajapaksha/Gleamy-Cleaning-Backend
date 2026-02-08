import { Router } from 'express';
import {
  getMyJobs,
  getJobDetails,
  updateJobStatus,
  uploadJobImages,
} from '../controllers/employee.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import { memoryUpload } from '../middleware/upload.middleware.js';

const router = Router();

// All employee routes require authentication and employee role
router.use(authenticateUser);
router.use(authorizeRoles('EMPLOYEE'));

// Job management
router.get('/jobs', getMyJobs);
router.get('/jobs/:id', getJobDetails);
router.put('/jobs/:id/status', updateJobStatus);
router.post(
  '/jobs/:id/upload-images',
  memoryUpload.array('images', 10),
  uploadJobImages
);

export default router;
