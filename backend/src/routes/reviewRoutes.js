import express from 'express';
import { verifyToken, optionalAuth } from '../middleware/authMiddleware.js';
import Review from '../models/Review.js';
import User from '../models/User.js';

const router = express.Router();

// Get all reviews (Public)
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'displayName photos') // Fetch user details
            .sort({ createdAt: -1 })
            .limit(20); // Limit to latest 20 for performance
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// Add a review (Authenticated)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user._id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Invalid rating" });
        }

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ error: "Comment is required" });
        }

        // Check if user already reviewed
        const existingReview = await Review.findOne({ user: userId });
        if (existingReview) {
            // Update existing review
            existingReview.rating = rating;
            existingReview.comment = comment;
            existingReview.createdAt = Date.now(); // update time
            await existingReview.save();
            return res.json({ message: "Review updated successfully!", review: existingReview });
        }

        const newReview = new Review({
            user: userId,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json({ message: "Review added successfully!", review: newReview });

    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ error: "Failed to add review" });
    }
});

export default router;
