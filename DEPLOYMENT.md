# 🌐 SmartCoder: Deployment Guide

Deploying SmartCoder requires a server that supports persistent connections for **Socket.IO**. Use this guide to launch your platform in minutes.

---

## 🛠️ Recommended Stack (Free Tier)
1.  **Backend**: [Render.com](https://render.com) (Persistent Node.js + Socket.IO Support).
2.  **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com).

---

## 🏗️ Phase 1: Deploy Backend (Render)
1.  Push your code to GitHub.
2.  Go to **Render.com** -> New **Web Service**.
3.  Connect your repo: `Somesh520/smartcoder`.
4.  **Configuration**:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables**:
    *   Key: `CLIENT_URL`
    *   Value: `https://your-frontend-project.vercel.app` (Update this later).
6.  Click **Deploy** and copy your backend URL (e.g., `https://smartcoder-api.onrender.com`).

---

## 💻 Phase 2: Deploy Frontend (Vercel)
1.  Go to **Vercel.com** -> **Add New Project**.
2.  Connect your repo: `Somesh520/smartcoder`.
3.  **Settings**:
    *   **Root Directory**: `frontend`
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: `https://your-backend-url.onrender.com` (From Phase 1).
5.  Click **Deploy**.

---

## 🔗 Phase 3: Final Linkage
1.  Once Vercel gives you the live domain, go back to the **Render Dashboard**.
2.  Update the `CLIENT_URL` variable with your real Vercel domain.
3.  Perform a manual redeploy on Render.

---
> [!IMPORTANT]
> **Root Directory** settings are critical for monorepo structures like this one. Ensure `backend/` and `frontend/` are correctly targeted.

> [!TIP]
> Use [MongoDB Atlas](https://www.mongodb.com/atlas) for a free, reliable managed database.
