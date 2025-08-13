import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/upload', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { message: 'File upload endpoint' }
  });
});

export default router;