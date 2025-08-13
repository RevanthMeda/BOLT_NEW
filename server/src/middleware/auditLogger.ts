import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from './auth.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

const AUDIT_ACTIONS = [
  'login',
  'logout',
  'report_create',
  'report_submit',
  'report_approve',
  'report_reject',
  'report_export',
  'user_create',
  'user_update',
  'user_delete',
  'signature_create',
  'comment_create',
];

export const auditLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Capture original end method
  const originalEnd = res.end;
  
  res.end = function(chunk?: any, encoding?: any) {
    // Only log successful operations (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logAuditEvent(req, res);
    }
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

async function logAuditEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const action = determineAction(req);
    if (!action) return;

    const auditData = {
      userId: req.user?.id || null,
      reportId: extractReportId(req),
      action,
      details: {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        body: sanitizeBody(req.body),
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
    };

    await prisma.auditLog.create({ data: auditData });
    logger.info('Audit log created', { action, userId: req.user?.id });
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
}

function determineAction(req: AuthenticatedRequest): string | null {
  const { method, url } = req;
  
  if (url.includes('/auth/login') && method === 'POST') return 'login';
  if (url.includes('/auth/logout') && method === 'POST') return 'logout';
  if (url.includes('/reports') && method === 'POST') return 'report_create';
  if (url.includes('/reports') && url.includes('/submit') && method === 'POST') return 'report_submit';
  if (url.includes('/reports') && url.includes('/approve') && method === 'POST') return 'report_approve';
  if (url.includes('/reports') && url.includes('/reject') && method === 'POST') return 'report_reject';
  if (url.includes('/reports') && url.includes('/export') && method === 'GET') return 'report_export';
  if (url.includes('/users') && method === 'POST') return 'user_create';
  if (url.includes('/users') && method === 'PUT') return 'user_update';
  if (url.includes('/users') && method === 'DELETE') return 'user_delete';
  if (url.includes('/signatures') && method === 'POST') return 'signature_create';
  if (url.includes('/comments') && method === 'POST') return 'comment_create';
  
  return null;
}

function extractReportId(req: Request): string | null {
  const match = req.url.match(/\/reports\/([a-zA-Z0-9]+)/);
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