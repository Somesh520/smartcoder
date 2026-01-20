import express from 'express';
import { LeetCode } from 'leetcode-query';
import * as leetcodeService from '../services/leetcodeService.js';

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

// 3. SEARCH: Autocomplete problems (GET)
// Endpoint: /api/leetcode/search?q=two
router.get('/search', async (req, res) => {
    try {
        const query = (req.query.q || "").toLowerCase().trim();
        if (query.length < 2) return res.json([]);

        let allProblems = await leetcodeService.fetchProblems();

        if (allProblems && allProblems.stat_status_pairs) {
            allProblems = allProblems.stat_status_pairs;
        }

        if (!allProblems || !Array.isArray(allProblems)) {
            console.error("[Search] Critical: allProblems is not an array");
            return res.json([]);
        }

        const matches = allProblems
            .filter(p => {
                const title = (p.title || p.stat?.question__title || "").toLowerCase();
                const slug = (p.title_slug || p.stat?.question__title_slug || "").toLowerCase();
                return title.includes(query) || slug.includes(query);
            })
            .slice(0, 10) // Limit to top 10
            .map(p => {
                let diff = "Medium";
                if (p.difficulty === 'Easy' || p.difficulty?.level === 1) diff = 'Easy';
                else if (p.difficulty === 'Medium' || p.difficulty?.level === 2) diff = 'Medium';
                else if (p.difficulty === 'Hard' || p.difficulty?.level === 3) diff = 'Hard';

                return {
                    id: p.stat?.question_id || p.id,
                    title: p.stat?.question__title || p.title,
                    slug: p.stat?.question__title_slug || p.title_slug || p.slug,
                    difficulty: diff,
                    paid: p.paid_only === true || p.paid === true
                };
            });

        res.json(matches);

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: "Search failed" });
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

// 6. SOLVED: Get User's Solved Problems (POST)
router.post('/solved', async (req, res) => {
    try {
        const { auth_session, auth_csrf } = req.body;
        if (!auth_session || !auth_csrf) {
            return res.status(400).json({ error: "Missing authentication" });
        }

        const solved = await leetcodeService.fetchUserSolvedProblems({ auth_session, auth_csrf });
        res.json(solved);
    } catch (error) {
        console.error("Solved Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch solved problems" });
    }
});

export default router;
