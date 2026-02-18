import * as leetcodeService from '../services/leetcodeService.js';

export const getProblems = async (req, res) => {
    try {
        const data = await leetcodeService.fetchProblems();
        res.set('Cache-Control', 'public, max-age=3600'); // Browser Cache for 1 hour
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Fetch Failed" });
    }
};

export const getProblemDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await leetcodeService.fetchProblemDetails(id);
        res.set('Cache-Control', 'public, max-age=86400'); // Browser Cache for 24 hours
        res.json(data);
    } catch (error) {
        console.error("Problem Detail Error:", error.message);
        res.status(500).json({ error: error.message || "Server Error" });
    }
};

export const runController = async (req, res) => {
    try {
        const { auth_session, auth_csrf } = req.body;
        if (!auth_session || !auth_csrf) {
            return res.status(401).json({ error: "Missing Auth! Please verify extension is working." });
        }
        const data = await leetcodeService.runCode(req.body);
        res.json(data);
    } catch (error) {
        console.error("[RUN] Error:", error.message);
        const status = error.response ? error.response.status : 500;
        const msg = error.response?.data?.error || error.message || "Run Request Failed";
        res.status(status).json({ error: msg });
    }
};

export const submitController = async (req, res) => {
    try {
        const { auth_session, auth_csrf } = req.body;
        if (!auth_session || !auth_csrf) {
            return res.status(401).json({ error: "Auth missing in request body" });
        }
        const data = await leetcodeService.submitCode(req.body);
        res.json(data);
    } catch (error) {
        console.error("[SUBMIT] Error:", error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: error.message || "No response from LeetCode server" });
        }
    }
};

export const pollController = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await leetcodeService.checkSubmission(id, req.body);
        res.json(data);
    } catch (error) {
        console.error("Poll Error:", error.message);
        res.status(500).json({ error: "Polling Failed" });
    }
};
