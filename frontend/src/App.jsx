import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import ProblemList from './components/ProblemList';
import Workspace from './components/Workspace';
import Lobby from './components/Lobby';
import CompetitionRoom from './components/CompetitionRoom';
import CompetitionRoomWrapper from './components/CompetitionRoomWrapper';
import ConnectLeetCode from './components/ConnectLeetCode';
import LandingPage from './components/LandingPage';
import { fetchProblems } from './api';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const socket = io(API_URL, {
  transports: ['websocket', 'polling'],
  reconnectionRequests: 10,
});

socket.on("connect", () => {
  console.log("✅ Socket Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket Connection Error:", err);
});

// Main App Component (with Header and routing)
function MainApp({ initialRoom }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userInfo, setUserInfo] = useState({ loggedIn: false });
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [roomState, setRoomState] = useState(null);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const data = await fetchProblems();
      setProblems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const checkLogin = () => {
    const session = localStorage.getItem('user_session');
    if (session && session !== "undefined") {
      setUserInfo({ loggedIn: true });
      navigate('/app');
    } else {
      setUserInfo({ loggedIn: false });
      showToast("Session not found! Please ensure extension is synced.", "error");
    }
  };

  const hasJoinedRef = React.useRef(false);

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      setUserInfo({ loggedIn: true });
    }

    // Only load problems if not already loaded
    if (problems.length === 0) {
      loadProblems();
    }

    // Check for room share link (initialRoom from URL)
    // Check for room share link (initialRoom from URL)
    // REMOVED auto-join logic to prevent forced navigation.
    // 'initialRoom' is preserved in the URL parameter, and Lobby.jsx handles pre-filling.
    // This allows the user to see the Lobby and click "Join" manually.

    // Auto-Restore logic REMOVED due to persistent loop issues.
    // User must manually rejoin or use specific link.
    // This guarantees stability.

    /* REMOVED handleRejoin to prevent race conditions */

    if (socket.connected) {
      // No-op: Wait for Wrapper to join
    }

    socket.on('roomUpdate', (state) => {
      setRoomState(state);
    });

    socket.on('gameActive', (state) => {
      setRoomState(state);
    });

    socket.on('error', (msg) => {
      console.error("Socket Error:", msg);
      alert(msg);
      sessionStorage.removeItem('active_room_id');
      sessionStorage.removeItem('active_username');
      setRoomId("");
      navigate('/app');
    });

    return () => {
      /* REMOVED handleRejoin cleanup */
      socket.off('roomUpdate');
      socket.off('gameActive');
      socket.off('error');
    };
  }, [navigate, initialRoom, problems.length]); // Updated dependencies

  const handlePrompt = (problem) => {
    setCurrentProblem(problem);
    navigate(`/app/workspace/${problem.id}`);
  };

  const handleBack = () => {
    navigate('/app/problems');
    setCurrentProblem(null);
  };

  const handleBackToLobby = () => {
    try {
      if (roomId && socket.connected) {
        socket.emit('leaveRoom', { roomId });
      }
    } catch (e) {
      console.error("Leave Emit Failed:", e);
    }

    sessionStorage.removeItem('active_room_id');
    sessionStorage.removeItem('active_username');
    setRoomId("");
    navigate('/app/problems');
  };

  const joinRoom = (rid, uname, topic, diff) => {
    const session = localStorage.getItem('user_session');
    if (!session || session === "undefined") {
      navigate('/connect');
      return;
    }

    sessionStorage.setItem('active_room_id', rid);
    sessionStorage.setItem('active_username', uname);

    setRoomId(rid);
    setUsername(uname);
    socket.emit('joinRoom', { roomId: rid, username: uname, topic, difficulty: diff });
    navigate(`/app/competition/${rid}`);
  };

  return (
    <div className="app-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        {/* Connect LeetCode Page (no header) */}
        <Route path="/connect" element={<ConnectLeetCode onCheckConnection={checkLogin} />} />

        {/* Main App Routes (with header) */}
        <Route path="/app/*" element={
          <>
            <Header
              onShowProblemList={() => navigate('/app/problems')}
              onGoDetail={() => navigate('/app')}
            />
            <Routes>
              <Route index element={<Lobby onJoin={joinRoom} onPracticeSolo={() => navigate('/app/problems')} />} />
              <Route path="problems" element={
                <ProblemList
                  problems={problems}
                  loading={loading}
                  onRefresh={loadProblems}
                  onSelectProblem={handlePrompt}
                />
              } />
              <Route path="workspace/:problemId" element={
                currentProblem ? <Workspace problem={currentProblem} onBack={handleBack} /> : <Navigate to="/app/problems" />
              } />
              <Route path="competition/:roomId" element={
                <CompetitionRoomWrapper
                  socket={socket}
                  roomId={roomId}
                  username={username}
                  roomState={roomState}
                  onBack={handleBackToLobby}
                  setRoomId={setRoomId}
                  setUsername={setUsername}
                />
              } />
            </Routes>
          </>
        } />
      </Routes>

      {/* Global Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#22c55e',
          color: 'white', padding: '16px 24px', borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'slideIn 0.3s ease-out', fontWeight: 600, fontSize: '14px'
        }}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.message}
        </div>
      )}
    </div>
  );
}

function App() {
  const [initialRoom, setInitialRoom] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId) {
      console.log("🔗 Room share link detected:", roomId);
      setInitialRoom(roomId);
      // Removed URL cleanup to allow Lobby to read the param
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={
          initialRoom ? <Navigate to={`/app?room=${initialRoom}`} replace /> : <LandingPage />
        } />    {/* Main App */}
        <Route path="/*" element={<MainApp initialRoom={initialRoom} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
