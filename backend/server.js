import './src/config/loadEnv.js'; // MUST BE FIRST
import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { corsOptions } from './src/config/cors.js';
import { socketHandler } from './src/sockets/socketHandler.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: corsOptions.origin,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Connect to Database
connectDB();

// Socket Logic
socketHandler(io);

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});