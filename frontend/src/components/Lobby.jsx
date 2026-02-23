import React, { useState } from 'react';
import { Users, Plus, Zap, Hash, Globe, Target, Code, Sword, ArrowRight } from 'lucide-react';
import ProblemAutocomplete from './ProblemAutocomplete';

const Lobby = ({ socket, onJoin, onPracticeSolo, userInfo }) => {
    const [mode, setMode] = useState('create'); // 'create' | 'join'

    // Joint State
    const [username, setUsername] = useState(`User_${Math.floor(Math.random() * 1000)}`);

    // Sync username with logged-in user info
    React.useEffect(() => {
        if (userInfo?.displayName) {
            setUsername(userInfo.displayName);
        }
    }, [userInfo]);

    // Create State
    const [topic, setTopic] = useState("all");
    const [difficulty, setDifficulty] = useState("Medium");
    const [isPublic, setIsPublic] = useState(true);
    const [specificProblem, setSpecificProblem] = useState("");

    // Join State
    const [joinRoomId, setJoinRoomId] = useState("");

    // Public Rooms State
    const [publicRooms, setPublicRooms] = useState([]);

    React.useEffect(() => {
        if (!socket) {
            console.log("Lobby: Socket not available yet.");
            return;
        }

        if (!socket.connected) {
            console.log("Lobby: Connecting socket...");
            socket.connect();
        }

        console.log("Lobby: Requesting public rooms...");
        // Request initial list
        socket.emit('getPublicRooms');

        const onRoomsUpdate = (rooms) => {
            console.log("Lobby: Received Public Rooms Update:", rooms);
            setPublicRooms(rooms);
        };

        const onConnect = () => {
            console.log("Lobby: Socket connected, refetching rooms...");
            socket.emit('getPublicRooms');
        };

        socket.on('publicRoomsUpdate', onRoomsUpdate);
        socket.on('connect', onConnect);

        return () => {
            socket.off('publicRoomsUpdate', onRoomsUpdate);
            socket.off('connect', onConnect);
        };
    }, [socket]);

    const handleCreate = () => {
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        // Extract slug from URL if pasted, otherwise use as is
        let problemSlug = specificProblem.trim();
        if (problemSlug.includes('/problems/')) {
            const match = problemSlug.match(/\/problems\/([^/]+)/);
            if (match) problemSlug = match[1];
        }

        onJoin(newRoomId, username, topic, difficulty, isPublic, problemSlug);
    };

    const handleJoin = () => {
        if (!joinRoomId) return;
        onJoin(joinRoomId.toUpperCase(), username, null, null); // Join generic
    };

    const handleJoinPublic = (roomId) => {
        setJoinRoomId(roomId);
        onJoin(roomId, username, null, null);
    };

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');
        if (roomParam) {
            setMode('join');
            setJoinRoomId(roomParam);
        }
    }, []);

    const [showLoginModal, setShowLoginModal] = useState(false);

    const checkAuth = (action) => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        action();
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', gap: '40px' }}>
            {/* Background Glow (Only in Dark Mode) */}
            <div style={{
                position: 'absolute', width: '600px', height: '600px',
                background: 'radial-gradient(circle, var(--dot-color) 0%, transparent 70%)',
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none',
                opacity: 0.5
            }} />

            <div className="neo-card animate-scale-in" style={{
                width: '100%', maxWidth: '480px',
                padding: '0', borderRadius: '0',
                background: 'var(--bg-card)',
                border: 'var(--border-main)',
                overflow: 'hidden', zIndex: 1
            }}>
                {/* Header Section */}
                <div style={{ padding: '40px 40px 30px', textAlign: 'center', borderBottom: 'var(--border-main)', background: 'var(--bg-main)', opacity: 0.9 }}>
                    <div style={{ display: 'inline-flex', padding: '4px', background: 'var(--bg-card)', border: 'var(--border-main)', marginBottom: '25px' }}>
                        <button
                            onClick={() => setMode('create')}
                            style={{
                                padding: '8px 24px', fontSize: '13px', fontWeight: 700,
                                background: mode === 'create' ? 'var(--accent)' : 'transparent',
                                color: mode === 'create' ? 'black' : 'var(--text-muted)',
                                border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
                                textTransform: 'uppercase'
                            }}
                        >
                            CREATE_LOBBY
                        </button>
                        <button
                            onClick={() => setMode('join')}
                            style={{
                                padding: '8px 24px', fontSize: '13px', fontWeight: 700,
                                background: mode === 'join' ? '#3b82f6' : 'transparent',
                                color: mode === 'join' ? 'white' : 'var(--text-muted)',
                                border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
                                textTransform: 'uppercase'
                            }}
                        >
                            JOIN_LOBBY
                        </button>
                    </div>

                    <h1 style={{
                        fontSize: '32px', fontWeight: 950, margin: '0 0 10px 0',
                        color: 'var(--text-main)',
                        textTransform: 'uppercase',
                        letterSpacing: '-1px', display: 'inline-block'
                    }}>
                        {mode === 'create' ? 'HOST_BATTLE' : 'ENTER_ARENA'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', fontWeight: 700 }}>
                        {mode === 'create' ? 'CONFIGURE SETTINGS AND INVITE A FRIEND.' : 'PASTE A ROOM CODE OR JOIN A PUBLIC GAME.'}
                    </p>
                </div>

                {/* Form Section */}
                <div style={{ padding: '30px 40px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Username Input */}
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}><Users size={14} /> USERNAME</label>
                        <input
                            placeholder="Enter your gamertag..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {mode === 'create' ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}><Hash size={14} /> TOPIC</label>
                                    <div style={{ position: 'relative' }}>
                                        <select value={topic} onChange={e => setTopic(e.target.value)} style={selectStyle}>
                                            <option value="all">Random</option>
                                            <option value="array">Arrays</option>
                                            <option value="string">Strings</option>
                                            <option value="tree">Trees</option>
                                            <option value="dynamic">DP</option>
                                        </select>
                                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#71717a' }}>▼</div>
                                    </div>
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}><Target size={14} /> DIFFICULTY</label>
                                    <div style={{ position: 'relative' }}>
                                        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={selectStyle}>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#71717a' }}>▼</div>
                                    </div>
                                </div>
                            </div>

                            {/* Specific Problem Input */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}><Code size={14} /> CUSTOM PROBLEM (OPTIONAL)</label>
                                <ProblemAutocomplete
                                    onSelect={(slug) => setSpecificProblem(slug)}
                                    initialValue={specificProblem}
                                />
                                <div style={{ fontSize: '11px', color: '#71717a', marginTop: '4px' }}>
                                    Search by name. Leave empty to use AI Random Picker.
                                </div>
                            </div>

                            {/* Public/Private Toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={isPublic}
                                    onChange={e => setIsPublic(e.target.checked)}
                                    style={{ accentColor: 'var(--accent-green)', width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <label htmlFor="isPublic" style={{ color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                                    Make Room Public (Visible to others)
                                </label>
                            </div>
                        </>
                    ) : (
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}><Code size={14} /> ROOM CODE</label>
                            <input
                                placeholder="e.g. X9Y2Z1"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)}
                                style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase', color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.3)' }}
                            />
                        </div>
                    )}

                    <div style={{ marginTop: '10px' }}>
                        <button
                            onClick={() => checkAuth(mode === 'create' ? handleCreate : handleJoin)}
                            className="neo-btn"
                            style={{
                                width: '100%', padding: '16px', fontSize: '16px', fontWeight: 900,
                                justifyContent: 'center', gap: '10px',
                                background: mode === 'create' ? 'var(--accent)' : '#3b82f6',
                                color: mode === 'create' ? 'black' : 'white',
                                border: 'var(--border-main)',
                            }}
                        >
                            {mode === 'create' ? <><Sword size={18} /> LAUNCH_BATTLE</> : <><Zap size={18} /> JOIN_NOW</>}
                        </button>

                        <button
                            onClick={() => checkAuth(onPracticeSolo)}
                            style={{
                                width: '100%', marginTop: '12px', padding: '14px', background: 'transparent',
                                border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '14px',
                                color: '#a1a1aa', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = 'white'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#a1a1aa'; }}
                        >
                            No friend? Practice Solo <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* PUBLIC ROOMS LIST */}
            <div style={{ width: '100%', maxWidth: '700px', zIndex: 1 }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 900, textTransform: 'uppercase' }}>
                    <Globe size={18} color="var(--accent)" /> LIVE_BATTLES
                </h3>

                {publicRooms.length === 0 ? (
                    <div style={{
                        padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
                        border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', color: 'var(--text-muted)'
                    }}>
                        No active public rooms. Be the first to host one! 🚀
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                        {publicRooms.map(room => (
                            <div key={room.id} className="neo-card" style={{
                                padding: '20px', background: 'var(--bg-card)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                cursor: 'pointer'
                            }}
                                onClick={() => checkAuth(() => handleJoinPublic(room.id))}
                            >
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase' }}>
                                        {room.difficulty} • {room.topic === 'all' ? 'Random' : room.topic.toUpperCase()}
                                    </div>
                                    <div style={{ color: 'var(--text-main)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase' }}>
                                        {room.host}'s Lobby
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px', fontWeight: 700 }}>
                                        WAITING_FOR_OPPONENT...
                                    </div>
                                </div>
                                <button className="neo-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>
                                    JOIN
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {/* LOGIN POPUP MODAL */}
            {showLoginModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowLoginModal(false)}>

                    <div className="neo-card" style={{
                        background: 'var(--bg-card)',
                        padding: '40px',
                        width: '400px',
                        textAlign: 'center',
                        position: 'relative',
                    }} onClick={e => e.stopPropagation()}>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                width: '60px', height: '60px', background: 'var(--accent)',
                                border: 'var(--border-main)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Sword size={32} color="black" />
                            </div>
                            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 950, textTransform: 'uppercase', color: 'var(--text-main)' }}>AUTH_REQUIRED</h2>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '700', lineHeight: '1.5' }}>
                                YOU MUST SIGN IN TO HOST OR JOIN BATTLES.
                            </p>
                        </div>

                        <button
                            onClick={async () => {
                                const { BASE_URL } = await import('../api');
                                window.location.href = `${BASE_URL}/auth/google`;
                            }}
                            className="neo-btn"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            LOGIN WITH GOOGLE
                        </button>

                        <button
                            onClick={() => setShowLoginModal(false)}
                            style={{
                                marginTop: '15px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 800,
                                textDecoration: 'underline'
                            }}
                        >
                            CANCEL
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const inputGroupStyle = {
    display: 'flex', flexDirection: 'column', gap: '8px'
};

const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 900,
    color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase'
};

const inputStyle = {
    width: '100%', padding: '14px 16px', background: 'var(--bg-main)',
    border: 'var(--border-main)', borderRadius: '0',
    color: 'var(--text-main)', fontSize: '15px', outline: 'none', transition: 'all 0.2s',
    fontWeight: 700
};

const selectStyle = {
    ...inputStyle, appearance: 'none', cursor: 'pointer'
};

export default Lobby;
