import dotenv from 'dotenv';
import path from 'path';

// Assuming running from backend root
dotenv.config({ path: './src/.env' });

console.log('[ENV] Environment variables loaded.');
