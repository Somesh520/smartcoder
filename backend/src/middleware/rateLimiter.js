import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // Limit each IP to 1000 requests requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
});
