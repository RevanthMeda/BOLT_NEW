// server/src/routes/reports.ts

import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET all reports based on user role
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    let whereClause: Prisma.ReportWhereInput = {};

    if (user.role === 'ENGINEER') {
      whereClause = { creatorId: user.id };
    } else if (user.role === 'TECHNICAL_MANAGER') {
      whereClause = { tmId: user.id };
    } else if (user.role === 'PROJECT_MANAGER') {
      whereClause = { pmId: user.id };
    }
    // Admin sees all reports, so no filter is applied

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        creator: { select: { id: true, fullName: true, email: true } },
        technicalManager: { select: { id: true, fullName: true, email: true } },
        projectManager: { select: { id: true, fullName: true, email: true } },
        signatures: true,
        _count: {
          select: { comments: true, files: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ 
      success: true,
      data: { reports }
    });
  } catch (error) {
    next(error);
  }
});

// GET a single report by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const report = await prisma.report.findUnique({
            where: { id: req.params.id },
            include: {
                creator: { select: { id: true, fullName: true, email: true } },
                technicalManager: { select: { id: true, fullName: true, email: true } },
                projectManager: { select: { id: true, fullName: true, email: true } },
                steps: true,
                signatures: true,
                comments: true,
                files: true,
            }
        });

        if (!report) {
            return next(createError('Report not found', 404));
        }
        res.json(report);
    } catch (error) {
        next(error);
    }
});


// POST to create a new report
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user?.role !== 'ENGINEER') {
      return next(createError('Only engineers can create reports', 403));
    }
    
    const { title, projectRef, documentRef, revision, tmId, pmId } = req.body;

    const newReport = await prisma.report.create({
      data: {
        title,
        projectRef,
        documentRef,
        revision,
        creatorId: req.user.id,
        tmId,
        pmId,
      },
    });

    res.status(201).json(newReport);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return next(createError('A report with this Document Reference and Revision already exists.', 400));
    }
    next(error);
  }
});

export default router;