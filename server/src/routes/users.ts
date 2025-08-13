// server/src/routes/users.ts

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET all users (ADMIN only)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return next(createError('Forbidden', 403));
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            createdReports: true,
            tmAssignedReports: true,
            pmAssignedReports: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// GET users by role
router.get('/by-role/:role', authenticateToken, async (req, res, next) => {
  try {
    const { role } = req.params;
    const validRoles = ['TECHNICAL_MANAGER', 'PROJECT_MANAGER'];
    if (!validRoles.includes(role)) {
      return next(createError('Invalid role specified', 400));
    }

    const users = await prisma.user.findMany({
      where: {
        role: role as any,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});


export default router;