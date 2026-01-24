import express from 'express';
import Note from '../models/Note.js';
import Task from '../models/Task.js';
import Event from '../models/Event.js';
// GoogleGenerativeAI replaced by LangChain

const router = express.Router();

// Middleware to ensure user is authenticated would be here (or passed from server.js)
// For now, assuming request logic handles user via req.user or passed userId.
// We'll rely on the main server to attach req.user via passport/middleware.

// --- Helper to getting user ID ---
// Assuming req.user._id is populated by passport
const getUserId = (req) => {
    return req.user ? req.user._id : req.body.userId;
};


// ==========================================
// NOTES ROUTES
// ==========================================

// Get all notes for a user
router.get('/notes', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const notes = await Note.find({ userId }).sort({ isPinned: -1, updatedAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new note
router.post('/notes', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const note = new Note({ ...req.body, userId });
        await note.save();
        res.status(201).json(note);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a note
router.put('/notes/:id', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, userId },
            req.body,
            { new: true }
        );
        if (!note) return res.status(404).json({ error: "Note not found" });
        res.json(note);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a note
router.delete('/notes/:id', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const note = await Note.findOneAndDelete({ _id: req.params.id, userId });
        if (!note) return res.status(404).json({ error: "Note not found" });
        res.json({ message: "Note deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// TASKS ROUTES
// ==========================================

router.get('/tasks', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const tasks = await Task.find({ userId }).sort({ deadline: 1, priority: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/tasks', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const task = new Task({ ...req.body, userId });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/tasks/:id', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId },
            req.body,
            { new: true }
        );
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/tasks/:id', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const task = await Task.findOneAndDelete({ _id: req.params.id, userId });
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// EVENTS ROUTES
// ==========================================

router.get('/events', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // Optional query for range, e.g. ?start=...&end=...
        const query = { userId };
        if (req.query.start && req.query.end) {
            query.startTime = { $gte: new Date(req.query.start) };
            query.endTime = { $lte: new Date(req.query.end) };
        }

        const events = await Event.find(query).sort({ startTime: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/events', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const event = new Event({ ...req.body, userId });
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/events/:id', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, userId },
            req.body,
            { new: true }
        );
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.json(event);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/events/:id', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const event = await Event.findOneAndDelete({ _id: req.params.id, userId });
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.json({ message: "Event deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




import axios from 'axios';

router.post('/assistant/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        let reply = "I'm your student assistant. I can help you manage your schedule and notes.";

        if (process.env.GEMINI_API_KEY) {
            try {
                // Direct REST API call to avoid library issues
                const API_KEY = process.env.GEMINI_API_KEY;
                const MODEL = "gemini-3-flash-preview";

                const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

                // Enrich context with actual user data
                const userId = getUserId(req);
                const [userNotes, userTasks, userEvents] = await Promise.all([
                    Note.find({ userId }).select('title content tags -_id').limit(5).lean(),
                    Task.find({ userId, status: { $ne: 'done' } }).select('title priority deadline -_id').limit(10).lean(),
                    Event.find({ userId, startTime: { $gte: new Date() } }).sort({ startTime: 1 }).select('title startTime type -_id').limit(5).lean()
                ]);

                const enrichedContext = {
                    ...context,
                    recentNotes: userNotes,
                    pendingTasks: userTasks,
                    upcomingEvents: userEvents
                };

                const systemPrompt = `You are a helpful student assistant for a CS student.
                
                REAL-TIME USER CONTEXT:
                - Notes: ${JSON.stringify(enrichedContext.recentNotes)}
                - Pending Tasks: ${JSON.stringify(enrichedContext.pendingTasks)}
                - Upcoming Events: ${JSON.stringify(enrichedContext.upcomingEvents)}
                - Frontend Context: ${JSON.stringify(context || {})}

                Use this context to answer questions specifically about the user's schedule, workload, and study materials.
                If asked about "my notes" or "my tasks", refer to the data above.
                Reply concisely and hepfully in formatted Markdown.`;

                const payload = {
                    contents: [{
                        parts: [
                            { text: systemPrompt },
                            { text: message }
                        ]
                    }]
                };

                const aiRes = await axios.post(url, payload);
                if (aiRes.data && aiRes.data.candidates && aiRes.data.candidates.length > 0) {
                    reply = aiRes.data.candidates[0].content.parts[0].text;
                } else {
                    console.error("AI: Unexpected response format", aiRes.data);
                    reply = "I'm not sure what to say. (Unexpected AI response)";
                }

            } catch (aiError) {
                // Axios error handling
                if (aiError.response) {
                    console.error("❌ AI Error Status:", aiError.response.status);
                    console.error("❌ AI Error Data:", JSON.stringify(aiError.response.data));

                    if (aiError.response.status === 403) {
                        reply = "My brain is currently resting (API Key Suspended/Invalid). Please check your key.";
                    } else if (aiError.response.status === 404) {
                        reply = "My brain is confused (Model Not Found).";
                    } else {
                        reply = "I'm having trouble connecting to my brain right now.";
                    }
                } else {
                    console.error("❌ AI Error (Network/Other):", aiError.message);
                    reply = "I'm having network trouble connecting to my brain.";
                }
            }
        } else {
            reply = "I'm not connected to the cloud right now (No API Key). But I'm listening!";
        }

        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
