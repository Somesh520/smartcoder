# Deployment Guide

Since this app uses **Socket.IO** (Real-time communication), you cannot deploy everything to Vercel/Netlify alone. Vercel is great for the Frontend, but the Backend needs a server that stays "awake".

## Recommended Stack (Free Tier)
1.  **Backend**: [Render.com](https://render.com) (Best for Node.js/Socket.IO)
2.  **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

---

## Part 1: Deploy Backend (Render)
1.  Push your code to GitHub.
2.  Go to **Render.com** -> New **Web Service**.
3.  Connect your GitHub repo: `Somesh520/smartcoder`.
4.  **Settings**:
    *   **Root Directory**: `backend` (IMPORTANT!)
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables**:
    *   Key: `CLIENT_URL`
    *   Value: `https://your-frontend-project.vercel.app` (You will get this in Part 2, for now put `*` or update later).
6.  Click **Deploy**.
    *   Copy your backend URL (e.g., `https://smartcoder-api.onrender.com`).

---

## Part 2: Deploy Frontend (Vercel)
1.  Go to **Vercel.com** -> **Add New Project**.
2.  Connect your GitHub repo: `Somesh520/smartcoder`.
3.  **Settings**:
    *   **Root Directory**: `frontend` (IMPORTANT!)
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Environment Variables** (Critical!):
    *   Key: `VITE_API_URL`
    *   Value: `https://your-backend-url.onrender.com` (The URL you copied from Step 1).
5.  Click **Deploy**.

---

## Part 3: Final Link
1.  Once Vercel gives you the live domain (e.g., `https://smartcoder-somesh.vercel.app`), go back to **Render Dashboard**.
2.  Update the `CLIENT_URL` variable to this real domain.
3.  Redeploy Backend.

**Done!** 🚀
