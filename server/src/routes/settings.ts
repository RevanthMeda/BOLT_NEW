import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { settings: {} }
  });
});

export default router;