import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import fetch from 'node-fetch'; // Ensure node-fetch is imported correctly for your setup

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// FIX 1: Stable models ko priority do. 'exp' models expire ho jate hain.
const MODELS = [
    'gemini-1.5-flash',       // Best balance of speed/cost/quality
    'gemini-1.5-pro',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro-001',
    'gemini-pro'
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

        // Clean HTML tags
        const cleanDesc = (problemDescription || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .trim()
            .slice(0, 3000);

        console.log(`[AI Assist] Request: ${problemTitle}, Lang: ${language}`);

        const langInstruction = explainLanguage === 'hinglish'
            ? 'CRITICAL RULE: REFER TO THE USER AS "BHAI" OR "DOST". EXPLAIN IN HINGLISH. KEEP CODE IN PURE PROGRAMMING LANGUAGE.'
            : explainLanguage === 'hindi'
                ? 'CRITICAL RULE: REFER TO THE USER AS "BHAI". EXPLAIN IN HINDI. KEEP CODE IN PURE PROGRAMMING LANGUAGE.'
                : 'Explain in English.';

        const prompt = `You are SmartCoder AI. 
PROBLEM: ${problemTitle}
USER CODE:
\`\`\`${language}
${code || ''}
\`\`\`
REQUEST: ${userMessage}
${langInstruction}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
            }
        };

        let data = null;
        let lastError = null;

        // FIX 2: Loop Logic sudhar diya hai
        for (const model of MODELS) {
            console.log(`[AI] Trying model: ${model}`);
            try {
                const response = await fetch(getUrl(model), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    data = await response.json();
                    console.log(`[AI] Success with ${model}`);
                    break; // Sirf success hone par break karo
                } else {
                    const errorText = await response.text();
                    console.warn(`[AI] Failed ${model}: ${response.status} - ${errorText}`);
                    lastError = { status: response.status, message: errorText };

                    // YAHAN "break" MAT LAGANA.
                    // Loop ko chalne do taaki agla model try ho sake.
                }
            } catch (fetchErr) {
                console.error(`[AI] Fetch error for ${model}:`, fetchErr.message);
                lastError = { message: fetchErr.message };
            }
        }

        if (!data) {
            console.error("[AI Error] All models failed.", lastError);
            return res.status(500).json({ // Return proper status code
                response: 'AI service temporarily unavailable. Please try again.',
                debug: lastError
            });
        }

        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!answer) {
            return res.json({ response: 'Could not generate response.', debug: data });
        }

        // Deduct credit only on success
        user.credits = Math.max(0, user.credits - 1);
        await user.save();

        res.json({ response: answer, credits: user.credits });

    } catch (error) {
        console.error("AI Assist Error:", error.message);
        res.status(500).json({ error: "AI Assistant failed" });
    }
});

export default router;