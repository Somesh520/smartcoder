import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['class', 'exam', 'assignment', 'study', 'other'],
        default: 'other'
    },
    course: {
        type: String,
        trim: true
    },
    location: {
        type: String
    },
    isAllDay: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Event', eventSchema);
