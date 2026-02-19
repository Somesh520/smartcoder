export const allowedOrigin = (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (
        origin.includes('localhost') ||
        origin.endsWith('.vercel.app') ||
        origin === process.env.CLIENT_URL
    ) {
        callback(null, true);
    } else {
        console.log("Blocked CORS for:", origin);
        callback(new Error('Not allowed by CORS'));
    }
};

export const corsOptions = {
    origin: allowedOrigin,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma']
};
