import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import PaymentRequest from '../models/PaymentRequest.js';

const router = express.Router();

// Request Top-up
router.post('/request-topup', verifyToken, async (req, res) => {
    try {
        const { transactionId, amount, credits } = req.body;
        if (!transactionId || !amount || !credits) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newRequest = new PaymentRequest({
            userId: req.user._id,
            transactionId,
            amount,
            credits
        });

        await newRequest.save();

        res.status(201).json({ message: "Request submitted successfully" });
    } catch (error) {
        console.error("Payment Request Error:", error); // Updated error message
        res.status(500).json({ error: "Server Error" });
    }
});

// Admin Middleware (Simple Email Check)
const verifyAdmin = async (req, res, next) => {
    try {
        const allowedAdmins = [
            (process.env.ADMIN_EMAIL || '').toLowerCase().trim(),
            'someshtiwari532@gmail.com'
        ];
        const userEmail = req.user?.email?.toLowerCase().trim();

        console.log(`[Admin Check] User: '${userEmail}', Allowed: ${JSON.stringify(allowedAdmins)}`);

        if (!userEmail || !allowedAdmins.includes(userEmail)) {
            return res.status(403).json({
                error: "Access Denied: Admin only",
                debug: { receivedEmail: userEmail, expected: 'someshtiwari532@gmail.com' }
            });
        }
        next();
    } catch (e) {
        console.error("Admin Auth Error:", e);
        res.status(500).json({ error: "Auth Error" });
    }
};

// GET Pending Requests (Admin)
router.get('/admin/pending', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const requests = await PaymentRequest.find({ status: 'pending' })
            .populate('userId', 'displayName email')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (e) {
        res.status(500).json({ error: "Fetch Failed" });
    }
});

// Approve Request (Admin)
router.post('/admin/approve', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { requestId } = req.body;
        const request = await PaymentRequest.findById(requestId);

        if (!request) return res.status(404).json({ error: "Request not found" });
        if (request.status !== 'pending') return res.status(400).json({ error: "Request already processed" });

        // Update Request Status
        request.status = 'approved';
        await request.save();

        // Add Credits to User
        const user = await User.findById(request.userId);
        if (user) {
            user.credits += request.credits;
            await user.save();
        }

        res.json({ message: "Approved & Credits Added", newCredits: user ? user.credits : 0 });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Approval Failed" });
    }
});

// Reject Request (Admin)
router.post('/admin/reject', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { requestId } = req.body;
        const request = await PaymentRequest.findById(requestId);

        if (!request) return res.status(404).json({ error: "Request not found" });
        if (request.status !== 'pending') return res.status(400).json({ error: "Request already processed" });

        request.status = 'rejected';
        await request.save();

        res.json({ message: "Request Rejected" });

    } catch (e) {
        res.status(500).json({ error: "Rejection Failed" });
    }
});

// Check Status
router.get('/history', verifyToken, async (req, res) => {
    try {
        const requests = await PaymentRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error("Payment History Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

export default router;
