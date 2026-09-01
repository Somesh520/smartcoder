import axios from 'axios'
import User from '../models/User.js'
export const githubuser = async (req, res) => {
    const token = req.user?.githubAccessToken || req.cookies.github_token;
    try {

        if (!token) {
            return res.status(400).json({ error: "Token not found" });
        }

        const url = `https://api.github.com/user`

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
            }
        })

        res.json({ data: response.data })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch GitHub user data" });
    }

}
export const githubrepo = async (req, res) => {
    const token = req.user?.githubAccessToken || req.cookies.github_token;
    try {

        if (!token) {
            return res.status(400).json({ error: "Token not found" });
        }

        const url = `https://api.github.com/user/repos`

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
            }
        })

        res.json({ data: response.data })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch GitHub user data" });
    }

}


export const saveDsaRepo = async (req, res) => {
    try {
        const { githubUsername, githubDsaRepo } = req.body;

        if (!githubUsername || !githubDsaRepo) {
            return res.status(400).json({ error: "Username and repo name are required" });
        }
        const userId = req.user?.userId || req.user?._id;

        const dbUser = await User.findById(userId);
        if (!dbUser) {
            return res.status(404).json({ error: "User not found" });
        }

        dbUser.githubUsername = githubUsername;
        dbUser.githubDsaRepo = githubDsaRepo;
        await dbUser.save();

        res.json({ message: "DSA Repo saved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save DSA Repo" });
    }
}

export const removedsarepo = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?._id;

        const dbUser = await User.findById(userId);
        if (!dbUser) {
            return res.status(404).json({ error: "User not found" });
        }

        dbUser.githubUsername = "";
        dbUser.githubDsaRepo = "";
        await dbUser.save();

        res.json({ message: "DSA Repo removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to remove DSA Repo" });
    }
}

export const commitToGithub = async (req, res) => {
    try {
        console.log
        const { owner, repo, path, code, message, question_detail } = req.body;

        const token = req.user?.githubAccessToken || req.cookies.github_token;

        let sha;


        try {
            const existingFile = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/vnd.github+json",
                    },
                }
            );

            sha = existingFile.data.sha;

        } catch (err) {
            // 404 means file doesn't exist, so we'll create it.
            if (err.response?.status !== 404) {
                throw err;
            }
        }

        const payload = {
            message,
            content: Buffer.from(code).toString("base64"),
        };

        if (sha) {
            payload.sha = sha;
        }

        const response = await axios.put(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github+json",
                },
            }
        );

        if (question_detail && typeof question_detail === 'object') {
            try {
                const dirPath = path.substring(0, path.lastIndexOf('/'));
                if (dirPath) {
                    const readmePath = `${dirPath}/README.md`;
                    let readmeSha;



                    const title = question_detail.title || "Problem";
                    const difficulty = question_detail.difficulty || "Medium";
                    const contentHtml = question_detail.content || question_detail.questionHtml || "";

                    const readmeContent = `<h2><a href="https://leetcode.com/problems/${question_detail.titleSlug || question_detail.slug}/">${title}</a></h2><h3>Difficulty: ${difficulty}</h3><hr>\n\n${contentHtml}`;

                    const readmePayload = {
                        message: `Add problem description for ${title}`,
                        content: Buffer.from(readmeContent).toString("base64")
                    };
                    if (readmeSha) readmePayload.sha = readmeSha;

                    await axios.put(
                        `https://api.github.com/repos/${owner}/${repo}/contents/${readmePath}`,
                        readmePayload,
                        { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
                    );
                }
            } catch (err) {
                console.error("Failed to save README.md to GitHub:", err.message);
            }
        }

        return res.status(200).json({
            success: true,
            commit: response.data.commit,
        });

    } catch (error) {
        console.error(error.response?.data || error);

        return res.status(500).json({
            success: false,
            message: "Failed to commit file",
        });
    }
};
export const disconnectGithub = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?._id;
        const dbUser = await User.findById(userId);
        if (dbUser) {
            dbUser.githubAccessToken = "";
            dbUser.githubUsername = "";
            dbUser.githubDsaRepo = "";
            await dbUser.save();
        }
        res.clearCookie("github_token", {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        });
        res.json({ message: "GitHub disconnected successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to disconnect GitHub" });
    }
}
