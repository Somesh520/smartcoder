import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/auth', (req, res) => {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    let decoded = null;
    let verifyError = null;

    if (token) {
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            verifyError = err.message;
        }
    }

    res.json({
        ip: req.ip,
        origin: req.get('origin'),
        referer: req.get('referer'),
        cookies: req.cookies,
        headers: req.headers,
        token_found: !!token,
        token_source: req.headers.authorization ? 'Bearer Header' : (req.cookies.token ? 'Cookie' : 'None'),
        token_valid: !!decoded,
        user_id: decoded?.id || null,
        verify_error: verifyError,
        env: process.env.NODE_ENV
    });
});

export default router;
