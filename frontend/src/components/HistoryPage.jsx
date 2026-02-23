import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Calendar, Clock, Swords, Medal, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '../api';

const HistoryPage = () => {
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const initData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return;

                // Parallel Fetch
                const [user, res] = await Promise.all([
                    getCurrentUser(),
                    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/history`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                setCurrentUser(user);
                const data = await res.json();
                setMatches(data);
            } catch (err) {
                console.error("Failed to load history data", err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    const getMatchResult = (match) => {
        if (!match.winner) return { label: 'Draw', color: '#a1a1aa', icon: <Medal size={16} /> };
        if (match.winner.includes('No Winner')) return { label: 'No Contest', color: '#fbbf24', icon: <AlertCircle size={16} /> };
        if (currentUser && match.winner === currentUser.displayName) return { label: 'Victory', color: '#4ade80', icon: <Trophy size={16} /> };
        return { label: 'Defeat', color: '#f87171', icon: <Swords size={16} /> };
    };

    return (
        <div style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <button
                    onClick={() => navigate('/app')}
                    className="neo-btn"
                    style={{
                        background: 'var(--bg-card)',
                        border: 'var(--border-main)',
                        color: 'var(--text-main)',
                        padding: '12px',
                        borderRadius: '0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 950, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                        BATTLE_HISTORY
                    </h1>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700 }}>
                        Your recent arena performance
                    </p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ marginBottom: '20px' }}></div>
                    <p>Loading battle archives...</p>
                </div>
            ) : matches.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px',
                    background: 'var(--bg-card)',
                    border: 'var(--border-main)',
                    borderRadius: '0',
                    boxShadow: 'var(--shadow-main)'
                }}>
                    <Swords size={64} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '10px', fontWeight: 950, textTransform: 'uppercase' }}>NO_BATTLES_YET</h3>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Enter the arena to prove your worth!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {matches.map((match, i) => {
                        const result = getMatchResult(match);
                        return (
                            <div
                                key={match._id || i}
                                className="neo-card hover-card"
                                style={{
                                    padding: '24px',
                                    borderRadius: '0',
                                    background: 'var(--bg-card)',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    gap: '20px',
                                    alignItems: 'center',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    border: 'var(--border-main)',
                                    borderLeft: `8px solid ${result.color}`,
                                    boxShadow: 'var(--shadow-main)'
                                }}
                            >
                                {/* Left: Info */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 950, color: 'var(--text-main)', textTransform: 'uppercase' }}>{match.problem?.title || 'Unknown Challenge'}</h3>
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '4px 8px',
                                            borderRadius: '0',
                                            background: 'var(--bg-main)',
                                            border: 'var(--border-main)',
                                            color: 'var(--text-muted)',
                                            fontWeight: 800
                                        }}>
                                            {match.roomId}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} opacity={1} />
                                            {new Date(match.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={14} opacity={1} />
                                            {new Date(match.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Result Badge */}
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        borderRadius: '0',
                                        background: result.color,
                                        color: 'black',
                                        fontWeight: 950,
                                        fontSize: '14px',
                                        border: 'var(--border-main)',
                                        textTransform: 'uppercase'
                                    }}>
                                        {result.icon}
                                        {result.label}
                                    </div>

                                    {/* Optional: Show score or time if available */}
                                    {/* <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        Score: {match.players?.find(p => p.username === currentUser?.displayName)?.score || 0}
                                    </div> */}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
