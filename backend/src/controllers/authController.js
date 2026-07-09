import passport from 'passport';
import jwt from 'jsonwebtoken';
import Match from '../models/Match.js';
import axios from 'axios';
import User from '../models/User.js';

// Trigger Google Auth
export const googleAuth = (req, res, next) => {
    const returnTo = req.query.return_to;
    console.log("[Auth] /google hit. return_to:", returnTo);
    const authenticator = passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: returnTo
    });
    authenticator(req, res, next);
};

// Trigger Google Auth for TASKS (Incremental Auth)
export const googleAuthTasks = passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/tasks', 'https://www.googleapis.com/auth/calendar'],
    accessType: 'offline',
    prompt: 'consent',
    state: 'tasks'
});

// Google Auth Callback Logic
export const googleAuthCallback = [
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        console.log("[Auth] /google/callback hit. User:", req.user?.email);
        const token = jwt.sign(
            { id: req.user._id, googleId: req.user.googleId, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: false,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const state = req.query.state;
        console.log("[Auth] Callback State:", state);

        if (state === 'tasks') {
            const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/app/tasks?token=${token}`;
            console.log("[Auth] Redirecting to Tasks:", redirectUrl);
            res.redirect(redirectUrl);
        }
        else if (state && state.startsWith('http')) {
            const redirectUrl = `${state}?token=${token}`;
            console.log("[Auth] Redirecting to Dynamic Origin:", redirectUrl);
            res.redirect(redirectUrl);
        }
        else {
            const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}?token=${token}`;
            console.log("[Auth] Redirecting to Default CLIENT_URL:", redirectUrl);
            res.redirect(redirectUrl);
        }
    }
];

export const getCurrentUser = (req, res) => {
    res.json(req.user || null);
};

export const logout = (req, res, next) => {
    res.clearCookie('token', {
        httpOnly: false,
        secure: true,
        sameSite: 'None'
    });
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
    });
};

export const getHistory = async (req, res) => {
    try {
        const matches = await Match.find({ "players.userId": req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(matches);
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ message: "Failed to fetch history" });
    }
};

export const github = (req, res) => {
    try {
        const { token } = req.query;
        let state = '';
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                state = decoded.id; // Store userId in state
            } catch (e) {
                console.error("Invalid token passed to github auth redirect:", e.message);
            }
        }
        const url =
            `https://github.com/login/oauth/authorize` +
            `?client_id=${process.env.GITHUB_CLIENT_ID}` +
            `&state=${state}` +
            `&scope=read:user user:email repo`;
        res.redirect(url);
    } catch (error) {
        console.error("Github Auth Error:", error);
        res.status(500).json({ message: "Failed to fetch github auth" });
    }
}
export const githubcallback = async (req, res) => {
    const { code, state } = req.query;
    console.log("GitHub OAuth Code:", code, "State (userId):", state);

    try {
        if (!code) return res.status(400).json({ message: "Code not found" })
        const response = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_SECRET,
                code,
            },
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (response.status !== 200) return res.status(400).json({ message: "Failed to fetch github auth" });

        const token = response.data.access_token;
        
        // Save token to DB if state is a valid userId
        if (state) {
            const user = await User.findById(state);
            if (user) {
                user.githubAccessToken = token;
                await user.save();
                console.log(`Saved GitHub Access Token to user ${user.displayName}`);
            } else {
                console.warn(`User with ID ${state} not found during GitHub OAuth callback`);
            }
        } else {
            console.warn("No user state found in GitHub OAuth callback");
        }

        res.cookie("github_token", token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/app/github?just_authorized=true`);

    } catch (error) {
        console.error(error);
        console.error(error.response?.data);

        res.status(500).json({
            message: "Failed to fetch github auth"
        });
    }
}

