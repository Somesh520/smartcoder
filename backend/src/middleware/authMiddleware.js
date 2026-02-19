import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        console.warn("[AuthMiddleware] No token found in headers or cookies.", {
            headers: req.headers,
            cookies: req.cookies
        });
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            console.warn("[AuthMiddleware] Token valid but user not found in DB.", { id: decoded.id });
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        console.error("[AuthMiddleware] Token verification failed:", error.message);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
        } else {
            console.error("Auth Middleware Error:", error);
            res.status(500).json({ message: 'Server error during authentication' });
        }
    }
};

export const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        req.user = null; // Invalid token, treat as guest
        next();
    }
};
