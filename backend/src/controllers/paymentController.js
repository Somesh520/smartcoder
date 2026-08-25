import PaymentRequest from '../models/PaymentRequest.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export const requestTopup = async (req, res) => {
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
        console.error("Payment Request Error:", error); 
        res.status(500).json({ error: "Server Error" });
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const requests = await PaymentRequest.find({ status: 'pending' })
            .populate('userId', 'displayName email')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (e) {
        res.status(500).json({ error: "Fetch Failed" });
    }
};

export const approveRequest = async (req, res) => {
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
        console.error("Approval Error:", e);
        res.status(500).json({ error: "Approval Failed", details: e.message });
    }
};

export const rejectRequest = async (req, res) => {
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
};

export const getHistory = async (req, res) => {
    try {
        const requests = await PaymentRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error("Payment History Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) {
            return res.status(400).json({ error: "Amount is required" });
        }

        const options = {
            amount: Math.round(amount * 100)+60, // convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.status(201).json(order);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ error: "Razorpay Order Creation Failed" });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, credits, amount } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !credits) {
            return res.status(400).json({ error: "Missing verification details" });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest('hex');

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (isSignatureValid) {
            const newRequest = new PaymentRequest({
                userId: req.user._id,
                transactionId: razorpay_payment_id,
                amount: amount || (credits === 30 ? 30 : 50),
                credits: credits,
                status: 'approved'
            });
            await newRequest.save();

            const user = await User.findById(req.user._id);
            if (user) {
                user.credits += credits;
                await user.save();
            }

            res.json({ success: true, message: "Payment Verified & Credits Added", newCredits: user ? user.credits : 0 });
        } else {
            res.status(400).json({ success: false, error: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Razorpay Verification Error:", error);
        res.status(500).json({ error: "Razorpay Verification Failed" });
    }
};
