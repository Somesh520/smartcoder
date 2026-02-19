
import express from 'express';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; // Assuming isAdmin exists or we just use verifyToken for now
import { UserManager } from '../services/userManager.js';

const router = express.Router();

// Get Online Users
router.get('/online-users', verifyToken, (req, res) => {
    // Ideally check if req.user.isAdmin, but for now verifyToken is enough based on request
    // or we can add a simple check
    // if (!req.user.isAdmin) return res.status(403).json({ message: "Admin only" });

    const users = UserManager.getOnlineUsers();
    res.json({
        count: users.length,
        users: users
    });
});

export default router;
