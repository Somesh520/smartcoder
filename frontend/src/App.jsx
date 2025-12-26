import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProblemList from './components/ProblemList';
import Workspace from './components/Workspace';
import Lobby from './components/Lobby';
import CompetitionRoom from './components/CompetitionRoom';
import ConnectLeetCode from './components/ConnectLeetCode'; // Import Guide Page
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

function App() {
  const [view, setView] = useState('landing'); // Default to Landing Page
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userInfo, setUserInfo] = useState({ loggedIn: false });

  // Single Player State
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Multiplayer State
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

  const checkLogin = () => {
    const session = localStorage.getItem('user_session');
    if (session && session !== "undefined") {
      setUserInfo({ loggedIn: true });
      setView('lobby'); // Go to Lobby if logged in
      loadProblems();
    } else {
      setUserInfo({ loggedIn: false });
      alert("Session not found! Please ensure extension is synced.");
    }
  };

  useEffect(() => {
    // Check if logged in (from extension) but don't force redirect yet
    const session = localStorage.getItem('user_session');
    if (session) {
      setUserInfo({ loggedIn: true });
    }

    loadProblems();

    // 🔄 RECONNECT LOGIC: Check session storage for active room
    // If active room exists, bypass landing page
    const savedRoom = sessionStorage.getItem('active_room_id');
    const savedUser = sessionStorage.getItem('active_username');

    if (savedRoom && savedUser) {
      console.log("♻️ Found saved session, restoring room:", savedRoom);
      setRoomId(savedRoom);
      setUsername(savedUser);
      setView('competition');
    }

    const handleRejoin = () => {
      const r = sessionStorage.getItem('active_room_id');
      const u = sessionStorage.getItem('active_username');
      if (r && u) {
        console.log("🔄 Socket Connected/Re-joining:", r);
        socket.emit('rejoinRoom', { roomId: r, username: u });
      }
    };

    // Socket Listeners
    socket.on('connect', handleRejoin);

    // If already connected when mounting (e.g. hot reload), trigger manually
    if (socket.connected) {
      handleRejoin();
    }

    socket.on('roomUpdate', (state) => {
      setRoomState(state);
    });

    socket.on('gameActive', (state) => {
      setRoomState(state);
    });

    // Handle Global Errors (like Room Expired)
    socket.on('error', (msg) => {
      console.error("Socket Error:", msg);
      alert(msg);

      // Reset State -> Lobby (skip landing on error to allow quick retry)
      sessionStorage.removeItem('active_room_id');
      sessionStorage.removeItem('active_username');
      setRoomId("");
      setView('lobby');
    });

    return () => {
      socket.off('connect', handleRejoin);
      socket.off('roomUpdate');
      socket.off('gameActive');
      socket.off('error');
    };
  }, []); // Remove dependency on [roomId, username] to avoid loops, handle in connect

  const handlePrompt = (problem) => {
    setCurrentProblem(problem);
    setView('workspace');
  };

  const handleBack = () => {
    setView('list');
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

    // Clear Session
    sessionStorage.removeItem('active_room_id');
    sessionStorage.removeItem('active_username');

    // Force State Reset
    setRoomId("");
    setView('list');
  }

  const joinRoom = (rid, uname, topic, diff) => {
    const session = localStorage.getItem('user_session');
    if (!session || session === "undefined") {
      setView('connect');
      return;
    }

    // Save Session
    sessionStorage.setItem('active_room_id', rid);
    sessionStorage.setItem('active_username', uname);

    setRoomId(rid);
    setUsername(uname);
    socket.emit('joinRoom', { roomId: rid, username: uname, topic, difficulty: diff });
    setView('competition');
  };

  // If not connected, show the guide page
  if (view === 'connect') {
    return <ConnectLeetCode onCheckConnection={checkLogin} />;
  }

  // New Landing Page View
  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('lobby')} />;
  }

  return (
    <div className="app-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentView={view}
        onShowProblemList={() => setView('list')}
        onGoDetail={() => setView('lobby')}
      />

      {view === 'lobby' && (
        <Lobby onJoin={joinRoom} onPracticeSolo={() => setView('list')} />
      )}

      {view === 'list' && (
        <ProblemList
          problems={problems}
          loading={loading}
          onRefresh={loadProblems}
          onSelectProblem={handlePrompt}
        />
      )}

      {view === 'workspace' && currentProblem && (
        <Workspace problem={currentProblem} onBack={handleBack} />
      )}

      {view === 'competition' && (
        <CompetitionRoom
          socket={socket}
          roomId={roomId}
          username={username}
          roomState={roomState}
          onBack={handleBackToLobby}
        />
      )}
    </div>
  );
}

export default App;
