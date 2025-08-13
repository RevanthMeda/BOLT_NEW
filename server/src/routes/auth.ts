// server/src/routes/auth.ts

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['ENGINEER', 'TECHNICAL_MANAGER', 'PROJECT_MANAGER'])
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, fullName, role } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(createError('User with this email already exists', 400));
    }

    // A temporary password is set, which an admin would later change upon approval
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        role,
        password: hashedPassword,
        status: 'PENDING',
      },
    });

    logger.info('User registered and pending approval', { userId: user.id, email: user.email });

    // In a real app, you would email the admin here to notify them of a new registration.
    
    res.status(201).json({
      success: true,
      data: { message: 'Registration successful! Your account is now pending admin approval.' }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next(createError('Invalid input data', 400));
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(createError('Invalid credentials', 401));
    }

    if (user.status !== 'ACTIVE') {
      return next(createError('Your account is not active. Please contact an administrator.', 401));
    }
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set.');
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    logger.info('User logged in', { userId: user.id });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        }
      }
    });
  } catch (error: any) {
     if (error instanceof z.ZodError) {
      return next(createError('Invalid input data', 400));
    }
    next(error);
  }
});

router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});


router.post('/logout', (req, res) => {
  // On the client-side, the token should be deleted.
  // This endpoint is useful for audit logging.
  res.json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
});

export default router;