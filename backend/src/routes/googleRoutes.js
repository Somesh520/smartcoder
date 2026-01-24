import express from 'express';
import axios from 'axios';
import User from '../models/User.js';

const router = express.Router();

router.get('/tasks', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || !user.googleAccessToken) {
            return res.status(401).json({ error: "Google Access Token missing. Please re-login with Google." });
        }

        const accessToken = user.googleAccessToken;

        // 1. Get Task Lists
        const listsResponse = await axios.get('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const taskLists = listsResponse.data.items;
        if (!taskLists || taskLists.length === 0) {
            return res.json([]);
        }


        const defaultListId = taskLists[0].id;

        const tasksResponse = await axios.get(`https://tasks.googleapis.com/tasks/v1/lists/${defaultListId}/tasks`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { showCompleted: false, maxResults: 20 }
        });

        const googleTasks = tasksResponse.data.items || [];

        // Format them to match our internal Task structure partially for frontend consistency
        const formattedTasks = googleTasks.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status === 'completed' ? 'done' : 'todo',
            deadline: t.due ? new Date(t.due) : null,
            source: 'google' // Tag to distinguish
        }));

        res.json(formattedTasks);

    } catch (error) {
        console.error("Google Tasks API Error:", error.response?.data || error.message);

        if (error.response?.status === 401) {
            // Token might be expired. logic to refresh would go here if we implemented googleRefreshToken usage.
            // For MVP, ask user to re-login.
            return res.status(401).json({ error: "Google Token Expired", code: "TOKEN_EXPIRED" });
        }

        res.status(500).json({ error: "Failed to fetch Google Tasks" });
    }
});

router.post('/tasks', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.googleAccessToken) {
            return res.status(401).json({ error: "Google Token missing" });
        }

        const { title, deadline, notes } = req.body;
        const accessToken = user.googleAccessToken;

        // 1. Get Task List ID (Default)
        const listsResponse = await axios.get('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const defaultListId = listsResponse.data.items?.[0]?.id;

        if (!defaultListId) return res.status(404).json({ error: "No Task List found" });

        // 2. Create Task
        const taskPayload = {
            title: title,
            notes: notes || "Created via SmartCoder",
            due: deadline ? new Date(deadline).toISOString() : undefined
        };

        const createResponse = await axios.post(`https://tasks.googleapis.com/tasks/v1/lists/${defaultListId}/tasks`, taskPayload, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log(createResponse.data);
        res.json(createResponse.data);

    } catch (error) {
        console.error("Google Create Task Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create Google Task" });
    }
});

router.delete('/calendar/:eventId', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.googleAccessToken) {
            return res.status(401).json({ error: "Google Token missing" });
        }

        const { eventId } = req.params;
        const accessToken = user.googleAccessToken;

        await axios.delete(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        res.json({ message: "Google Event deleted successfully" });

    } catch (error) {
        console.error("Google Calendar Delete Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to delete Google Event" });
    }
});

export default router;

router.delete('/tasks/:taskId', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.googleAccessToken) {
            return res.status(401).json({ error: "Google Token missing" });
        }

        const { taskId } = req.params;
        const accessToken = user.googleAccessToken;

        // 1. Get Task List ID (Default)
        const listsResponse = await axios.get('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const defaultListId = listsResponse.data.items?.[0]?.id;

        if (!defaultListId) return res.status(404).json({ error: "No Task List found" });

        // 2. Delete Task
        await axios.delete(`https://tasks.googleapis.com/tasks/v1/lists/${defaultListId}/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        res.json({ message: "Task deleted successfully" });

    } catch (error) {
        console.error("Google Delete Task Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to delete Google Task" });
    }
});

router.get('/calendar', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.googleAccessToken) {
            return res.status(401).json({ error: "Google Token missing" });
        }

        const accessToken = user.googleAccessToken;

        const response = await axios.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                timeMin: new Date().toISOString(),
                maxResults: 20,
                singleEvents: true,
                orderBy: 'startTime'
            }
        });

        const events = response.data.items.map(event => ({
            id: event.id,
            title: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            link: event.htmlLink,
            source: 'google'
        }));

        res.json(events);

    } catch (error) {
        console.error("Google Calendar API Error:", error.response?.data || error.message);
        if (error.response?.status === 401) return res.status(401).json({ error: "Token Expired", code: "TOKEN_EXPIRED" });
        res.status(500).json({ error: "Failed to fetch Calendar" });

    }
});

router.post('/calendar', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.googleAccessToken) {
            return res.status(401).json({ error: "Google Token missing" });
        }

        const { title, startTime, endTime, description } = req.body;
        const accessToken = user.googleAccessToken;

        const eventPayload = {
            summary: title,
            description: description || "Created via SmartCoder",
            start: { dateTime: new Date(startTime).toISOString() },
            end: { dateTime: new Date(endTime).toISOString() }
        };

        const response = await axios.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', eventPayload, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        res.json(response.data);

    } catch (error) {
        console.error("Google Calendar Create Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create Google Event" });
    }
});
