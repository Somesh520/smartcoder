import express from 'express';
import { LeetCode } from 'leetcode-query';

const router = express.Router();
const leetcode = new LeetCode(); // Auto-manages sessions/CSRF

// Dynamic fetch import for compatibility
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 1. AUTO-SYNC: Discover user from Session Cookie (POST)
router.post('/me', async (req, res) => {
    try {
        const { leetcode_session } = req.body;
        if (!leetcode_session) {
            return res.status(400).json({ error: "No session provided" });
        }

        // 1. Identify User using GraphQL
        const gqlQuery = {
            query: `
                query globalData {
                    userStatus {
                        username
                        isSignedIn
                    }
                }
            `
        };

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `LEETCODE_SESSION=${leetcode_session}`
            },
            body: JSON.stringify(gqlQuery)
        });

        const data = await response.json();


        if (!data.data || !data.data.userStatus || !data.data.userStatus.isSignedIn) {
            return res.status(401).json({ error: "Invalid Session or Not Signed In" });
        }

        const username = data.data.userStatus.username.trim();


        // JUST return the username. Let the frontend fetch the stats using the working GET endpoint.
        res.json({ username: username });

    } catch (error) {
        console.error("Auto-sync Error:", error);
        res.status(500).json({ error: "Failed to sync with LeetCode session" });
    }
});

// 2. PUBLIC PROXY: Fetch stats by username (GET)
// Note: This must be defined AFTER specific routes if we used generic paths, 
// but since we have /:username, it would swallow /me if defined first.
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;



        // Parallel fetching
        const [user, contest] = await Promise.all([
            leetcode.user(username),
            leetcode.user_contest_info(username)
        ]);

        if (!user || !user.matchedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const matchedUser = user.matchedUser;
        const submitStats = matchedUser.submitStats.acSubmissionNum;

        const getCount = (diff) => submitStats.find(s => s.difficulty === diff)?.count || 0;
        const totalSubmissions = matchedUser.submitStats.totalSubmissionNum.find(s => s.difficulty === "All")?.count || 1;

        const responseData = {
            username: matchedUser.username,
            totalSolved: getCount("All"),
            easySolved: getCount("Easy"),
            mediumSolved: getCount("Medium"),
            hardSolved: getCount("Hard"),
            acceptanceRate: submitStats.length > 0 ? ((getCount("All") / totalSubmissions) * 100).toFixed(2) : "0.00",
            ranking: matchedUser.profile.ranking,
            contributionPoints: matchedUser.contributions.points,
            reputation: matchedUser.profile.reputation,
            submissionCalendar: matchedUser.submissionCalendar,
            streak: 0,
            longestStreak: 0
        };

        // DISABLE CACHING
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json(responseData);

    } catch (error) {
        console.error("LeetCode Proxy Error:", error);
        res.status(500).json({ error: "Failed to fetch LeetCode data" });
    }
});

export default router;
