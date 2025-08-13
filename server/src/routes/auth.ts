import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Mock user database (replace with real database)
const users: any[] = [
  {
    id: '1',
    email: 'admin@test.com',
    fullName: 'System Administrator',
    role: 'ADMIN',
    status: 'ACTIVE',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwwK7x0xr/YdS/G' // Test123!
  },
  {
    id: '2', 
    email: 'engineer@test.com',
    fullName: 'John Engineer',
    role: 'ENGINEER',
    status: 'ACTIVE',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwwK7x0xr/YdS/G' // Test123!
  },
  {
    id: '3',
    email: 'tm@test.com', 
    fullName: 'Technical Manager',
    role: 'TECHNICAL_MANAGER',
    status: 'ACTIVE',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwwK7x0xr/YdS/G' // Test123!
  },
  {
    id: '4',
    email: 'pm@test.com',
    fullName: 'Project Manager', 
    role: 'PROJECT_MANAGER',
    status: 'ACTIVE',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwwK7x0xr/YdS/G' // Test123!
  }
];

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

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'User already exists' }
      });
    }

    const tempPassword = 'temp123';
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = {
      id: (users.length + 1).toString(),
      email,
      fullName,
      role,
      status: 'PENDING',
      password: hashedPassword
    };

    users.push(user);
    logger.info('User registered', { userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      data: { user: { ...user, password: undefined }, tempPassword }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation error', details: error.errors }
      });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: { message: 'Account is not active' }
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    user.lastLogin = new Date().toISOString();
    logger.info('User logged in', { userId: user.id, email: user.email });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation error', details: error.errors }
      });
    }
    next(error);
  }
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});

router.post('/refresh', authenticateToken, (req, res) => {
  const token = jwt.sign(
    { userId: req.user!.id },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    data: { token, user: req.user }
  });
});

router.post('/logout', authenticateToken, (req, res) => {
  logger.info('User logged out', { userId: req.user?.id });
  res.json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
});

export default router;