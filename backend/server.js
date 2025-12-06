import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- HELPER: HEADERS GENERATOR ---
const getHeaders = (slug, session, csrf) => ({
    'content-type': 'application/json',
    'origin': 'https://leetcode.com',
    'referer': slug ? `https://leetcode.com/problems/${slug}/` : 'https://leetcode.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'x-csrftoken': csrf,
    'cookie': `LEETCODE_SESSION=${session}; csrftoken=${csrf};`,
    'x-requested-with': 'XMLHttpRequest'
});

// Route 1: Problems List
app.get('/problems', async (req, res) => {
    try {
        const response = await axios.get('https://leetcode-api-pied.vercel.app/problems');
        res.json(response.data);
    } catch (error) { res.status(500).json({ error: "Fetch Failed" }); }
});

// Route 2: Get Problem Details + Snippets
app.get('/problem/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Fetch Problem Slug using ID
        // Note: Hum headers add kar rahe hain taaki LeetCode block na kare (HTML error fix)
        const listRes = await fetch('https://leetcode.com/api/problems/all/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://leetcode.com'
            }
        });

        // Check if response is OK
        if (!listRes.ok) throw new Error(`LeetCode API Failed: ${listRes.status}`);

        const listData = await listRes.json();
        
        const problem = listData.stat_status_pairs.find(p => p.stat.question_id == id || p.stat.frontend_question_id == id);
        
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        const titleSlug = problem.stat.question__title_slug;

        // 2. GraphQL Query (Comments removed to prevent syntax errors)
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

        const gqlData = await gqlRes.json();
        res.json(gqlData);

    } catch (error) {
        console.error("Problem Detail Error:", error.message);
        // Agar parsing error aaye toh user ko batao
        res.status(500).json({ error: "Server Error or LeetCode blocked the request" });
    }
});

// Route 3: RUN CODE
app.post('/run', async (req, res) => {
    try {
        let { slug, question_id, typed_code, data_input, lang, auth_session, auth_csrf } = req.body;

        if(!auth_session || !auth_csrf) {
            return res.status(401).json({ error: "Missing Auth! Please verify extension is working." });
        }

        // Fix Newlines in Input
        if (typeof data_input === 'string') {
            data_input = data_input.replace(/\\n/g, '\n');
        }

        console.log(`[RUN] Start: ${slug}`);

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
        console.log(`[RUN] Success, ID: ${response.data.interpret_id}`);
        res.json(response.data);

    } catch (error) {
        console.error("[RUN] Error:", error.message);
        res.status(500).json({ error: "Run Request Failed" });
    }
});


app.post('/submit', async (req, res) => {
    try {
        const { slug, question_id, typed_code, lang, auth_session, auth_csrf } = req.body;
        
        // 1. Auth Check
        if(!auth_session || !auth_csrf) {
            return res.status(401).json({ error: "Auth missing in request body" });
        }

        console.log(`[SUBMIT] Initiating for: ${slug} (ID: ${question_id})`);

        const url = `https://leetcode.com/problems/${slug}/submit/`;
        
        // Headers generate karo
        const headers = getHeaders(slug, auth_session, auth_csrf);

        
        const payload = {
            question_id: String(question_id),
            lang: lang || "cpp",
            typed_code: typed_code
        };

        const response = await axios.post(url, payload, { headers });
        
        console.log(`[SUBMIT] Success! Submission ID: ${response.data.submission_id}`);
        res.json(response.data);

    } catch (error) {
        // --- DEEP DEBUGGING LOGS ---
        console.error("❌ [SUBMIT] Error Occurred:");
        
        if (error.response) {
            // Server responded with a status code other than 2xx
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
            console.error("Headers:", JSON.stringify(error.response.headers, null, 2));
            
            // Agar LeetCode ne specific error bheja hai toh wahi frontend ko bhejo
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // Request bani par response nahi aaya
            console.error("No Response received from LeetCode");
            res.status(500).json({ error: "No response from LeetCode server" });
        } else {
            // Request setup me galti thi
            console.error("Message:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
});

// Route 5: POLL RESULT
app.post('/poll/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { slug, auth_session, auth_csrf } = req.body;

        const url = `https://leetcode.com/submissions/detail/${id}/check/`;
        const headers = getHeaders(slug, auth_session, auth_csrf);

        const response = await axios.get(url, { headers });
        res.json(response.data);

    } catch (error) {
        console.error("Poll Error:", error.message);
        res.status(500).json({ error: "Polling Failed" });
    }
});

app.get('/', (req, res) => {
    res.send("LeetCode Local Server is Running! 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});