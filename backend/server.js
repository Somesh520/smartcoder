import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            process.env.CLIENT_URL,
            "https://smartcoder.vercel.app"
        ].filter(Boolean),
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

// Basic Middleware
// Basic Middleware
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL, // Production Frontend URL
    'https://smartcoder.vercel.app' // Fallback Vercel URL
].filter(Boolean);

app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true
}));
app.use(express.json());

// --- ROOM MANAGER STATE ---
const rooms = {}; // { roomId: { users: [], problem: {}, status: 'waiting' | 'active' } }

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);



    // JOIN ROOM
    socket.on('joinRoom', async ({ roomId, username, topic, difficulty }) => { // Accept topic & difficulty
        roomId = String(roomId); // Force String
        socket.join(roomId);

        console.log(`[JOIN] Socket ${socket.id} joined room "${roomId}"`);

        if (!rooms[roomId]) {
            // Ideally we fetch from our local cache or API. For now, random from list logic needed.
            // We will fetch problem list first if not cached (simplified for now)
            rooms[roomId] = {
                id: roomId,
                users: [],
                problem: null,
                status: 'waiting',
                topic: topic || 'all', // Store topic
                difficulty: difficulty || 'Medium'
            };
        }

        // Add user
        rooms[roomId].users.push({ id: socket.id, username, score: 0, status: 'joined' });

        // Notify room
        io.to(roomId).emit('roomUpdate', rooms[roomId]);

        // If 2 users, Start Game!
        if (rooms[roomId].users.length === 2 && rooms[roomId].status === 'waiting') {
            rooms[roomId].status = 'starting';
            io.to(roomId).emit('gameStart', { message: "Game Starting in 5 seconds..." });

            // Fetch Random Problem and Broadcast
            try {
                const response = await axios.get('https://leetcode-api-pied.vercel.app/problems');
                let allProblems = response.data; // Response is directly an array

                // Fallback if API changes structure again
                if (allProblems.stat_status_pairs) allProblems = allProblems.stat_status_pairs;

                // Filter by Topic (Keyword heuristic) and Difficulty
                const roomTopic = rooms[roomId].topic || 'all';
                const roomDiff = rooms[roomId].difficulty || 'Medium';

                let filtered = allProblems.filter(p => {
                    const isPaid = p.paid_only === true;
                    if (isPaid) return false;

                    // API Difficulty: 1=Easy, 2=Medium, 3=Hard
                    let diffLevel = 2;
                    if (roomDiff === 'Easy') diffLevel = 1;
                    if (roomDiff === 'Hard') diffLevel = 3;

                    if (p.difficulty.level !== diffLevel) return false;

                    // Topic Filter
                    const title = p.title || (p.stat && p.stat.question__title) || "";
                    if (roomTopic === 'all') return true;
                    return title.toLowerCase().includes(roomTopic.toLowerCase());
                });

                if (filtered.length === 0) {
                    // Fallback: relax topic, keep difficulty
                    let diffLevel = 2;
                    if (roomDiff === 'Easy') diffLevel = 1;
                    if (roomDiff === 'Hard') diffLevel = 3;
                    filtered = allProblems.filter(p => p.difficulty.level === diffLevel && !p.paid_only);
                }

                // Absolute fallback
                if (filtered.length === 0) {
                    filtered = allProblems.filter(p => p.difficulty.level === 2 && !p.paid_only);
                }

                let randomProb = filtered[Math.floor(Math.random() * filtered.length)];

                // --- FALLBACK PROBLEMS (Offline/API Fail Mode) ---
                const FALLBACK_PROBLEMS = [
                    { id: 1, title: "Two Sum", slug: "two-sum", difficulty: { level: 1 } },
                    { id: 20, title: "Valid Parentheses", slug: "valid-parentheses", difficulty: { level: 1 } },
                    { id: 21, title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: { level: 1 } },
                    { id: 121, title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: { level: 1 } },
                    { id: 125, title: "Valid Palindrome", slug: "valid-palindrome", difficulty: { level: 1 } },
                    { id: 226, title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: { level: 1 } },
                    { id: 242, title: "Valid Anagram", slug: "valid-anagram", difficulty: { level: 1 } },
                    { id: 704, title: "Binary Search", slug: "binary-search", difficulty: { level: 1 } },
                    { id: 3, title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: { level: 2 } },
                    { id: 11, title: "Container With Most Water", slug: "container-with-most-water", difficulty: { level: 2 } },
                    { id: 15, title: "3Sum", slug: "3sum", difficulty: { level: 2 } },
                    { id: 19, title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list", difficulty: { level: 2 } },
                    { id: 33, title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: { level: 2 } },
                    { id: 49, title: "Group Anagrams", slug: "group-anagrams", difficulty: { level: 2 } },
                    { id: 53, title: "Maximum Subarray", slug: "maximum-subarray", difficulty: { level: 2 } },
                    { id: 56, title: "Merge Intervals", slug: "merge-intervals", difficulty: { level: 2 } },
                    { id: 98, title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", difficulty: { level: 2 } },
                    { id: 102, title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: { level: 2 } },
                    { id: 139, title: "Word Break", slug: "word-break", difficulty: { level: 2 } },
                    { id: 152, title: "Maximum Product Subarray", slug: "maximum-product-subarray", difficulty: { level: 2 } },
                    { id: 198, title: "House Robber", slug: "house-robber", difficulty: { level: 2 } },
                    { id: 200, title: "Number of Islands", slug: "number-of-islands", difficulty: { level: 2 } },
                    { id: 238, title: "Product of Array Except Self", slug: "product-of-array-except-self", difficulty: { level: 2 } },
                    { id: 300, title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", difficulty: { level: 2 } },
                    { id: 322, title: "Coin Change", slug: "coin-change", difficulty: { level: 2 } },
                    { id: 42, title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: { level: 3 } },
                    { id: 72, title: "Edit Distance", slug: "edit-distance", difficulty: { level: 3 } },
                    { id: 76, title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: { level: 3 } },
                    { id: 84, title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", difficulty: { level: 3 } },
                    { id: 124, title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum", difficulty: { level: 3 } },
                    { id: 239, title: "Sliding Window Maximum", slug: "sliding-window-maximum", difficulty: { level: 3 } },
                    { id: 295, title: "Find Median from Data Stream", slug: "find-median-from-data-stream", difficulty: { level: 3 } }
                ];

                // ... (inside socket logic)

                // ULTIMATE FALLBACK (If API fails, use local list)
                if (!randomProb) {
                    console.log("⚠️ API Failed! Using Offline Fallback Pool.");

                    // Filter fallback by difficulty if possible
                    let diffLevel = 2; // Default Medium
                    if (roomDiff === 'Easy') diffLevel = 1;
                    if (roomDiff === 'Hard') diffLevel = 3;

                    let localFiltered = FALLBACK_PROBLEMS.filter(p => p.difficulty.level === diffLevel);
                    if (localFiltered.length === 0) localFiltered = FALLBACK_PROBLEMS; // Fallback to all if none match

                    const pick = localFiltered[Math.floor(Math.random() * localFiltered.length)];

                    rooms[roomId].problem = {
                        id: pick.id,
                        title: pick.title,
                        slug: pick.slug
                    };
                } else {
                    console.log("Random Problem Selected:", JSON.stringify(randomProb, null, 2));

                    rooms[roomId].problem = {
                        id: randomProb.id || (randomProb.stat && randomProb.stat.question_id),
                        title: randomProb.title || (randomProb.stat && randomProb.stat.question__title),
                        slug: randomProb.title_slug || (randomProb.stat && randomProb.stat.question__title_slug)
                    };
                }

                console.log("Room Problem Set:", rooms[roomId].problem);

                rooms[roomId].status = 'active';
                io.to(roomId).emit('gameActive', rooms[roomId]);
            } catch (e) {
                console.error("Failed to fetch problem for room", e);
            }
        }
    });

    // SUBMIT SCORE / UPDATE
    socket.on('submitUpdate', ({ roomId, passedInfo }) => {
        // passedInfo = { passed: true/false, testcases: X/Y }
        const room = rooms[roomId];
        if (room) {
            const user = room.users.find(u => u.id === socket.id);
            if (user) {
                user.status = passedInfo.passed ? 'completed' : 'attempting';
                user.score = passedInfo.testcases; // Simplified score
                io.to(roomId).emit('roomUpdate', room);
            }
        }
    });

    // LEAVE ROOM (Manual Exit)
    socket.on('leaveRoom', ({ roomId }) => {
        handleLeave(socket.id, roomId);
    });

    // CHAT MESSAGE
    socket.on('chatMessage', ({ roomId, message, username }) => {
        const room = rooms[roomId];
        if (room) {
            if (!room.messages) room.messages = []; // Defensive Init
            const msgData = { username, message, timestamp: new Date().toISOString() };
            room.messages.push(msgData); // SAVE TO HISTORY
            // Broadcast to everyone
            io.to(roomId).emit('chatMessage', msgData);
        }
    });

    // VOICE SIGNALING (WebRTC)
    socket.on('voiceSignal', ({ roomId, signal, targetId }) => {
        // Relay signal to specific target
        io.to(targetId).emit('voiceSignal', { signal, senderId: socket.id });
    });

    // CALL / NUDGE REQUEST
    socket.on('callUser', ({ roomId }) => {
        roomId = String(roomId);
        console.log(`[CALL] User ${socket.id} called room ${roomId}`);
        // DEBUG: Using io.to to broadcast to EVERYONE (including sender) to verify signal flow
        io.to(roomId).emit('incomingCall', { from: socket.id });
    });

    // SYNC VOICE STATUS (Muted/Unmuted)
    socket.on('voiceStatus', ({ roomId, status }) => {
        socket.to(roomId).emit('voiceStatus', { userId: socket.id, status });
    });

    // --- TIMEOUT TRACKING ---
    const disconnectTimeouts = {}; // { socketId: timeoutRef }

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Find user in rooms and schedule removal
        for (const rId in rooms) {
            const room = rooms[rId];
            const user = room.users.find(u => u.id === socket.id);
            if (user) {
                // If game is active, give GRACE PERIOD
                if (room.status === 'active') {
                    console.log(`[DISCONNECT] User ${user.username} in active game. Starting grace period...`);

                    // Mark as offline in UI (optional enhancement later)
                    // Currently we just wait.

                    disconnectTimeouts[socket.id] = setTimeout(() => {
                        console.log(`[TIMEOUT] User ${user.username} grace period expired. Removed.`);
                        handleLeave(socket.id, rId);
                        delete disconnectTimeouts[socket.id];
                    }, 15000); // 15 Seconds Grace
                } else {
                    // If waiting (lobby), remove immediately
                    handleLeave(socket.id, rId);
                }
            }
        }
    });

    // REJOIN (Refresh Handler)
    socket.on('rejoinRoom', ({ roomId, username }) => {
        console.log(`[REJOIN] User ${socket.id} re-joining room ${roomId}`);

        // 1. CANCEL TIMEOUT (If existing for previous socket ID?)
        // The issue is: socket.id CHANGES on reconnect. We need to map username -> oldSocketId or just search by username.
        // Since we don't have oldSocketId easily, we search rooms for this username.

        if (!rooms[roomId]) {
            socket.emit('error', "Room expired or does not exist.");
            return;
        }

        const room = rooms[roomId];
        const user = room.users.find(u => u.username === username);

        if (user) {
            console.log(`[REJOIN] Found existing user ${user.username} with old ID ${user.id}`);

            // Cancel timeout for the OLD socket ID
            if (disconnectTimeouts[user.id]) {
                console.log(`[RECOVER] Cancelled timeout for ${user.username}`);
                clearTimeout(disconnectTimeouts[user.id]);
                delete disconnectTimeouts[user.id];
            }

            // Update with NEW socket ID
            user.id = socket.id;
            socket.join(roomId);

            // Helper: Send updated state
            socket.emit('roomUpdate', {
                roomId,
                users: room.users,
                problem: room.problem,
                status: room.status, // Ensure status is sent
                messages: room.messages
            });

            // Notify others that user is back (implied by room update, or expicit message)
            // io.to(roomId).emit('chatMessage', { username: "System", message: `${username} reconnected.`, timestamp: new Date().toISOString() });

        } else {
            // Edge case: Server restarted or user removed
            // Just treat as new join? Or error?
            // Re-adding causing duplicate users if logic flawed. For now, pushing new user.
            room.users.push({ id: socket.id, username, score: 0 });
            socket.join(roomId);
            socket.emit('roomUpdate', { roomId, ...room });
        }
    });

    // Helper to handle user removal & win condition
    const handleLeave = (socketId, roomId) => {
        const room = rooms[roomId];
        if (!room) return;

        const idx = room.users.findIndex(u => u.id === socketId);
        if (idx !== -1) {
            const leaverName = room.users[idx].username;
            room.users.splice(idx, 1);

            // Notify others (Room Update)
            io.to(roomId).emit('roomUpdate', room);

            // Win Condition: If game was active and now only 1 player remains
            if (room.status === 'active' && room.users.length === 1) {
                const winnerName = room.users[0].username;
                console.log(`[GAME] Winner: ${winnerName} (Opponent ${leaverName} left)`);
                io.to(roomId).emit('playerLeft', { winner: winnerName });
            }

            // Cleanup empty room
            if (room.users.length === 0) {
                delete rooms[roomId];
            }
        }
    };
});


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

        if (!auth_session || !auth_csrf) {
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
        if (!auth_session || !auth_csrf) {
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
        console.log("[POLL] Start: ", req.params.id);
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

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});