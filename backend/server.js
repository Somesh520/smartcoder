// 1. Zaroori packages import kar rahe hain
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;

// 2. CORS Enable karna
app.use(cors());

// IMPORTANT: POST body read karne ke liye
app.use(express.json());

// ================================================================
// CONFIGURATION (Update from Browser Developer Tools)
// ================================================================
const MY_CSRF_TOKEN = '4wk90uUpO4JD5j9pIWEyobEVDAFF46HA'; 
const MY_COOKIE = '__stripe_mid=4c3e963f-2c03-4164-b124-1162368bef1d833b73; INGRESSCOOKIE=322da007b3ead7d1631fe78da43c7fbb|8e0876c7c1464cc0ac96bc2edceabd27; ip_check=(false, "103.77.186.11"); cf_clearance=awPH4RuXA8hwUKHVDjvg1ay.Y2QyH1YXOKCDjSeoCs8-1764953812-1.2.1.1-BfvtJqUmGIQ0jxbXHy19zPRqZcn4O77gTi1ZSdlc1QfrRYF_zFLUT5.MACylEQ76M_I7GHsg5m7Y5MctO9_ZdaYF4gN3RMmgN4PYQnFGM_KOIcpQAZNscPAmN1lrdCtPhpZF_wK2pA06V8izITMEPripuINviYoXOVWU_Q0Aox7AhEE5r6DPzlms9l_uKbmBHn8LPrwcxGdVOZ2Rz1Wnos8EwCKswClz1SgczjDxZxg; csrftoken=4wk90uUpO4JD5j9pIWEyobEVDAFF46HA; messages=.eJyLjlaKj88qzs-Lz00tLk5MT1XSMdAxMtVRCi5NTgaKpJXm5FQqFGem56WmKGTmKSQWKwTnA5VmKIRklicWZeop6SgpxergMiUyv1QhI7EsFWZCfmkJAR0k2RsLABHXP5U:1vRZ79:YRPqDR_Bu0nDwOUWljh60hzdvfz_rQue2DsngmwU1eg; LEETCODE_SESSION=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfYXV0aF91c2VyX2lkIjoiMTQ5MzI3NzAiLCJfYXV0aF91c2VyX2JhY2tlbmQiOiJhbGxhdXRoLmFjY291bnQuYXV0aF9iYWNrZW5kcy5BdXRoZW50aWNhdGlvbkJhY2tlbmQiLCJfYXV0aF91c2VyX2hhc2giOiI5MmNlYjhiNDdkYWZhYzQ2MTE4Mzk3NzY2NzIzNTQyNjJiZGVjNmUyZjUyM2U0NzkwOGM4MWE5ZmY1YzA2OTNjIiwic2Vzc2lvbl91dWlkIjoiY2VhNDI5ZjQiLCJpZCI6MTQ5MzI3NzAsImVtYWlsIjoic29tZXNodGl3YXJpNTMyQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidE9YRlFGSWE3QiIsInVzZXJfc2x1ZyI6InRPWEZRRklhN0IiLCJhdmF0YXIiOiJodHRwczovL2Fzc2V0cy5sZWV0Y29kZS5jb20vdXNlcnMvdE9YRlFGSWE3Qi9hdmF0YXJfMTcyNzAxNjU5Ny5wbmciLCJyZWZyZXNoZWRfYXQiOjE3NjQ5NTM4MjMsImlwIjoiMTAzLjc3LjE4Ni4xMSIsImlkZW50aXR5IjoiNjg0ZmFjM2Q4ZTU5NTg0NTY0MGU1MDdhOTEyMmJkNTUiLCJkZXZpY2Vfd2l0aF9pcCI6WyIyN2VhMTdjNDg1YjVmNWUyZDg3N2FhZmJhMDA1NTU5ZCIsIjEwMy43Ny4xODYuMTEiXX0.pd5EQib7hNTeVX7LUDijo4y8uxK8vLRUb-rjAvgfuoA;';
// ================================================================

// Helper: Exact Headers Match (Mimicking Chrome)
const getHeaders = (slug) => ({
    'authority': 'leetcode.com',
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://leetcode.com',
    'referer': `https://leetcode.com/problems/${slug}/`,
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'x-csrftoken': MY_CSRF_TOKEN,
    'x-requested-with': 'XMLHttpRequest',
    'cookie': MY_COOKIE,
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin'
});


// --- ROUTE 1: Fetch All Problems ---
app.get('/problems', async (req, res) => {
    try {
        console.log("Fetching list...");
        const response = await axios.get('https://leetcode-api-pied.vercel.app/problems');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch list" });
    }
});

// --- ROUTE 2: Fetch Specific Problem ---
app.get('/problem/:id', async (req, res) => {
    try {
        console.log(`Fetching Problem ID: ${req.params.id}`);
        const response = await axios.get(`https://leetcode-api-pied.vercel.app/problem/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch problem" });
    }
});

// --- ROUTE 3: Run Code (Interpret) ---
app.post('/run', async (req, res) => {
    try {
        const { slug, question_id, typed_code, data_input, lang } = req.body;
        console.log(`[RUN] Start: ${slug} (ID: ${question_id})`);

        const url = `https://leetcode.com/problems/${slug}/interpret_solution/`;
        const headers = getHeaders(slug);

        const payload = {
            question_id: question_id,
            data_input: data_input,
            lang: lang || "cpp",
            typed_code: typed_code,
            judge_type: "large" // LeetCode ye extra field bhejta hai
        };

        const response = await axios.post(url, payload, { headers });
        console.log(`[RUN] Success, ID: ${response.data.interpret_id}`);
        res.json(response.data);

    } catch (error) {
        console.error("[RUN] Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Run Request Failed" });
    }
});

// --- ROUTE 4: Submit Code ---
app.post('/submit', async (req, res) => {
    try {
        const { slug, question_id, typed_code, lang } = req.body;
        console.log(`[SUBMIT] Start: ${slug}`);

        const url = `https://leetcode.com/problems/${slug}/submit/`;
        const headers = getHeaders(slug);

        const payload = {
            question_id: question_id,
            lang: lang || "cpp",
            typed_code: typed_code
        };

        const response = await axios.post(url, payload, { headers });
        console.log(`[SUBMIT] Success, ID: ${response.data.submission_id}`);
        res.json(response.data);

    } catch (error) {
        console.error("[SUBMIT] Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Submit Request Failed" });
    }
});

// --- ROUTE 5: Check Result (Polling) - FIXED REFERER ---
app.get('/poll/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // IMPORTANT: Frontend se 'slug' query param me aana chahiye
        // e.g. /poll/12345?slug=two-sum
        const slug = req.query.slug || 'two-sum'; 
        
        // console.log(`[POLL] Checking ${id} for slug: ${slug}`);

        const url = `https://leetcode.com/submissions/detail/${id}/check/`;
        const headers = getHeaders(slug); // Ab Referer sahi jayega

        const response = await axios.get(url, { headers });
        
        // Console me status dikhayenge taaki pata chale "PENDING" hai ya "SUCCESS"
        if(response.data.state !== 'SUCCESS') {
           process.stdout.write('.'); // Loading dots in terminal
        } else {
           console.log(`\n[POLL] Status: ${response.data.state}`);
        }

        res.json(response.data);

    } catch (error) {
        console.error("\n[POLL] Error:", error.message);
        res.status(500).json({ error: "Polling Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server Ready at http://localhost:${PORT}`);
});