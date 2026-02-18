import express from 'express';

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];
const getUrl = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// AI Assistant: Understands problem + user code, gives contextual help
router.post('/assist', async (req, res) => {
    try {
        const { code, language, problemTitle, problemDescription, userMessage, explainLanguage } = req.body;

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

        const langInstruction = explainLanguage === 'hinglish'
            ? 'IMPORTANT: Explain in Hinglish (Hindi written in English script, casual tone). Example: "Pehle ek hashmap banao, phir loop chalao..." But code must be in the programming language only.'
            : explainLanguage === 'hindi'
                ? 'IMPORTANT: Explain in Hindi (Devanagari script). Example: "पहले एक हैशमैप बनाओ, फिर लूप चलाओ..." But code must be in the programming language only.'
                : 'Explain in English.';

        const prompt = `You are SmartCoder AI — an expert coding assistant helping solve LeetCode problems. You are helpful, concise, and give production-quality code.

PROBLEM: ${problemTitle || 'Unknown'}
DESCRIPTION: ${cleanDesc || 'No description available'}

USER'S CURRENT CODE (${language}):
\`\`\`${language}
${code || '// No code yet'}
\`\`\`

USER'S REQUEST: ${userMessage || 'Help me solve this problem'}

${langInstruction}

INSTRUCTIONS:
- Analyze the problem and the user's current code
- If user asks for help/hints, give a clear approach explanation with steps
- If user asks to solve/complete, provide the complete working solution
- If user's code has bugs, identify and fix them
- Always explain your approach briefly before the code
- Format your response in clean markdown
- Use \`\`\`${language} for code blocks (ALWAYS specify language)
- Keep explanations concise but clear
- If giving a solution, make sure it's optimized and correct`;

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
        res.json({ response: answer });

    } catch (error) {
        console.error("AI Assist Error:", error.message);
        res.status(500).json({ error: "AI Assistant failed" });
    }
});

export default router;
