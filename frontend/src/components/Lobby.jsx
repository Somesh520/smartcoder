import React, { useState } from 'react';
import { Users, Plus, Zap, Hash, Globe, Target, Code, Sword, ArrowRight } from 'lucide-react';

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
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        onJoin(newRoomId, username, topic, difficulty);
    };

    const handleJoin = () => {
        if (!joinRoomId) return;
        onJoin(joinRoomId.toUpperCase(), username, null, null);
    };

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');
        if (roomParam) {
            setMode('join');
            setJoinRoomId(roomParam);
        }
    }, []);

    return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>
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
                        background: mode === 'create' ? 'linear-gradient(135deg, #fff 0%, #4ade80 100%)' : 'linear-gradient(135deg, #fff 0%, #60a5fa 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        letterSpacing: '-1px'
                    }}>
                        {mode === 'create' ? 'Host a Battle' : 'Enter the Arena'}
                    </h1>
                    <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.5' }}>
                        {mode === 'create' ? 'Configure settings and invite a friend.' : 'Paste your room code below to connect.'}
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
                            onClick={mode === 'create' ? handleCreate : handleJoin}
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
                            onClick={onPracticeSolo}
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
