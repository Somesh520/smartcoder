
import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { UserManager } from '../services/userManager.js';
import { RoomManager } from '../services/roomManager.js';
import User from '../models/User.js';
import Match from '../models/Match.js';
import PaymentRequest from '../models/PaymentRequest.js';

const router = express.Router();

// Get Admin Global Stats
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMatches = await Match.countDocuments();
        const onlineUsersCount = UserManager.getOnlineUsers().length;
        const activeRoomsCount = Object.keys(RoomManager.getRooms()).length;

        // Calculate Revenue
        const revenueData = await PaymentRequest.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        res.json({
            totalUsers,
            totalMatches,
            onlineUsersCount,
            activeRoomsCount,
            totalRevenue
        });
    } catch (e) {
        console.error("Admin Stats Error:", e);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
});

// User Management Actions
router.post('/user-action', verifyToken, async (req, res) => {
    try {
        const { userId, action, value } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        switch (action) {
            case 'setCredits':
                user.credits = parseInt(value);
                break;
            case 'togglePremium':
                user.isPremium = !user.isPremium;
                break;
            case 'delete':
                // Optional: add safety check
                await User.findByIdAndDelete(userId);
                return res.json({ message: "User deleted successfully" });
            default:
                return res.status(400).json({ message: "Invalid action" });
        }

        await user.save();
        res.json({ message: "Action completed", user });
    } catch (e) {
        res.status(500).json({ message: "Action failed" });
    }
});

// Get Recent Matches
router.get('/recent-matches', verifyToken, async (req, res) => {
    try {
        const matches = await Match.find({})
            .populate('players.userId', 'displayName email')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(matches);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch matches" });
    }
});

// Get Online Users
router.get('/online-users', verifyToken, (req, res) => {
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
            .select('displayName email createdAt isPremium credits')
            .sort({ createdAt: -1 })
            .limit(200);

        res.json({
            count: users.length,
            users: users
        });
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

export default router;
