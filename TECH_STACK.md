# 🛠️ SmartCoder: Technical Architecture

Explore the modern technologies and architectural decisions that power the SmartCoder experience.

## 🚀 Frontend Stack
- **Framework**: [React.js](https://reactjs.org/) (Vite-powered for high-speed builds).
- **Styling**: Vanilla CSS with **Glassmorphism** utilities.
- **Icons**: [Lucide React](https://lucide.dev/) for consistent, minimalist iconography.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid UI transitions.
- **State Management**: React Hooks (`useState`, `useEffect`) and Context API.

## ⚙️ Backend Architecture
- **Runtime**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/).
- **Real-Time Engine**: [Socket.IO](https://socket.io/) for low-latency code synchronization and room management.
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM) for user data, payments, and match history.
- **Authentication**: JWT (JSON Web Tokens) with secure HTTP-only strategies.

## 🧩 Key Subsystems

### 🎮 Room Manager
A robust service layer that handles competitive room lifecycles:
- **`UserManager`**: Tracks unique socket connections and online status.
- **`RoomManager`**: Manages room creation, public/private visibility, and difficulty matchmaking.

### 🔌 LeetCode Integration
- **Authenticated Proxy**: Seamlessly fetches LeetCode metadata while bypassing CORS.
- **Multi-Source Fallback**: Uses official LeetCode APIs and internal fallbacks to ensure problem availability 24/7.
- **Smart Filtering**: Custom keyword-based topic search independently implemented on top of raw API results.

---
> [!NOTE]
> The platform is designed to be horizontally scalable, with Socket.IO rooms being handled in-memory for maximum speed.
