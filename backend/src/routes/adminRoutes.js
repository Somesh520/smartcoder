
import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js'; // Assuming isAdmin exists or we just use verifyToken for now
import { UserManager } from '../services/userManager.js';
import User from '../models/User.js';

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

// Get All Registered Users
router.get('/all-users', verifyToken, async (req, res) => {
    try {

        const users = await User.find({})
            .select('displayName email createdAt isPremium credits photos')
            .sort({ createdAt: -1 })
            .limit(100); // Limit to 100 for now to prevent overload

        res.json({
            count: users.length,
            users: users
        });
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

export default router;
