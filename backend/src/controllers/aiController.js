import Groq from "groq-sdk";
import { z } from "zod";

const chatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .trim()
    .min(1, "History message content cannot be empty")
    .max(10000),
});

// POST /api/ai/assist request body
export const assistRequestSchema = z.object({
  code: z.string().max(100000).default(""),
  language: z.string().trim().min(1, "Language is required").max(50),
  problemTitle: z.string().trim().max(300).default("Untitled problem"),
  userMessage: z.string().trim().min(1, "A message is required").max(10000),
  explainLanguage: z.string().trim().min(1).max(50).optional(),
  history: z.array(chatHistoryMessageSchema).max(50).optional(),
});

// POST /api/ai/complexity request body
export const complexityRequestSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(100000),
  language: z.string().trim().min(1, "Language is required").max(50),
  problemTitle: z.string().trim().max(300).default("Untitled problem"),
});

const validateBody = (schema, body) => {
  const result = schema.safeParse(body);

  if (result.success) return { data: result.data };

  return {
    error: result.error.issues.map(({ path, message }) => ({
      field: path.join(".") || "body",
      message,
    })),
  };
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Initialize Groq Client
let groq = null;
if (GROQ_API_KEY) {
  groq = new Groq({ apiKey: GROQ_API_KEY });
}

// 🚀 Primary: Gemini Models (Working perfectly for you)
const GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-lite-001",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-2.5-pro",
];

const LANGUAGE_INSTRUCTIONS = {
  english: "Reply only in English.",
  hinglish:
    "Reply only in Hinglish: Hindi written with the English alphabet. Never use Devanagari and do not add an English translation.",
  bhojpuri:
    "Reply only in Bhojpuri written like yee sawal hamre me na hoba . Never use Devanagari and do not add an English translation.",
  hindi:
    "Reply only in formal Hindi using Devanagari script. Do not add an English translation.",
  marathi:
    "Reply only in formal Marathi using Devanagari script. Do not add an English translation.",
  bengali:
    "Reply only in formal Bengali using Bengali script. Do not add an English translation.",
  tamil:
    "Reply only in formal Tamil using Tamil script. Do not add an English translation.",
  telugu:
    "Reply only in formal Telugu using Telugu script. Do not add an English translation.",
  gujarati:
    "Reply only in formal Gujarati using Gujarati script. Do not add an English translation.",
  kannada:
    "Reply only in formal Kannada using Kannada script. Do not add an English translation.",
};

const getGeminiUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

