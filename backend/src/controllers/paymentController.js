import PaymentRequest from '../models/PaymentRequest.js';
import User from '../models/User.js';

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
