import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 2000, // Limit each IP to 2000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
});
