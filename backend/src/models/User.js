import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    photos: {
        type: String
    },
    googleAccessToken: {
        type: String
    },
    googleRefreshToken: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    credits: {
        type: Number,
        default: 5
    },
    lastReset: {
        type: Date,
        default: Date.now
    },
    isPremium: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('User', userSchema);

export default User;
