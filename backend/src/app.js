import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import session from 'express-session';
import cookieParser from 'cookie-parser';


import { corsOptions } from './config/cors.js';
import passport from './config/passport.js';
import { limiter } from './middleware/rateLimiter.js';
import morgan from 'morgan';

// Route imports
import problemRoutes from './routes/problemRoutes.js';
import authRoutes from './routes/authRoutes.js';
import leetcodeRoutes from './routes/leetcodeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import testerRoutes from './routes/testerRoutes.js';
import githubRoutes from './routes/GithubRoutes.js';

const app = express();

// Enable trust proxy for Render/Heroku/Nginx
app.set('trust proxy', 1);

// --- MIDDLEWARE ---
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// this is morgan for 
app.use(morgan("combined"));

// Rate Limiter (Global)
app.use(limiter);

// Session Management
app.use(session({
    secret: process.env.SESSION_SECRET || 'super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set true if HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 Day
    }
}));

// Passport Logic
app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/', (req, res) => {
    res.send("LeetCode Local Server is Running! 🚀");
});
app.get('/health', (req, res) => res.status(200).send('OK'));
/// this for review route

app.use('/api/reviews', reviewRoutes);
// this is for leetcode routes
app.use('/api/leetcode', leetcodeRoutes);
// this is for ai routes 
app.use('/api/ai', aiRoutes);
// this is for payment routes
app.use('/api/payment', paymentRoutes);
// this is admin routes 
app.use('/api/admin', adminRoutes);
// this sis tester routes we will delete in future 
app.use('/api/tester', testerRoutes);
// this is github routes 
app.use('/api/github', githubRoutes);
// this is authentivcation routes for security purposes

app.use('/auth', authRoutes);

app.use('/', problemRoutes);
// this is for problem routes



export default app;