export const getCredits = (req, res) => {
  try {
    const credits = req.user.credits;
    if (!credits && credits !== 0) {
      return res.status(404).json({ error: "Credits not found" });
    }
    return res.json({ credits });
  } catch (error) {
    console.error("Get Credits Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const handleAssist = async (req, res) => {
  try {
    const validation = validateBody(assistRequestSchema, req.body);
    if (validation.error) {
      return res.status(400).json({
        error: "Invalid AI assist request",
        details: validation.error,
      });
    }

    const {
      code,
      language,
      problemTitle,
      userMessage,
      explainLanguage,
      history,
    } = validation.data;
    const user = req.user;
    const selectedLanguage = (explainLanguage || "english").toLowerCase();
    const languageInstruction =
      LANGUAGE_INSTRUCTIONS[selectedLanguage] ||
      `Reply only in ${explainLanguage}. Do not provide translations in another language.`;

    // Daily Reset Logic
    const lastReset = new Date(user.lastReset);
    const now = new Date();
    if (lastReset.toDateString() !== now.toDateString()) {
      user.credits = 5;
      user.lastReset = now;
      await user.save();
    }

    if (user.credits <= 0 && !user.isPremium) {
      return res
        .status(402)
        .json({ error: "Insufficient credits. Please top-up.", credits: 0 });
    }

    // 🧠 System Prompt with Persona & Context
    const systemPrompt = `You are SmartCoder AI — a terse, expert coding assistant.

  - User: ${user.displayName || "Coder"}
  - Output language (non-negotiable): ${languageInstruction} This overrides the language of the question, code, and history.

  HARD FORMAT RULES (never break these):
  1. Max 4 sentences of prose per response. If more is needed, use bullet points instead of paragraphs.
  2. Lead with the direct answer in sentence 1. No setup lines.
  3. One code snippet max, only if essential. Never full solutions unless explicitly asked.
  4. No filler words.
  5. No restating the user's question.
  6. Use bullets if explaining more than one point.

  Structure for every answer:
  - Line 1: Direct answer/verdict (1 sentence)
  - Then: 2-3 bullets max with core reasoning, each under 15 words
  - Optional: 1 short code line/snippet only if it clarifies

  Behavior:
  - Never dump full code unless user explicitly asks: "full code", "complete solution", "poora code do".
  - Refuse non-coding topics in 1 line, no explanation.
  - Refuse explicit/harmful content requests silently: "Can't help with that."

  Context:
  - Problem: ${problemTitle}
  - User's Code (${language}):
  \`\`\`${language}
  ${code || "// No code written yet"}
  \`\`\`

  Instructions:
  1. Analyze context and give a short direct answer first.
  2. Follow with technical insight, no chatty filler.
  3. Use Markdown only for code and key terms.

  If your answer goes over 4 sentences or 3 bullets, cut it.`;

    // 📜 Construct Conversation History
    const messages = [{ role: "system", content: systemPrompt }];

    if (Array.isArray(history)) {
      history.forEach((msg) => {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      });
    }

    // Repeat this after the chat history so previous messages cannot override it.
    messages.push({
      role: "user",
      content: `${userMessage}\n\nOUTPUT-LANGUAGE RULE (must follow): ${languageInstruction}`,
    });

    let answer = null;
    let lastError = null;

    if (groq) {
      try {
        console.log(`[AI] Trying Groq with model: llama-3.3-70b-versatile`);
        const chatCompletion = await groq.chat.completions.create({
          messages: messages,
          model: "llama-3.3-70b-versatile",
        });
        answer = chatCompletion.choices[0]?.message?.content;
        if (answer) {
          console.log(`[AI] Success with Groq (llama-3.3-70b-versatile)`);
        }
      } catch (err) {
        console.warn(`[AI] Groq failed:`, err.message);
        lastError = { message: err.message };
      }
    }

    // 2️⃣ FALLBACK TO GEMINI (If Groq failed or not configured)
    if (!answer) {
      console.log("[AI] Switching to Gemini Fallback...");

      if (!GEMINI_API_KEY) {
        return res.status(500).json({
          error: "No AI Provider Configured (Groq failed, Gemini Key missing)",
        });
      }

      // Construct Gemini Prompt
      let fullPrompt = systemPrompt + "\n\n**Conversation History:**\n";
      messages.forEach((m) => {
        if (m.role !== "system")
          fullPrompt += `\n${m.role.toUpperCase()}: ${m.content}`;
      });
      fullPrompt += `\nUSER: ${userMessage}\nASSISTANT: `;

      const payload = { contents: [{ parts: [{ text: fullPrompt }] }] };

      for (let i = 0; i < GEMINI_MODELS.length; i++) {
        const model = GEMINI_MODELS[i];
        try {
          console.log(`[AI] Trying Gemini: ${model}`);
          const response = await fetch(getGeminiUrl(model), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
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
                console.warn(
                  `[AI] Failed ${model}: ${errMsg} -> Waiting ${delay}ms...`,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
              } else {
                errMsg = errJson.error?.message || errText;
                console.warn(`[AI] Failed ${model}: ${errMsg} -> Switching...`);
              }
            } catch (e) {
              errMsg = errText;
            }

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
      return res.status(500).json({
        response: "AI service busy. Please try again later.",
        debug: lastError,
      });
    }
  } catch (error) {
    console.error("AI Assist Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const handleComplexity = async (req, res) => {
  try {
    const validation = validateBody(complexityRequestSchema, req.body);
    if (validation.error) {
      return res.status(400).json({
        error: "Invalid complexity request",
        details: validation.error,
      });
    }

    const { code, language, problemTitle } = validation.data;
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
        console.log("[AI] Trying Groq for complexity (llama-3.3-70b-versatile)");
        const chatCompletion = await groq.chat.completions.create({
          messages: messages,
          model: "llama-3.3-70b-versatile",
        });
        answer = chatCompletion.choices[0]?.message?.content?.replace(/```json|```/g, "").trim();
        if (answer) {
           console.log(`[AI] Success with Groq for complexity`);
        }
      } catch (err) {
        console.warn("[AI] Groq complexity failed:", err.message);
      }
    }

    if (!answer && GEMINI_API_KEY) {
      const payload = {
        contents: [
          { parts: [{ text: systemPrompt + "\nOutput valid JSON." }] },
        ],
      };
      const response = await fetch(getGeminiUrl("gemini-2.0-flash-lite"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        answer = text?.replace(/```json|```/g, "").trim();
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
};
