import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

// All user routes require authentication
router.use(authenticateUser);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.delete('/account', deleteUserAccount);

export default router;
