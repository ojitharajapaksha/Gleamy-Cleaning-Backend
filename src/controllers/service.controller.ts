import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.config.js';

/**
 * Get all services
 * GET /api/services
 */
export const getAllServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, isActive } = req.query;

    const services = await prisma.service.findMany({
      where: {
        ...(category && { category: category as any }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      status: 'success',
      results: services.length,
      data: { services },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get service by ID
 * GET /api/services/:id
 */
export const getServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new service (Admin only)
 * POST /api/services
 */
export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      category,
      description,
      basePrice,
      priceUnit,
      duration,
      features,
      imageUrl,
    } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        category,
        description,
        basePrice,
        priceUnit,
        duration,
        features,
        imageUrl,
        isActive: true,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Service created successfully',
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update service (Admin only)
 * PUT /api/services/:id
 */
export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      status: 'success',
      message: 'Service updated successfully',
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete service (Admin only)
 * DELETE /api/services/:id
 */
export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.service.delete({
      where: { id },
    });

    res.status(200).json({
      status: 'success',
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
