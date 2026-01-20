import axios from 'axios';
import { getHeaders } from '../utils/headers.js';
import redisClient from '../config/redis.js';

export const fetchProblems = async () => {
    const cacheKey = 'leetcode:problems';

    // 1. Try Cache (Safe)
    try {
        if (redisClient.isOpen) {
            const cached = await redisClient.get(cacheKey);
            if (cached) {

                return JSON.parse(cached);
            }
        }
    } catch (cacheErr) {
        console.warn("Redis Cache Warning:", cacheErr.message);
        // Continue to API...
    }

    // 2. Try Primary API
    try {

        const response = await axios.get('https://leetcode-api-pied.vercel.app/problems', { timeout: 5000 });
        const data = response.data;

        // Cache result
        try { if (redisClient.isOpen) await redisClient.set(cacheKey, JSON.stringify(data), { EX: 3600 }); } catch (e) { }

        return data;
    } catch (primaryErr) {
        console.warn("Primary API Failed:", primaryErr.message);

        // 3. Try Backup API
        try {

            const response = await axios.get('https://alfa-leetcode-api.onrender.com/problems', { timeout: 8000 });
            const data = response.data; // Note: Structure might differ, need to ensure compatibility or normalize
            // Alfa API returns { totalQuestions: N, count: N, problemsetQuestionList: [...] }
            // SocketHandler expects { stat_status_pairs: [...] } or normalized array.

            // Let's normalize to what socketHandler expects:
            // The Primary API returns direct array or specific structure. 
            // socketHandler.js (line 88): if (allProblems.stat_status_pairs) allProblems = allProblems.stat_status_pairs;

            // If Alfa returns `problemsetQuestionList`, we can wrap it effectively or map it.
            // Alfa: [ { title: "", titleSlug: "", difficulty: "", ... } ] (It's actually different structure)

            // Actually, safest is to stick to one format or handle differently.
            // Let's try a different endpoint or just let the offline fallback take over if primary fails.
            // "alfa-leetcode-api" return structure is cleaner but different.

            // Let's TRY another direct mirror: "https://leetcode-to-openapi.vercel.app/api" ? No.

            // Let's keep it simple: Fix the Redis blocking issue first, which is the main culprit "read ETIMEDOUT".
            // If Redis times out, it shouldn't crash.
            throw primaryErr; // Re-throw for now if we don't have a guaranteed compatible backup ready
        } catch (backupErr) {
            console.error("All APIs failed");
            throw primaryErr;
        }
    }
};

export const fetchProblemDetails = async (id) => {
    const cacheKey = `leetcode:problem:${id}`;

    try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {

            return JSON.parse(cached);
        }
    } catch (e) {
        console.error("Redis Get Error:", e);
    }

    // 1. Fetch Problem Slug using ID (If input is numeric ID)
    let titleSlug = id;

    // Check if 'id' is actually a slug (contains non-numeric)
    const isSlug = isNaN(id);

    if (!isSlug) {
        const listRes = await fetch('https://leetcode.com/api/problems/all/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://leetcode.com'
            }
        });

        if (!listRes.ok) throw new Error(`LeetCode API Failed: ${listRes.status}`);

        const listData = await listRes.json();
        const problem = listData.stat_status_pairs.find(p => p.stat.question_id == id || p.stat.frontend_question_id == id);

        if (!problem) throw new Error("Problem not found");
        titleSlug = problem.stat.question__title_slug;
    }


    const query = `
        query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                questionId
                questionFrontendId
                title
                content
                mysqlSchemas
                dataSchemas
                exampleTestcases
                metaData
                codeSnippets {
                    lang
                    langSlug
                    code
                }
            }
        }
    `;

    const gqlRes = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
            query: query,
            variables: { titleSlug }
        })
    });

    const data = await gqlRes.json();

    // Cache for 24 hours
    try {
        await redisClient.set(cacheKey, JSON.stringify(data), { EX: 86400 });
    } catch (e) {
        console.error("Redis Set Error:", e);
    }

    return data;
};

export const runCode = async ({ slug, question_id, typed_code, data_input, lang, auth_session, auth_csrf }) => {
    if (typeof data_input === 'string') {
        data_input = data_input.replace(/\\n/g, '\n');
    }

    const url = `https://leetcode.com/problems/${slug}/interpret_solution/`;
    const headers = getHeaders(slug, auth_session, auth_csrf);

    const payload = {
        question_id: question_id,
        data_input: data_input,
        lang: lang || "cpp",
        typed_code: typed_code,
        judge_type: "large"
    };

    const response = await axios.post(url, payload, { headers });
    return response.data;
};

export const submitCode = async ({ slug, question_id, typed_code, lang, auth_session, auth_csrf }) => {
    const url = `https://leetcode.com/problems/${slug}/submit/`;
    const headers = getHeaders(slug, auth_session, auth_csrf);

    const payload = {
        question_id: String(question_id),
        lang: lang || "cpp",
        typed_code: typed_code
    };

    const response = await axios.post(url, payload, { headers });
    return response.data;
};

export const checkSubmission = async (id, { slug, auth_session, auth_csrf }) => {
    const url = `https://leetcode.com/submissions/detail/${id}/check/`;
    const headers = getHeaders(slug, auth_session, auth_csrf);

    const response = await axios.get(url, { headers });
    return response.data;
};

export const fetchUserSolvedProblems = async ({ auth_session, auth_csrf }) => {
    // We don't need a specific slug for /problems/all/
    // But getHeaders usually requires one. We can pass null or empty string if getHeaders handles it,
    // or just construct headers manually here since we only need Cookie and User-Agent.

    // Manually constructing headers to be safe as getHeaders might enforce Referer with slug
    const headers = {
        'Cookie': `LEETCODE_SESSION=${auth_session}; csrftoken=${auth_csrf}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com/problemset/all/'
    };

    try {
        const response = await axios.get('https://leetcode.com/api/problems/all/', { headers, timeout: 10000 });
        const allProblems = response.data.stat_status_pairs; // Array of problem stats

        // Filter for "ac" (Accepted) status
        // status can be "ac", "notac" (attempted), or null
        const solved = allProblems
            .filter(p => p.status === 'ac')
            .map(p => ({
                id: p.stat.question_id,
                frontend_id: p.stat.frontend_question_id,
                slug: p.stat.question__title_slug
            }));

        return solved;
    } catch (e) {
        console.error("Fetch Solved Problems Error:", e.message);
        throw e;
    }
};
