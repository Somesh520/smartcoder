import './src/config/loadEnv.js'; // MUST BE FIRST
import dotenv from 'dotenv';
// dotenv.config loaded via loadEnv.js

import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import compression from 'compression';
import helmet from 'helmet';
import session from 'express-session';
import { RedisStore } from 'connect-redis';

import cookieParser from 'cookie-parser';

import { corsOptions } from './src/config/cors.js';
import problemRoutes from './src/routes/problemRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import leetcodeRoutes from './src/routes/leetcodeRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import { socketHandler } from './src/sockets/socketHandler.js';
import redisClient from './src/config/redis.js';
import connectDB from './src/config/db.js';
import passport from './src/config/passport.js';
import reviewRoutes from './src/routes/reviewRoutes.js';

// ...

const app = express();
// Enable trust proxy for Render/Heroku/Nginx
app.set('trust proxy', 1);

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: corsOptions.origin,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// --- MIDDLEWARE ---
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Rate Limiter (Global)
import { limiter } from './src/middleware/rateLimiter.js';
app.use(limiter);

// Session Management (Redis)
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set true if HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 Day
    }
}));

// Passport Logic
app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---
app.use('/', problemRoutes);
app.use('/auth', authRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes); // ✅ Added Review Routes

// Socket Logic
socketHandler(io);

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', (req, res) => {
    res.send("LeetCode Local Server is Running! 🚀");
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});