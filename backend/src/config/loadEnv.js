import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend/src/.env regardless of CWD
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log(`[ENV] Loaded config from ${envPath}`);

console.log('[ENV] Environment variables loaded.');
