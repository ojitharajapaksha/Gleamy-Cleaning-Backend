import { Response, NextFunction } from 'express';
import prisma from '../config/database.config.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

/**
 * Get user profile
 * GET /api/users/profile
 */
export const getUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      include: {
        customer: true,
        employee: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { displayName, phoneNumber, photoURL, address, city, postalCode } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user?.userId },
      data: {
        displayName,
        phoneNumber,
        photoURL,
      },
    });

    // Update customer profile if exists
    if (user.role === 'CUSTOMER') {
      await prisma.customer.update({
        where: { userId: user.id },
        data: {
          address,
          city,
          postalCode,
        },
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account
 * DELETE /api/users/account
 */
export const deleteUserAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await prisma.user.update({
      where: { id: req.user?.userId },
      data: {
        status: 'INACTIVE',
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
