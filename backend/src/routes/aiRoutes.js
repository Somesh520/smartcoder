import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getCredits, handleAssist, handleComplexity } from '../controllers/aiController.js';

const router = express.Router();

router.get('/credits', verifyToken, getCredits);
router.post('/assist', verifyToken, handleAssist);
router.post('/complexity', verifyToken, handleComplexity);

export default router;