import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import PaymentRequest from '../models/PaymentRequest.js';

const router = express.Router();

// Request Top-up
router.post('/request-topup', verifyToken, async (req, res) => {
    try {
        const { transactionId } = req.body;
        if (!transactionId) {
            return res.status(400).json({ error: "Transaction ID is required" });
        }

        const newRequest = new PaymentRequest({
            userId: req.user._id,
            transactionId
        });

        await newRequest.save();
        res.status(201).json({ message: "Request submitted successfully! Admin will verify." });
    } catch (error) {
        console.error("Topup Requests Error:", error);
        res.status(500).json({ error: "Server Error" });
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
