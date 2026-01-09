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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

export default User;
