
import * as leetcodeService from './src/services/leetcodeService.js';
import redisClient from './src/config/redis.js';

// Mock Redis to avoid connection errors if not running
if (!redisClient.isOpen) {
    redisClient.get = async () => null;
    redisClient.set = async () => { };
    redisClient.isOpen = true; // Fake it
}

async function test() {
    try {
        console.log("Testing fetchProblems...");
        const problems = await leetcodeService.fetchProblems();
        console.log("Problem Count:", problems.length);
        if (problems.length > 0) {
            console.log("First Problem:", problems[0]);
        }
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

test();
