import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
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
    content: {
        type: String, // Store as Markdown or rich text HTML
        default: ''
    },
    tags: [{
        type: String,
        trim: true
    }],
    course: {
        type: String,
        trim: true
    },
    isPinned: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Note', noteSchema);
