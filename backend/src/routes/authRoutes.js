import express from 'express';
import passport from 'passport';

const router = express.Router();

// Trigger Google Auth
// Trigger Google Auth
router.get('/google', (req, res, next) => {
    const returnTo = req.query.return_to;
    const authenticator = passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: returnTo // Pass origin as state to survive the OAuth flow
    });
    authenticator(req, res, next);
});

// Trigger Google Auth for TASKS (Incremental Auth)
router.get('/google/tasks',
    passport.authenticate('google', {
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/tasks', 'https://www.googleapis.com/auth/calendar'],
        accessType: 'offline',
        prompt: 'consent',
        state: 'tasks'  // <--- Pass state to identify this flow
    })
);

import jwt from 'jsonwebtoken';

// Google Auth Callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        console.log("[Auth] /google/callback hit. User:", req.user?.email);
        // Successful authentication, issue JWT
        const token = jwt.sign(
            { id: req.user._id, googleId: req.user.googleId, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirect to frontend with token in query param
        // In production, consider strictly using httpOnly cookies, but query param is okay for initial handshake if short lived or handled carefully.
        // Better: Set httpOnly cookie here.

        // Let's set it as a cookie for security AND redirect.
        res.cookie('token', token, {
            httpOnly: false, // Accessible by JS for now (as requested/legacy), but ideally true. Keeping false so user can debug if needed or if frontend logic reads it.
            // Actually, for "cookie set kro", usually implies HttpOnly for security, but to keep existing localStorage logic working as backup, we might leave it. 
            // BUT: If we want true cookie auth, we should prioritize cookie.
            // Let's set httpOnly: false for now so client can read it if it wants to sync localStorage, 
            // but the important part is SameSite: None.
            secure: true,   // Required for SameSite=None
            sameSite: 'None', // Required for Cross-Site (Localhost -> Render)
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Check state to see where to redirect
        const state = req.query.state;

        // If state is 'tasks', it's the incremental auth flow
        if (state === 'tasks') {
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/app/tasks?token=${token}`);
        }
        // If state looks like a URL (starts with http), it's our return_to origin
        else if (state && state.startsWith('http')) {
            res.redirect(`${state}?token=${token}`);
        }
        // Default fallback to CLIENT_URL
        else {
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?token=${token}`);
        }
    }
);

import { verifyToken } from '../middleware/authMiddleware.js';

// Get Current User (Protected)
router.get('/current_user', verifyToken, (req, res) => {
    res.json(req.user || null);
});

// Logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
    });
});

import Match from '../models/Match.js';

// Get User History
router.get('/history', verifyToken, async (req, res) => {
    try {
        const matches = await Match.find({ "players.userId": req.user._id })
            .sort({ createdAt: -1 })
            .limit(20); // Limit to last 20 games
        res.json(matches);
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ message: "Failed to fetch history" });
    }
});

export default router;
