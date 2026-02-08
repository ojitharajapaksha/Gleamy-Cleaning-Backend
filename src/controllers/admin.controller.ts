import { Response, NextFunction } from 'express';
import prisma from '../config/database.config.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalBookings,
      totalCustomers,
      totalEmployees,
      pendingBookings,
      completedBookings,
      totalRevenue,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.customer.count(),
      prisma.employee.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { finalPrice: true },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalBookings,
          totalCustomers,
          totalEmployees,
          pendingBookings,
          completedBookings,
          totalRevenue: totalRevenue._sum.finalPrice || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings (Admin view)
 * GET /api/admin/bookings
 */
export const getAllBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const bookings = await prisma.booking.findMany({
      where: status ? { status: status as any } : undefined,
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
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.booking.count({
      where: status ? { status: status as any } : undefined,
    });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      total,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all customers
 * GET /api/admin/customers
 */
export const getAllCustomers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        user: true,
        bookings: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      results: customers.length,
      data: { customers },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all employees
 * GET /api/admin/employees
 */
export const getAllEmployees = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: true,
        assignments: {
          select: {
            id: true,
            booking: {
              select: {
                id: true,
                status: true,
                scheduledDate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      results: employees.length,
      data: { employees },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new employee
 * POST /api/admin/employees
 */
export const createEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firebaseUid,
      email,
      displayName,
      phoneNumber,
      position,
      skills,
      experience,
      hireDate,
    } = req.body;

    // Create user account
    const user = await prisma.user.create({
      data: {
        firebaseUid,
        email,
        displayName,
        phoneNumber,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
      },
    });

    // Generate employee code
    const employeeCode = `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create employee profile
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeCode,
        position,
        skills,
        experience,
        hireDate: new Date(hireDate),
        isAvailable: true,
      },
      include: {
        user: true,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update employee
 * PUT /api/admin/employees/:id
 */
export const updateEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { position, skills, experience, isAvailable } = req.body;

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        position,
        skills,
        experience,
        isAvailable,
      },
      include: {
        user: true,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Employee updated successfully',
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete employee
 * DELETE /api/admin/employees/:id
 */
export const deleteEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }

    // Deactivate user instead of deleting
    await prisma.user.update({
      where: { id: employee.userId },
      data: {
        status: 'INACTIVE',
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Employee deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign job to employee
 * POST /api/admin/jobs/assign
 */
export const assignJobToEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId, employeeId } = req.body;

    const assignment = await prisma.jobAssignment.create({
      data: {
        bookingId,
        employeeId,
      },
      include: {
        booking: true,
        employee: {
          include: {
            user: true,
          },
        },
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Job assigned successfully',
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics data
 * GET /api/admin/analytics
 */
export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {
      createdAt: {
        gte: startDate ? new Date(startDate as string) : undefined,
        lte: endDate ? new Date(endDate as string) : undefined,
      },
    };

    const [bookingsByStatus, revenueByMonth, topServices] = await Promise.all([
      // Bookings by status
      prisma.booking.groupBy({
        by: ['status'],
        _count: true,
        where: dateFilter,
      }),

      // Revenue trends (simplified)
      prisma.booking.findMany({
        where: {
          ...dateFilter,
          status: 'COMPLETED',
        },
        select: {
          finalPrice: true,
          createdAt: true,
        },
      }),

      // Top services
      prisma.booking.groupBy({
        by: ['serviceId'],
        _count: true,
        where: dateFilter,
        orderBy: {
          _count: {
            serviceId: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        analytics: {
          bookingsByStatus,
          revenueByMonth,
          topServices,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
