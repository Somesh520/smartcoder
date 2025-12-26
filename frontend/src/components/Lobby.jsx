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
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)' }}>
            <div style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '16px',
                padding: '0',
                width: '420px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden'
            }}>
                {/* Header Section */}
                <div style={{ padding: '30px 30px 20px 30px', textAlign: 'center', borderBottom: '1px solid #27272a', background: '#202024' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(to right, #4ade80, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-0.5px' }}>
                        Code Battle ⚔️
                    </h1>
                    <p style={{ color: '#71717a', fontSize: '13px', marginTop: '5px' }}>Multiplayer Competitive Coding</p>

                    {/* TABS */}
                    <div style={{ display: 'flex', background: '#121214', padding: '4px', borderRadius: '8px', marginTop: '20px' }}>
                        <button
                            onClick={() => setMode('create')}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: mode === 'create' ? '#27272a' : 'transparent', color: mode === 'create' ? 'white' : '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
                        >
                            Create Room
                        </button>
                        <button
                            onClick={() => setMode('join')}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: mode === 'join' ? '#27272a' : 'transparent', color: mode === 'join' ? 'white' : '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
                        >
                            Join Room
                        </button>
                    </div>
                </div>

                <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* USERNAME INPUT (Common) */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>YOUR ALIAS</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '12px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                            placeholder="Enter username"
                        />
                    </div>

                    {mode === 'create' ? (
                        <>
                            {/* CREATE MODE: Topic & Difficulty */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '6px', fontWeight: 'bold' }}>TOPIC</label>
                                    <select
                                        value={topic} onChange={e => setTopic(e.target.value)}
                                        style={{ width: '100%', padding: '12px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', fontSize: '14px', appearance: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="all">Random</option>
                                        <option value="array">Arrays</option>
                                        <option value="string">Strings</option>
                                        <option value="tree">Trees</option>
                                        <option value="dynamic">DP</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '6px', fontWeight: 'bold' }}>DIFFICULTY</label>
                                    <select
                                        value={difficulty} onChange={e => setDifficulty(e.target.value)}
                                        style={{ width: '100%', padding: '12px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', fontSize: '14px', appearance: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleCreate}
                                style={{
                                    marginTop: '10px', width: '100%', padding: '14px',
                                    background: 'linear-gradient(to right, #22c55e, #16a34a)',
                                    color: 'white', border: 'none', borderRadius: '8px',
                                    cursor: 'pointer', fontWeight: '700', fontSize: '15px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                }}
                            >
                                <Plus size={18} /> Create & Join
                            </button>
                        </>
                    ) : (
                        <>
                            {/* JOIN MODE: Room ID Input */}
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '6px', fontWeight: 'bold' }}>ROOM CODE</label>
                                <input
                                    type="text"
                                    value={joinRoomId}
                                    onChange={e => setJoinRoomId(e.target.value)}
                                    style={{ width: '100%', padding: '12px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace' }}
                                    placeholder="Enter 6-char code"
                                    maxLength={8}
                                />
                            </div>

                            <button
                                onClick={handleJoin}
                                disabled={!joinRoomId}
                                style={{
                                    marginTop: '10px', width: '100%', padding: '14px',
                                    background: joinRoomId ? '#3b82f6' : '#27272a',
                                    color: joinRoomId ? 'white' : '#52525b',
                                    border: 'none', borderRadius: '8px',
                                    cursor: joinRoomId ? 'pointer' : 'not-allowed',
                                    fontWeight: '700', fontSize: '15px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: '0.2s'
                                }}
                            >
                                <Zap size={18} /> Join Battle
                            </button>
                        </>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <button
                            onClick={onPracticeSolo}
                            style={{ background: 'transparent', border: 'none', color: '#71717a', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Or practice solo problem solving
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lobby;
