import Tester from '../models/Tester.js';
import axios from 'axios';

export const registerTester = async (req, res) => {
    try {
        console.log("[Tester] DEBUG: Controller started. Body:", JSON.stringify(req.body));
        const { username, email } = req.body;
        console.log("[Tester] DEBUG: Deconstructed fields:", { username, email });

        if (!username) {
            console.log("[Tester] ERROR: Missing username");
            return res.status(400).json({ success: false, message: "Username is missing in request." });
        }
        if (!email) {
            console.log("[Tester] ERROR: Missing email");
            return res.status(400).json({ success: false, message: "Email is missing in request." });
        }

        console.log("[Tester] DEBUG: Validation passed. Attempting MongoDB save...");
        const newTester = new Tester({ username, email });
        const savedTester = await newTester.save();
        console.log("[Tester] DEBUG: MongoDB save successful. ID:", savedTester._id);

        const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
        console.log("[Tester] DEBUG: Webhook URL configured:", !!webhookUrl);
        
        if (webhookUrl && webhookUrl !== 'YOUR_WEBHOOK_URL_HERE' && webhookUrl.startsWith('http')) {
            try {
                console.log("[Tester] DEBUG: Forwarding to webhook...");
                await axios.post(webhookUrl, { username, email });
                console.log(`[Tester] SUCCESS: Data forwarded to Google Sheets`);
            } catch (err) {
                console.error("[Tester] WARNING: Webhook forward failed:", err.message);
            }
        }

        console.log("[Tester] DEBUG: Sending successful response to client.");
        return res.status(201).json({ success: true, message: "Successfully registered as a tester!" });
    } catch (error) {
        console.error("[Tester] CRITICAL ERROR:", error);
        return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const getTesterStatus = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required to check status." });
        }

        const tester = await Tester.findOne({ email });
        return res.json({ 
            success: true, 
            isRegistered: !!tester 
        });
    } catch (error) {
        console.error("[Tester] Status Check Error:", error);
        return res.status(500).json({ success: false, message: "Server error checking tester status." });
    }
};
