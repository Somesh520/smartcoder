import express from 'express';

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];
const getUrl = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.post('/autocomplete', async (req, res) => {
    try {
        const { code, language, cursorLine, cursorColumn } = req.body;

        if (!code || !language) {
            return res.status(400).json({ error: "Missing code or language" });
        }

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key not configured" });
        }

        const lines = code.split('\n');
        const beforeCursor = lines.slice(0, cursorLine).join('\n');
        const currentLine = lines[cursorLine - 1] || '';
        const afterCursor = lines.slice(cursorLine).join('\n');

        const prompt = `You are an expert code autocomplete engine for ${language}. You are helping a programmer solve a LeetCode problem.

Given the code context below, predict and complete ONLY the next few tokens/lines the programmer is likely to type. 

RULES:
- Output ONLY the completion text (what comes after the cursor), nothing else
- Do NOT repeat any existing code
- Do NOT add explanations, comments, or markdown
- Keep completions short and relevant (1-3 lines max)
- If the cursor is mid-line, complete that line first
- Match the existing code style and indentation
- If unsure, return empty string

CODE BEFORE CURSOR:
\`\`\`${language}
${beforeCursor}
\`\`\`

CURRENT LINE (cursor at column ${cursorColumn}):
${currentLine}

CODE AFTER CURSOR:
\`\`\`${language}
${afterCursor}
\`\`\`

COMPLETION:`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 128,
                topP: 0.95,
                stopSequences: ['\n\n\n', '```']
            }
        };

        // Try models in order (lite first for lower quota usage)
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
                // Non-rate-limit error, don't retry
                data = await response.json();
                break;
            }
            // 429 = rate limited, try next model
        }

        if (!data) {
            return res.json({ suggestion: '' });
        }

        const suggestion = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean up: remove markdown fences and trailing whitespace
        const cleaned = suggestion
            .replace(/^```[\w]*\n?/gm, '')
            .replace(/```$/gm, '')
            .trimEnd();

        res.json({ suggestion: cleaned });

    } catch (error) {
        console.error("AI Autocomplete Error:", error.message);
        res.status(500).json({ error: "Autocomplete failed" });
    }
});

export default router;
