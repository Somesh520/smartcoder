import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent multiple reviews from the same user (optional, but good for genuine ratings)
reviewSchema.index({ user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
