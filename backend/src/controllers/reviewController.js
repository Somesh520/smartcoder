import Review from '../models/Review.js';

export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'displayName photos')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
};

export const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user._id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Invalid rating" });
        }

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ error: "Comment is required" });
        }

        const existingReview = await Review.findOne({ user: userId });
        if (existingReview) {
            existingReview.rating = rating;
            existingReview.comment = comment;
            existingReview.createdAt = Date.now();
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
};
