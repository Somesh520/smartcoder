# How to Run SmartCoder Locally

## Prerequisites
*   Node.js installed (v16+)
*   Chrome Browser

## 1. Start the Backend Server
Open a terminal:
```bash
cd backend
npm install
node server.js
```
The server will run on `http://localhost:3000`.

## 2. Start the Frontend Application
Open a **new** terminal (keep the backend running):
```bash
cd frontend
npm install
npm run dev
```
The app will open at `http://localhost:5173`.

## 3. Install the Chrome Extension
1.  Go to `chrome://extensions/` in Chrome.
2.  Enable **Developer Mode** (top right).
3.  Click **Load Unpacked**.
4.  Select the `leetcode-sync-ext` folder inside your project.
5.  Login to LeetCode and click **Sync** in the extension popup.

## 4. Play!
*   Create a room.
*   Share the Room ID with a friend (or open an Incognito tab to play against yourself).
*   Start coding!