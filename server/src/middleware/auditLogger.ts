import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from './auth.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export const auditLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const originalEnd = res.end;

  // The type for 'chunk' can be 'any' and for 'encoding' can be 'BufferEncoding'.
  // We must also ensure the function returns 'res' to match the original signature.
  res.end = function (chunk?: any, encoding?: any): typeof res {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logAuditEvent(req);
    }
    
    // The original 'end' function must be called with its context and arguments.
    // And its return value must be returned.
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

async function logAuditEvent(req: AuthenticatedRequest) {
  try {
    const action = determineAction(req);
    if (!action) return;

    const auditData = {
      userId: req.user?.id || null,
      reportId: extractReportId(req),
      action,
      details: {
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        body: sanitizeBody(req.body),
      },
      ipAddress: req.ip || req.socket?.remoteAddress || 'unknown',
    };

    await prisma.auditLog.create({ data: auditData });
    logger.info('Audit log created', { action, userId: req.user?.id });
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
}

function determineAction(req: AuthenticatedRequest): string | null {
  const { method, originalUrl } = req;
  
  if (originalUrl.includes('/auth/login') && method === 'POST') return 'login';
  if (originalUrl.includes('/auth/logout') && method === 'POST') return 'logout';
  if (originalUrl.includes('/reports') && method === 'POST') return 'report_create';
  if (originalUrl.includes('/reports') && originalUrl.includes('/submit') && method === 'POST') return 'report_submit';
  if (originalUrl.includes('/reports') && originalUrl.includes('/approve') && method === 'POST') return 'report_approve';
  if (originalUrl.includes('/reports') && originalUrl.includes('/reject') && method === 'POST') return 'report_reject';
  if (originalUrl.includes('/reports') && originalUrl.includes('/export') && method === 'GET') return 'report_export';
  if (originalUrl.includes('/users') && method === 'POST') return 'user_create';
  if (originalUrl.includes('/users') && method === 'PUT') return 'user_update';
  if (originalUrl.includes('/users') && method === 'DELETE') return 'user_delete';
  if (originalUrl.includes('/signatures') && method === 'POST') return 'signature_create';
  if (originalUrl.includes('/comments') && method === 'POST') return 'comment_create';
  
  return null;
}

function extractReportId(req: Request): string | null {
  const match = req.originalUrl.match(/\/reports\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

function sanitizeBody(body: any): any {
  if (!body) return null;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.signatureData;
  
  return sanitized;
}