import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];
const getUrl = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


// Get credits
router.get('/credits', verifyToken, (req, res) => {
    res.json({ credits: req.user.credits });
});

// AI Assistant: Understands problem + user code, gives contextual help
router.post('/assist', verifyToken, async (req, res) => {
    try {
        const { code, language, problemTitle, problemDescription, userMessage, explainLanguage } = req.body;
        const user = req.user;

        // Daily Reset Logic
        const lastReset = new Date(user.lastReset);
        const now = new Date();
        if (lastReset.toDateString() !== now.toDateString()) {
            user.credits = 5;
            user.lastReset = now;
            await user.save();
        }

        if (user.credits <= 0 && !user.isPremium) {
            return res.status(402).json({ error: "Insufficient credits. Please top-up.", credits: 0 });
        }

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key not configured" });
        }

        // Clean HTML tags from problem description
        const cleanDesc = (problemDescription || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 3000);

        console.log(`[AI Assist] Request: ${problemTitle}, Lang: ${language}, Explain: ${explainLanguage}`);

        const langInstruction = explainLanguage === 'hinglish'
            ? 'CRITICAL RULE: REFER TO THE USER AS "BHAI" OR "DOST". EXPLAIN IN HINGLISH (Hindi mixed with English, casual Indian dev style). Example: "Dekh bhai, pehle ek hashmap banao, phir loop lagao..." KEEP CODE IN PURE PROGRAMMING LANGUAGE.'
            : explainLanguage === 'hindi'
                ? 'CRITICAL RULE: REFER TO THE USER AS "BHAI". EXPLAIN IN HINDI (Devanagari script). Example: "नमस्ते भाई, पहले एक हैशमैप बनाओ..." KEEP CODE IN PURE PROGRAMMING LANGUAGE.'
                : explainLanguage === 'bhojpuri'
                    ? 'CRITICAL RULE: REFER TO THE USER AS "BHAIYA" OR "MARD". EXPLAIN IN BHOJPURI (Bihar/UP dialect, casual). Example: "Ka ho bhaiya, ehar dekha. Pehle ego hashmap bana la, tab loop chalaih..." KEEP CODE IN PURE PROGRAMMING LANGUAGE.'
                    : 'Explain in English.';

        const prompt = `You are SmartCoder AI — an expert coding assistant helping solve LeetCode problems.
You identify as a helpful, smart developer buddy.

PROBLEM: ${problemTitle || 'Unknown'}
DESCRIPTION: ${cleanDesc || 'No description available'}

USER'S CURRENT CODE (${language}):
\`\`\`${language}
${code || '// No code yet'}
\`\`\`

USER'S REQUEST: ${userMessage || 'Help me solve this problem'}

INSTRUCTIONS:
1. FOCUS ONLY ON THE CODE and the specific request.
2. DO NOT repeat the problem description or user request.
3. If the user's code is empty, provide a hint or starter code.
4. If the user's code is present, ANALYZE IT first.
5. Be direct. No filler words like "Here is the solution..." or "I understand...".
6. Jump straight to the explanation or code.
7. DETECT THE PROGRAMMING LANGUAGE from usage if not clear.
8. ALWAYS ANSWER IN THE SAME PROGRAMMING LANGUAGE as the user's code, unless explicitly asked to translate.

${langInstruction}
REMEMBER: Follow the language rule strictly.`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
                topP: 0.95
            }
        };

        // Try models in order
        let data = null;
        for (const model of MODELS) {
            const response = await fetch(getUrl(model), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                data = await response.json();
                break;
            } else if (response.status !== 429) {
                data = await response.json();
                break;
            }
        }

        if (!data) {
            return res.json({ response: 'AI service temporarily unavailable. Please try again.' });
        }

        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not generate response.';

        if (answer && answer !== 'Could not generate response.') {
            user.credits = Math.max(0, user.credits - 1);
            await user.save();
        }

        res.json({ response: answer, credits: user.credits });

    } catch (error) {
        console.error("AI Assist Error:", error.message);
        res.status(500).json({ error: "AI Assistant failed" });
    }
});

export default router;
