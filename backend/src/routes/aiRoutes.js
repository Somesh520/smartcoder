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
        const systemPrompt = `You are SmartCoder AI, an expert, professional, and highly efficient coding assistant.
- **User**: The user's name is **${user.displayName || 'Coder'}**. Address them professionally.
- **Tone**: Direct, highly technical, and completely professional. Do NOT use emotional fillers (like "Hmm", "Oh") or roleplay actions (like *nods* or *smiles warmly*).
- **Language**: You MUST reply in the exact language requested by the user at the end of their message. If no specific language is requested, use clear technical English.
- **Response Format**: Give extremely SHORT and CONCISE answers to the direct question. However, ensure the technical explanation logic is DEEP and ACCURATE. No fluff.
- **Core Behavior**:
  - **Never dump full code instantly** unless explicitly requested. Provide specific logic and targeted snippets.
  - **Focus on Explaining**: Provide the deep "why" and "how" of the problem, completely stripped of conversational padding.
  - **No Roleplay/Emotes**: Never use asterisk-enclosed gestures or excessive emojis.
- **Constraint**: STRICTLY answer only ** Coding, Debugging, Algorithms, System Design, or Technology ** related questions.
  - Refuse non-coding topics politely to stay on track.
- **Safety Policy**:
  - If the user asks about Explicit or Harmful content, do NOT answer.
- **Context**: 
  - Problem: ${problemTitle}
  - User's Code (${language}):
\`\`\`${language}
${code || '// No code written yet'}
\`\`\`

**Instructions**:
1. Analyze the context and give a very short, direct answer first.
2. Follow up with deep technical insight without any chatty filler.
3. Use Markdown specifically for code and key terms.`;

        // 📜 Construct Conversation History
        const messages = [{ role: "system", content: systemPrompt }];

        if (Array.isArray(history)) {
            history.forEach(msg => {
                messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
            });
        }

        // Add latest user message with explicit language instruction
        let langInstruction = '';
        if (explainLanguage) {
            const lang = explainLanguage.toLowerCase();
            if (lang === 'bhojpuri') {
                langInstruction = `\n\n(IMPORTANT: Please reply ONLY in Bhojpuri language, but STRICTLY use the English alphabet. DO NOT use Devanagari script. Example: "Kaisan baa bhai")`;
            } else if (lang === 'hinglish') {
                langInstruction = `\n\n(IMPORTANT: Please reply ONLY in Hinglish (Hindi written using the English alphabet). DO NOT provide dual English translations and DO NOT use formal Devanagari script. Example: "Aapko pehle condition check karna hoga")`;
            } else if (['hindi', 'marathi', 'bengali', 'tamil', 'telugu', 'gujarati', 'kannada'].includes(lang)) {
                langInstruction = `\n\n(IMPORTANT: Please reply ONLY in formal ${explainLanguage} language using its native script. Do NOT provide English translations.)`;
            } else {
                langInstruction = `\n\n(IMPORTANT: Please reply ONLY in ${explainLanguage}.)`;
            }
        }
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

router.post('/complexity', verifyToken, async (req, res) => {
    try {
        const { code, language, problemTitle } = req.body;
        const user = req.user;

        if (user.credits <= 0 && !user.isPremium) {
            return res.status(402).json({ error: "Insufficient credits." });
        }

        const systemPrompt = `You are a Time Complexity Analyzer. 
Analyze the given code for Time and Space complexity.
Return a JSON object with:
1. "timeComplexity": String (e.g., "O(n log n)")
2. "spaceComplexity": String (e.g., "O(n)")
3. "complexityData": Array of 10-15 points for a chart visualization showing growth. Each point should be { n: number, ops: number }. The "ops" should be a relative value representing the number of operations for that "n" based on the time complexity. For example, if it's O(n^2), ops should be n*n.
4. "explanation": A very short (1 sentence) explanation of why.

Problem: ${problemTitle}
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

ONLY return the JSON object. No extra text.`;

        const messages = [{ role: "system", content: systemPrompt }];
        let answer = null;

        if (groq) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: messages,
                    model: 'llama-3.1-8b-instant',
                    temperature: 0,
                    response_format: { type: "json_object" }
                });
                answer = completion.choices[0]?.message?.content;
            } catch (err) {
                console.warn("[AI] Groq Complexity Failed:", err.message);
            }
        }

        if (!answer && GEMINI_API_KEY) {
            const payload = { contents: [{ parts: [{ text: systemPrompt + "\nOutput valid JSON." }] }] };
            const response = await fetch(getGeminiUrl('gemini-2.0-flash-lite'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                answer = text?.replace(/```json|```/g, '').trim();
            }
        }

        if (answer) {
            const result = JSON.parse(answer);
            return res.json(result);
        } else {
            return res.status(500).json({ error: "Could not generate analysis." });
        }

    } catch (error) {
        console.error("Complexity Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;