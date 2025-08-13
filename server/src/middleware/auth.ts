import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Mock user lookup (replace with real database)
const users: any[] = [
  {
    id: '1',
    email: 'admin@test.com',
    fullName: 'System Administrator',
    role: 'ADMIN',
  },
  {
    id: '2',
    email: 'engineer@test.com',
    fullName: 'John Engineer', 
    role: 'ENGINEER',
  },
  {
    id: '3',
    email: 'tm@test.com',
    fullName: 'Technical Manager',
    role: 'TECHNICAL_MANAGER',
  },
  {
    id: '4',
    email: 'pm@test.com',
    fullName: 'Project Manager',
    role: 'PROJECT_MANAGER',
  }
];

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(createError('Access token required', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return next(createError('User not found', 401));
    }

    req.user = {
      id: user.id,
      email: user.email, 
      role: user.role
    };
    
    next();
  } catch (error) {
    next(createError('Invalid token', 401));
  }
};