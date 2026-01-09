import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import Header from './components/Header';
import ProblemList from './components/ProblemList';
import Workspace from './components/Workspace';
import Lobby from './components/Lobby';
import CompetitionRoom from './components/CompetitionRoom';
import CompetitionRoomWrapper from './components/CompetitionRoomWrapper';
import ConnectLeetCode from './components/ConnectLeetCode';
import LandingPage from './components/LandingPage';
import HistoryPage from './components/HistoryPage';
import { fetchProblems } from './api';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const socket = io(API_URL, {
  transports: ['websocket'], // Force WebSocket only to avoid polling errors
  reconnectionRequests: 10,
  autoConnect: false,
});

socket.on("connect", () => {
  console.log("✅ Socket Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket Connection Error:", err);
});

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: 'white', textAlign: 'center', background: '#121212', height: '100vh' }}>
          <h1>Something went wrong.</h1>
          <p style={{ color: '#ef4444' }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ textAlign: 'left', background: '#333', padding: '20px', overflow: 'auto' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button
            onClick={() => window.location.href = '/app'}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#22c55e', border: 'none', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    const token = localStorage.getItem('auth_token');
    if (token) {
      setUserInfo({ loggedIn: true });
      navigate('/app');
    } else {
      setUserInfo({ loggedIn: false });
      showToast("Session not found! Please ensure you are logged in.", "error");
    }
  };

  const hasJoinedRef = React.useRef(false);

  // Error Modal State
  const [errorModal, setErrorModal] = useState({ show: false, message: '', redirectId: null });

  // 1. Socket Connection Effect (Global Listeners Only)
  useEffect(() => {
    // Note: We DO NOT connect here anymore. Connection is lazy-loaded in CompetitionRoomWrapper.

    const onConnect = () => {
      // console.log("✅ Socket Connected:", socket.id); 
    };

    const onError = (msg) => {
      console.error("Socket Error:", msg);

      // If we are already prompting to redirect, ignore subsequent generic errors
      // so the user doesn't lose the "Return to Battle" button.
      if (errorModal.redirectId) {
        return;
      }

      let errorMessage = "An unknown error occurred";
      let redirectId = null;

      if (typeof msg === 'string') {
        errorMessage = msg;
      } else if (msg && msg.type === 'EXISTING_SESSION') {
        // Structured Redirect Error
        errorMessage = msg.message;
        redirectId = msg.roomId;
      } else if (msg && msg.message) {
        errorMessage = msg.message;
      } else {
        errorMessage = JSON.stringify(msg);
      }

      setErrorModal({ show: true, message: errorMessage, redirectId });

      // If critical error (but NOT a redirectable session), reset state
      // We don't want to kick them out if we can redirect them!
      if (!redirectId && (errorMessage.includes("Authentication") || errorMessage.includes("already in an active battle"))) {
        sessionStorage.removeItem('active_room_id');
        sessionStorage.removeItem('active_username');
        setRoomId("");
        navigate('/app');
      }
    };

    socket.on('connect', onConnect);
    socket.on('error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('error', onError);
    };
  }, [navigate]);

  // 2. Data & Room State Effect
  useEffect(() => {
    // Check for token and fetch user details
    const token = localStorage.getItem('auth_token');
    if (token) {
      setUserInfo({ loggedIn: true });
      import('./api').then(api => {
        api.getCurrentUser().then(user => {
          if (user) setUserInfo({ loggedIn: true, ...user });
        }).catch(() => localStorage.removeItem('auth_token'));
      });
    }

    // Only load problems if not already loaded
    if (problems.length === 0) {
      loadProblems();
    }

    // Room Listeners
    const onRoomUpdate = (state) => {
      console.log("📥 App: Received roomUpdate:", state);
      setRoomState(state);
    };

    const onGameActive = (state) => {
      setRoomState(state);
    };

    const onSessionKilled = (data) => {
      showToast(data.message || "Session Ended", "success");
    };

    socket.on('roomUpdate', onRoomUpdate);
    socket.on('gameActive', onGameActive);
    socket.on('sessionKilled', onSessionKilled);

    return () => {
      socket.off('roomUpdate', onRoomUpdate);
      socket.off('gameActive', onGameActive);
      socket.off('sessionKilled', onSessionKilled);
    };
  }, [problems.length]); // Keep data dependencies here

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
    socket.emit('joinRoom', {
      roomId: rid,
      username: uname,
      userId: userInfo._id, // Pass MongoDB ID
      topic,
      difficulty: diff
    });
    navigate(`/app/competition/${rid}`);
  };

  return (
    <div className="app-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route path="/connect" element={<ConnectLeetCode onCheckConnection={checkLogin} />} />
        <Route path="/app/*" element={
          <>
            <Header
              onShowProblemList={() => navigate('/app/problems')}
              onGoDetail={() => navigate('/app')}
            />
            <Routes>
              {/* Onboarding / Sync Page */}
              <Route path="onboarding" element={<ConnectLeetCode onCheckConnection={() => window.location.reload()} />} />

              {/* Protected App Routes (Require Sync) */}
              <Route element={<RequireSync />}>
                <Route index element={<Lobby onJoin={joinRoom} onPracticeSolo={() => navigate('/app/problems')} userInfo={userInfo} />} />
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
                <Route path="history" element={<HistoryPage />} />
                <Route path="competition/:roomId" element={
                  <CompetitionRoomWrapper
                    socket={socket}
                    roomId={roomId}
                    username={username}
                    userInfo={userInfo}
                    roomState={roomState}
                    onBack={handleBackToLobby}
                    setRoomId={setRoomId}
                    setUsername={setUsername}
                  />
                } />
              </Route>
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

      {/* GLOBAL ERROR POPUP (Glassmorphism) */}
      {errorModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setErrorModal({ show: false, message: '' })}>

          <div style={{
            background: '#18181b',
            border: '1px solid #ef4444',
            padding: '40px',
            borderRadius: '24px',
            width: '420px',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
            transform: 'translateY(0)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>

            <div style={{
              width: '70px', height: '70px', background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>

            <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 800, color: 'white' }}>Action Blocked</h2>

            <p style={{ margin: '0 0 30px 0', color: '#a1a1aa', lineHeight: '1.6', fontSize: '16px' }}>
              {errorModal.message}
            </p>

            <button
              onClick={() => setErrorModal({ show: false, message: '', redirectId: null })}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '16px',
                width: '100%',
                borderRadius: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'transform 0.1s',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                marginTop: '12px'
              }}
              onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.target.style.transform = 'scale(1)'}
            >
              Dismiss
            </button>

            {errorModal.redirectId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <button
                  onClick={() => {
                    setErrorModal({ show: false, message: '', redirectId: null });
                    navigate(`/app/competition/${errorModal.redirectId}`);
                  }}
                  style={{
                    background: '#22c55e',
                    color: 'black',
                    border: 'none',
                    padding: '16px',
                    width: '100%',
                    borderRadius: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'transform 0.1s',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                  }}
                  onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
                  onMouseUp={e => e.target.style.transform = 'scale(1)'}
                >
                  Return to Battle ⚔️
                </button>

                <button
                  onClick={() => {
                    if (socket && socket.connected) {
                      socket.emit('killSession', { userId: userInfo._id });
                      // Optimistically close modal
                      setErrorModal({ show: false, message: '', redirectId: null });
                      showToast("Ending previous session...", "info");
                    }
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)', // Light red background
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '12px',
                    width: '100%',
                    borderRadius: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.25)'}
                  onMouseLeave={e => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
                >
                  End Old Session & Start New ⚠️
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper to enforce LeetCode Sync
function RequireSync() {
  const session = localStorage.getItem('user_session');
  // Check if session exists and is valid (simple check)
  const isSynced = session && session !== "undefined" && session.length > 10;

  if (!isSynced) {
    return <Navigate to="/app/onboarding" replace />;
  }
  return <Outlet />;
}

function App() {
  const [initialRoom, setInitialRoom] = useState(null);
  // Add state to track auth status, initialized from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('auth_token'));

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    const token = urlParams.get('token');

    if (token) {
      console.log("🔑 Token detected, saving to storage.");
      localStorage.setItem('auth_token', token);
      setIsAuthenticated(true); // Force re-render with auth true

      // Remove token from URL for cleaner look
      urlParams.delete('token');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, document.title, newUrl);
    }

    if (roomId) {
      console.log("🔗 Room share link detected:", roomId);
      setInitialRoom(roomId);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page (Redirect if Logged In) */}
        <Route path="/" element={
          initialRoom ? (
            <Navigate to={`/app?room=${initialRoom}`} replace />
          ) : isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <LandingPage />
          )
        } />    {/* Main App */}
        <Route path="/*" element={
          <ErrorBoundary>
            <MainApp initialRoom={initialRoom} />
          </ErrorBoundary>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
