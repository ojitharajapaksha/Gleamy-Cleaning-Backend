import { Response, NextFunction } from 'express';
import prisma from '../config/database.config.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

/**
 * Get employee's assigned jobs
 * GET /api/employees/jobs
 */
export const getMyJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { userId: req.user?.userId },
    });

    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee profile not found',
      });
    }

    const assignments = await prisma.jobAssignment.findMany({
      where: { employeeId: employee.id },
      include: {
        booking: {
          include: {
            service: true,
            customer: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      results: assignments.length,
      data: { assignments },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get job details
 * GET /api/employees/jobs/:id
 */
export const getJobDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.jobAssignment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            service: true,
            customer: {
              include: {
                user: true,
              },
            },
            uploadedMedia: true,
          },
        },
        employee: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Job assignment not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update job status
 * PUT /api/employees/jobs/:id/status
 */
export const updateJobStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const assignment = await prisma.jobAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Job assignment not found',
      });
    }

    // Update assignment
    const updatedAssignment = await prisma.jobAssignment.update({
      where: { id },
      data: {
        ...(status === 'started' && { startedAt: new Date() }),
        ...(status === 'completed' && { completedAt: new Date() }),
        notes,
      },
    });

    // Update booking status
    if (status === 'started') {
      await prisma.booking.update({
        where: { id: assignment.bookingId },
        data: { status: 'IN_PROGRESS' },
      });
    } else if (status === 'completed') {
      await prisma.booking.update({
        where: { id: assignment.bookingId },
        data: { status: 'COMPLETED' },
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Job status updated successfully',
      data: { assignment: updatedAssignment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload job completion images
 * POST /api/employees/jobs/:id/upload-images
 */
export const uploadJobImages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'before' or 'after'
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No images provided',
      });
    }

    // Convert files to base64 data URLs
    const imageDataUrls = files.map((file) => {
      const base64Data = file.buffer.toString('base64');
      return `data:${file.mimetype};base64,${base64Data}`;
    });

    // Update assignment with image data URLs
    const assignment = await prisma.jobAssignment.update({
      where: { id },
      data: {
        ...(type === 'before' && { beforeImages: imageDataUrls }),
        ...(type === 'after' && { afterImages: imageDataUrls }),
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Images uploaded successfully',
      data: {
        assignment,
        uploadedImages: imageDataUrls,
      },
    });
  } catch (error) {
    next(error);
  }
};
