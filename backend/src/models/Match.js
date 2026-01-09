import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    problem: {
        id: String,
        title: String,
        slug: String
    },
    players: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if guest
        username: String,
        status: String, // 'completed', 'attempting'
        score: Number,
        timeTaken: Number
    }],
    winner: String, // username of winner
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Match = mongoose.model('Match', matchSchema);

export default Match;
