import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { 
    requestTopup, 
    getPendingRequests, 
    approveRequest, 
    rejectRequest, 
    getHistory,
    createRazorpayOrder,
    verifyRazorpayPayment 
} from '../controllers/paymentController.js';

const router = express.Router();

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

router.post('/request-topup', verifyToken, requestTopup);
router.post('/razorpay-order', verifyToken, createRazorpayOrder);
router.post('/razorpay-verify', verifyToken, verifyRazorpayPayment);
router.get('/admin/pending', verifyToken, verifyAdmin, getPendingRequests);
router.post('/admin/approve', verifyToken, verifyAdmin, approveRequest);
router.post('/admin/reject', verifyToken, verifyAdmin, rejectRequest);
router.get('/history', verifyToken, getHistory);

export default router;
