import React, { useState } from 'react';
import { Users, Plus, Zap, Hash, Globe, Target, Code, Sword, ArrowRight } from 'lucide-react';

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
        onJoin(newRoomId, username, topic, difficulty, isPublic);
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
            {/* Background Glow */}
            <div style={{
                position: 'absolute', width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(0,0,0,0) 70%)',
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none'
            }} />

            <div className="glass-panel animate-scale-in" style={{
                width: '100%', maxWidth: '480px',
                padding: '0', borderRadius: '24px',
                background: 'rgba(20, 20, 25, 0.75)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden', zIndex: 1
            }}>
                {/* Header Section */}
                <div style={{ padding: '40px 40px 30px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'inline-flex', padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '25px' }}>
                        <button
                            onClick={() => setMode('create')}
                            style={{
                                padding: '8px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                                background: mode === 'create' ? 'var(--accent-green)' : 'transparent',
                                color: mode === 'create' ? 'black' : '#a1a1aa',
                                border: 'none', cursor: 'pointer', transition: 'all 0.3s ease'
                            }}
                        >
                            Create Lobby
                        </button>
                        <button
                            onClick={() => setMode('join')}
                            style={{
                                padding: '8px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                                background: mode === 'join' ? '#3b82f6' : 'transparent',
                                color: mode === 'join' ? 'white' : '#a1a1aa',
                                border: 'none', cursor: 'pointer', transition: 'all 0.3s ease'
                            }}
                        >
                            Join Lobby
                        </button>
                    </div>

                    <h1 style={{
                        fontSize: '32px', fontWeight: 800, margin: '0 0 10px 0',
                        backgroundImage: mode === 'create' ? 'linear-gradient(135deg, #fff 0%, #4ade80 100%)' : 'linear-gradient(135deg, #fff 0%, #60a5fa 100%)',
                        backgroundClip: 'text', WebkitBackgroundClip: 'text',
                        color: 'transparent', WebkitTextFillColor: 'transparent',
                        letterSpacing: '-1px', display: 'inline-block'
                    }}>
                        {mode === 'create' ? 'Host a Battle' : 'Enter the Arena'}
                    </h1>
                    <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.5' }}>
                        {mode === 'create' ? 'Configure settings and invite a friend.' : 'Paste a room code or join a public game.'}
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
                            className={mode === 'create' ? "btn-primary" : "btn-blue"} // Assuming btn-blue exists or fallback
                            style={{
                                width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700, borderRadius: '14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                background: mode === 'create' ? 'var(--accent-green)' : '#3b82f6', color: mode === 'create' ? 'black' : 'white', border: 'none', cursor: 'pointer',
                                boxShadow: mode === 'create' ? '0 0 20px rgba(74, 222, 128, 0.4)' : '0 0 20px rgba(59, 130, 246, 0.4)',
                                transition: 'transform 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {mode === 'create' ? <><Sword size={18} /> Launch Battle</> : <><Zap size={18} /> Join Now</>}
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
                <h3 style={{ color: 'white', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Globe size={18} color="#4ade80" /> Live Public Battles
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
                            <div key={room.id} className="glass-panel" style={{
                                padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                transition: 'transform 0.2s', cursor: 'pointer'
                            }}
                                onClick={() => checkAuth(() => handleJoinPublic(room.id))}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div>
                                    <div style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 700, marginBottom: '4px' }}>
                                        {room.difficulty} • {room.topic === 'all' ? 'Random' : room.topic.toUpperCase()}
                                    </div>
                                    <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>
                                        {room.host}'s Lobby
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>
                                        Waiting for opponent...
                                    </div>
                                </div>
                                <button style={{
                                    background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)',
                                    padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer'
                                }}>
                                    Join
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

                    <div style={{
                        background: 'rgba(20, 20, 20, 0.9)',
                        border: '1px solid var(--border-subtle)',
                        padding: '40px',
                        borderRadius: '20px',
                        width: '400px',
                        textAlign: 'center',
                        position: 'relative',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }} onClick={e => e.stopPropagation()}>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                width: '60px', height: '60px', background: 'rgba(74, 222, 128, 0.1)',
                                borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Sword size={32} color="#4ade80" />
                            </div>
                            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 800 }}>Authentication Required</h2>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                You must sign in to Host a Battle, Join specific Rooms, or Practice Solo.
                            </p>
                        </div>

                        {/* Login logic now handled by Header/App via API URL, but here explicit link is fine/safe if matches Header */}
                        {/* Ideally reuse Header's logic but direct link is acceptable here as fallback */}
                        {/* Actually, let's use the same logic as Header if possible, or just the hardcoded relative path 
                            which we know works because we fixed the Header one to use absolute path.
                            Wait, Header uses absolute URL. Here we should likely use the same.
                         */}
                        <button
                            onClick={async () => {
                                const { BASE_URL } = await import('../api');
                                window.location.href = `${BASE_URL}/auth/google`;
                            }}
                            style={{
                                background: 'var(--accent-green)',
                                color: 'black',
                                border: 'none',
                                padding: '14px',
                                width: '100%',
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '16px',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
                            onMouseUp={e => e.target.style.transform = 'scale(1)'}
                        >
                            Login with Google
                        </button>

                        <button
                            onClick={() => setShowLoginModal(false)}
                            style={{
                                marginTop: '15px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Cancel
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
    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800,
    color: '#71717a', letterSpacing: '0.8px', textTransform: 'uppercase'
};

const inputStyle = {
    width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
    color: 'white', fontSize: '15px', outline: 'none', transition: 'all 0.2s',
    fontWeight: 500
};

const selectStyle = {
    ...inputStyle, appearance: 'none', cursor: 'pointer'
};

export default Lobby;
