
import '../config/loadEnv.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as leetcodeService from '../services/leetcodeService.js';
import connectDB from '../config/db.js';
import redisClient from '../config/redis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to frontend data file
const DSA_PATTERNS_PATH = path.join(__dirname, '../../../frontend/src/data/dsaPatterns.js');

async function extractSlugs() {
    try {
        const content = fs.readFileSync(DSA_PATTERNS_PATH, 'utf-8');
        // Regex to find all LeetCode links and extract slugs
        // Link format: https://leetcode.com/problems/slug/...
        const regex = /leetcode\.com\/problems\/([^/]+)/g;
        const slugs = new Set();
        let match;
        while ((match = regex.exec(content)) !== null) {
            slugs.add(match[1]);
        }
        return Array.from(slugs);
    } catch (e) {
        console.error("Failed to read patterns file:", e);
        return [];
    }
}

async function startCaching() {
    console.log("🚀 Starting DSA Patterns Caching...");

    // Connect to Redis (DB not strictly needed but good for env init)
    await connectDB();

    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    const slugs = await extractSlugs();
    console.log(`Found ${slugs.length} unique LeetCode problems to cache.`);

    let success = 0;
    let failed = 0;

    for (const [index, slug] of slugs.entries()) {
        try {
            console.log(`[${index + 1}/${slugs.length}] Caching: ${slug}...`);
            // We use fetchProblemDetails which has built-in Redis caching
            // We pass the SLUG as the ID since our service now supports slugs
            await leetcodeService.fetchProblemDetails(slug);
            success++;
        } catch (e) {
            console.error(`❌ Failed to cache ${slug}:`, e.message);
            failed++;
        }
        // Small delay to be nice to LeetCode API
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n✅ Caching Complete! Success: ${success}, Failed: ${failed}`);
    process.exit(0);
}

startCaching();
