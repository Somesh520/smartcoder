import React, { useState } from 'react';
import { Users, Plus, Zap } from 'lucide-react';

const Lobby = ({ onJoin, onPracticeSolo }) => {
    const [mode, setMode] = useState('create'); // 'create' | 'join'

    // Joint State
    const [username, setUsername] = useState(`User_${Math.floor(Math.random() * 1000)}`);

    // Create State
    const [topic, setTopic] = useState("all");
    const [difficulty, setDifficulty] = useState("Medium");

    // Join State
    const [joinRoomId, setJoinRoomId] = useState("");

    const handleCreate = () => {
        // Generate Unique 6 digit ID
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        onJoin(newRoomId, username, topic, difficulty);
    };

    const handleJoin = () => {
        if (!joinRoomId) return;
        onJoin(joinRoomId.toUpperCase(), username, null, null);
    };

    // Auto-detect Room ID from URL
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');
        if (roomParam) {
            setMode('join');
            setJoinRoomId(roomParam);
        }
    }, []);

    return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel animate-scale-in" style={{
                width: '100%', maxWidth: '440px',
                padding: '40px', borderRadius: '24px',
                boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 10px 0', color: 'white', letterSpacing: '-1px' }}>
                        {mode === 'create' ? 'Create Lobby' : 'Join Lobby'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                        {mode === 'create' ? 'Configure your battle settings.' : 'Enter a room code to spectate or play.'}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <label style={labelStyle}>USERNAME</label>
                        <input
                            placeholder="Enter your gamertag..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {mode === 'create' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>TOPIC</label>
                                <select value={topic} onChange={e => setTopic(e.target.value)} style={inputStyle}>
                                    <option value="all">Random</option>
                                    <option value="array">Arrays</option>
                                    <option value="string">Strings</option>
                                    <option value="tree">Trees</option>
                                    <option value="dynamic">DP</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>DIFFICULTY</label>
                                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={inputStyle}>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label style={labelStyle}>ROOM ID</label>
                            <input
                                placeholder="e.g. X9Y2Z1"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)}
                                style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase' }}
                            />
                        </div>
                    )}

                    <button
                        onClick={mode === 'create' ? handleCreate : handleJoin}
                        className="btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '10px' }}
                    >
                        {mode === 'create' ? 'Launch Room' : 'Join Now'}
                    </button>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button
                            onClick={() => setMode(mode === 'create' ? 'join' : 'create')}
                            style={{ flex: 1, padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                        >
                            {mode === 'create' ? 'Join Instead' : 'Create Instead'}
                        </button>
                        <button
                            onClick={onPracticeSolo}
                            style={{ flex: 1, padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                        >
                            Practice Solo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-secondary)', letterSpacing: '0.5px'
};

const inputStyle = {
    width: '100%', padding: '14px', background: 'var(--bg-body)',
    border: '1px solid var(--border-subtle)', borderRadius: '12px',
    color: 'white', fontSize: '15px', outline: 'none', transition: 'border 0.2s'
};

export default Lobby;
