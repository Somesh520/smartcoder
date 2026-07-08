import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
    getStats,
    handleUserAction,
    getRecentMatches,
    getOnlineUsers,
    getAllUsers,
    getAllTesters
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', verifyToken, getStats);
router.post('/user-action', verifyToken, handleUserAction);
router.get('/recent-matches', verifyToken, getRecentMatches);
router.get('/online-users', verifyToken, getOnlineUsers);
router.get('/all-users', verifyToken, getAllUsers);
router.get('/testers', verifyToken, getAllTesters);

export default router;
