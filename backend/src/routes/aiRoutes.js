import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import Groq from 'groq-sdk';

// Node 18+ mein fetch native hota hai, agar purana node hai to node-fetch import rakho
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); 

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Initialize Groq Client
let groq = null;
if (GROQ_API_KEY) {
    groq = new Groq({ apiKey: GROQ_API_KEY });
}

// 🚀 Primary: Groq Models (Fast & Free-tier friendly)
const GROQ_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
];

// 🛡️ Fallback: Gemini Models
const GEMINI_MODELS = [
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-001',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.5-pro'
];

const getGeminiUrl = (model) => `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

// Get credits
router.get('/credits', verifyToken, (req, res) => {
    res.json({ credits: req.user.credits });
});

router.post('/assist', verifyToken, async (req, res) => {
    try {
        const { code, language, problemTitle, userMessage, explainLanguage, history } = req.body;
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

        // 🧠 System Prompt with Persona & Context
        const systemPrompt = `You are SmartCoder AI, an expert programmer with a witty, helpful, and cool persona.
- **User**: The user's name is **${user.displayName || 'Coder'}**. Address them by name occasionally (e.g., "Hey ${user.displayName?.split(' ')[0] || 'Friend'}!").
- **Tone**: Professional yet friendly. Use emojis occasionally (e.g., 🚀, 💡, 🔧).
- **Language**: You MUST explain in ${explainLanguage || 'English'}. If Hinglish, mix Hindi and English naturally.
- **Constraint**: STRICTLY answer only **Coding, Debugging, Algorithms, System Design, or Technology** related questions.
  - If the user asks about anything else (e.g., movies, politics, life advice), politely refuse in a short sentence to save tokens.
  - Example Refusal: "Yaar ${user.displayName?.split(' ')[0] || 'Dost'}, main sirf coding mein help kar sakta hoon. 🤖"
- **Context**: 
  - Problem: ${problemTitle}
  - User's Code (${language}):
\`\`\`${language}
${code || '// No code written yet'}
\`\`\`

**Instructions**:
1. Answer the user's latest request based on the code and problem.
2. If the user asks for a fix, explanation, or optimization, provide it clearly.
3. Keep code strict and correct.
4. Use Markdown for formatting.`;

        // 📜 Construct Conversation History
        const messages = [{ role: "system", content: systemPrompt }];

        if (Array.isArray(history)) {
            history.forEach(msg => {
                messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
            });
        }

        // Add latest user message with explicit language instruction
        const langInstruction = explainLanguage ? `\n\n(IMPORTANT: Please reply in ${explainLanguage} language only)` : '';
        messages.push({ role: "user", content: userMessage + langInstruction });

        let answer = null;
        let lastError = null;

        // 1️⃣ TRY GROQ FIRST
        if (groq) {
            for (const model of GROQ_MODELS) {
                try {
                    console.log(`[AI] Trying Groq: ${model}`);
                    const chatCompletion = await groq.chat.completions.create({
                        messages: messages, // ✅ Pass Full History
                        model: model,
                        temperature: 1,
                        max_tokens: 1500,
                        top_p: 1,
                        stop: null,
                        stream: false
                    });

                    answer = chatCompletion.choices[0]?.message?.content;
                    if (answer) {
                        console.log(`[AI] Success with Groq (${model})`);
                        break;
                    }
                } catch (err) {
                    console.warn(`[AI] Groq Failed ${model}: ${err.message}`);
                    lastError = { message: err.message };
                }
            }
        }

        // 2️⃣ FALLBACK TO GEMINI (If Groq failed or not configured)
        if (!answer) {
            console.log("[AI] Switching to Gemini Fallback...");

            if (!GEMINI_API_KEY) {
                return res.status(500).json({ error: "No AI Provider Configured (Groq failed, Gemini Key missing)" });
            }

            // Construct Gemini Prompt (Gemini v1 doesn't support chat history array easily in this simple fetch, so we append history to prompt)
            let fullPrompt = systemPrompt + "\n\n**Conversation History:**\n";
            messages.forEach(m => {
                if (m.role !== 'system') fullPrompt += `\n${m.role.toUpperCase()}: ${m.content}`;
            });
            fullPrompt += `\nUSER: ${userMessage}\nASSISTANT: `;

            const payload = { contents: [{ parts: [{ text: fullPrompt }] }] };

            for (let i = 0; i < GEMINI_MODELS.length; i++) {
                const model = GEMINI_MODELS[i];
                try {
                    console.log(`[AI] Trying Gemini: ${model}`);
                    const response = await fetch(getGeminiUrl(model), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const errText = await response.text();
                        let errMsg = `Status ${response.status}`;

                        try {
                            const errJson = JSON.parse(errText);
                            if (response.status === 429) {
                                errMsg = "Quota Exceeded (429)";
                                // Backoff
                                const delay = (i + 1) * 1000;
                                console.warn(`[AI] Failed ${model}: ${errMsg} -> Waiting ${delay}ms...`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                            } else {
                                errMsg = errJson.error?.message || errText;
                                console.warn(`[AI] Failed ${model}: ${errMsg} -> Switching...`);
                            }
                        } catch (e) { errMsg = errText; }

                        lastError = { status: response.status, message: errMsg };
                        continue;
                    }

                    const data = await response.json();
                    answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (answer) {
                        console.log(`[AI] Success with Gemini (${model})`);
                        break;
                    }

                } catch (fetchErr) {
                    console.error(`[AI] Network error ${model}:`, fetchErr.message);
                    lastError = { message: fetchErr.message };
                }
            }
        }

        if (answer) {
            user.credits = Math.max(0, user.credits - 1);
            await user.save();
            return res.json({ response: answer, credits: user.credits });
        } else {
            return res.status(500).json({ response: 'AI service busy. Please try again later.', debug: lastError });
        }

    } catch (error) {
        console.error("AI Assist Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;