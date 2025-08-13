import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Mock reports data
const reports: any[] = [
  {
    id: '1',
    title: 'Sample Report 1',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    userId: '1',
    user: { fullName: 'System Administrator', email: 'admin@test.com' }
  },
  {
    id: '2', 
    title: 'Sample Report 2',
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    userId: '2',
    user: { fullName: 'John Engineer', email: 'engineer@test.com' }
  }
];

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const fetchedReports = await prisma.report.findMany({
      include: {
        creator: { select: { fullName: true, email: true } }
      }
    });
    res.json({ 
      success: true,
      data: { reports: fetchedReports }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const newReport = {
      id: (reports.length + 1).toString(),
      ...req.body,
      creatorId: req.user!.id,
      createdAt: new Date().toISOString(),
      status: 'DRAFT'
    };
    
    reports.push(newReport);

    res.status(201).json({
      success: true,
      data: { report: newReport }
    });
  } catch (error) {
    next(error);
  }
});

export default router;