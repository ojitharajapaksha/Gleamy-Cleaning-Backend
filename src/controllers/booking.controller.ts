import { Response, NextFunction } from 'express';
import prisma from '../config/database.config.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      duration,
      address,
      city,
      postalCode,
      specialInstructions,
    } = req.body;

    // Get customer ID
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user?.userId },
    });

    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer profile not found',
      });
    }

    // Get service price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found',
      });
    }

    // Generate booking number
    const bookingNumber = `GLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: customer.id,
        serviceId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        duration: duration || service.duration,
        address,
        city,
        postalCode,
        specialInstructions,
        estimatedPrice: service.basePrice,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
      include: {
        service: true,
        customer: {
          include: {
            user: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings for the current user
 * GET /api/bookings
 */
export const getBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user?.userId },
    });

    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer profile not found',
      });
    }

    const bookings = await prisma.booking.findMany({
      where: { customerId: customer.id },
      include: {
        service: true,
        assignments: {
          include: {
            employee: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
export const getBookingById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        customer: {
          include: {
            user: true,
          },
        },
        assignments: {
          include: {
            employee: {
              include: {
                user: true,
              },
            },
          },
        },
        uploadedMedia: true,
        review: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking
 * PUT /api/bookings/:id
 */
export const updateBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { scheduledDate, scheduledTime, specialInstructions, status } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        scheduledTime,
        specialInstructions,
        status,
      },
      include: {
        service: true,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Booking updated successfully',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking
 * DELETE /api/bookings/:id
 */
export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload environment images for booking
 * POST /api/bookings/:id/upload-images
 */
export const uploadEnvironmentImages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No images provided',
      });
    }

    // Convert files to base64 and save to MongoDB
    const mediaRecords = await Promise.all(
      files.map((file) => {
        const base64Data = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
        
        return prisma.uploadedMedia.create({
          data: {
            bookingId: id,
            type: file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE',
            data: dataUrl,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
          },
        });
      })
    );

    // Update booking with image data URLs
    await prisma.booking.update({
      where: { id },
      data: {
        environmentImages: {
          push: mediaRecords.map((r) => r.data),
        },
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Images uploaded successfully',
      data: {
        images: mediaRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};
