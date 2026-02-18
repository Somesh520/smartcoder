import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';

// Node 18+ mein fetch native hota hai, agar purana node hai to node-fetch import rakho
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); 

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ FIX: Sirf Active Models rakho
const MODELS = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro-001'
];

const getUrl = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

// Get credits
router.get('/credits', verifyToken, (req, res) => {
    res.json({ credits: req.user.credits });
});

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

        const cleanDesc = (problemDescription || '').replace(/<[^>]*>/g, ' ').slice(0, 3000);

        console.log(`[AI Assist] Request: ${problemTitle}, Lang: ${language}`);

        const prompt = `You are SmartCoder AI.
PROBLEM: ${problemTitle}
USER CODE:
\`\`\`${language}
${code || ''}
\`\`\`
REQUEST: ${userMessage}
Explain in ${explainLanguage || 'English'}. Keep code in pure ${language}.`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        let data = null;
        let lastError = null;

        // ✅ FIX: Loop Logic 
        for (const model of MODELS) {
            try {
                console.log(`[AI] Trying model: ${model}`);
                const response = await fetch(getUrl(model), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.warn(`[AI] Failed ${model}: ${response.status} - ${errText}`);
                    lastError = { status: response.status, message: errText };
                    continue; // ⬅️ IMPORTANT: Continue to next model on error
                }

                data = await response.json();
                console.log(`[AI] Success with ${model}`);
                break; // ⬅️ Success milte hi loop roko

            } catch (fetchErr) {
                console.error(`[AI] Network error ${model}:`, fetchErr.message);
                lastError = { message: fetchErr.message };
            }
        }

        if (!data) {
            return res.status(500).json({
                response: 'AI service temporarily unavailable. Please try again.',
                debug: lastError
            });
        }

        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (answer) {
            user.credits = Math.max(0, user.credits - 1);
            await user.save();
            return res.json({ response: answer, credits: user.credits });
        } else {
            return res.status(500).json({ response: 'No answer generated.', debug: data });
        }

    } catch (error) {
        console.error("AI Assist Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;