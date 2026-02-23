import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Loader2, DollarSign, Calendar, User, CreditCard } from 'lucide-react';
import { BASE_URL, getAuthHeaders } from '../api';

const AdminDashboard = ({ onBack }) => {
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');

    const [activeTab, setActiveTab] = useState('overview');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);

    const [allUsers, setAllUsers] = useState([]);
    const [allUsersCount, setAllUsersCount] = useState(0);

    useEffect(() => {
        if (activeTab === 'overview') fetchStats();
        if (activeTab === 'requests') fetchRequests();
        if (activeTab === 'users') fetchOnlineUsers();
        if (activeTab === 'all_users') fetchAllUsers();
        if (activeTab === 'activity') fetchMatches();
    }, [activeTab]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/admin/stats`, { headers: getAuthHeaders() });
            if (res.ok) setStats(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/admin/recent-matches`, { headers: getAuthHeaders() });
            if (res.ok) setMatches(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/admin/all-users`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setAllUsers(data.users);
                setAllUsersCount(data.count);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchOnlineUsers = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/admin/online-users`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setOnlineUsers(data.users);
                setOnlineCount(data.count);
            }
        } catch (e) { console.error(e); }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/payment/admin/pending`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            } else {
                setError("Access Denied or Failed to fetch");
            }
        } catch (e) {
            setError("Network Error");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, type) => {
        setActionLoading(requestId);
        try {
            const endpoint = type === 'approve' ? 'approve' : 'reject';
            const res = await fetch(`${BASE_URL}/api/payment/admin/${endpoint}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ requestId })
            });

            if (res.ok) {
                setRequests(prev => prev.filter(r => r._id !== requestId));
            } else {
                alert("Action Failed");
            }
        } catch (e) {
            alert("Error processing request");
        } finally {
            setActionLoading(null);
        }
    };

    const handleUserAction = async (userId, action, value = null) => {
        if (action === 'delete' && !window.confirm("Are you sure? This cannot be undone.")) return;

        try {
            const res = await fetch(`${BASE_URL}/api/admin/user-action`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ userId, action, value })
            });
            if (res.ok) {
                if (action === 'delete') {
                    setAllUsers(prev => prev.filter(u => u._id !== userId));
                } else {
                    const { user: updatedUser } = await res.json();
                    setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, ...updatedUser } : u));
                }
            }
        } catch (e) {
            alert("Action failed");
        }
    };

    const StatsCard = ({ title, value, icon: Icon, color }) => (
        <div className="neo-card" style={{
            background: 'var(--bg-card)', border: 'var(--border-main)', borderRadius: '0', padding: '24px',
            display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'default',
            boxShadow: 'var(--shadow-main)'
        }}>
            <div style={{
                width: '56px', height: '56px', borderRadius: '0', background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black',
                border: 'var(--border-main)'
            }}>
                <Icon size={28} />
            </div>
            <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
                <div style={{ color: 'var(--text-main)', fontSize: '28px', fontWeight: 950, marginTop: '4px' }}>{value}</div>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '32px', background: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-main)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <button
                    onClick={onBack}
                    className="neo-btn"
                    style={{ background: 'var(--bg-card)', border: 'var(--border-main)', color: 'var(--text-main)', padding: '10px', borderRadius: '0', cursor: 'pointer', display: 'flex' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 950, textTransform: 'uppercase' }}>ADMIN_COMMAND_CENTER</h1>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>Manage users, payments, and platform health.</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', borderBottom: 'var(--border-main)' }}>
                {['overview', 'requests', 'users', 'all_users', 'activity'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: 'transparent', border: 'none', padding: '12px 0',
                            color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                            borderBottom: activeTab === tab ? '4px solid var(--accent)' : '4px solid transparent',
                            cursor: 'pointer', fontWeight: 950, fontSize: '14px', textTransform: 'uppercase',
                            transition: 'all 0.2s', position: 'relative'
                        }}
                    >
                        {tab.replace('_', ' ')}
                        {tab === 'users' && onlineCount > 0 && <span style={{ position: 'absolute', top: '4px', right: '-20px', background: '#22c55e', color: '#000', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>{onlineCount}</span>}
                    </button>
                ))}
            </div>

            {error && <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                    {stats ? (
                        <>
                            <StatsCard title="Total Users" value={stats.totalUsers} icon={User} color="#3b82f6" />
                            <StatsCard title="Total Revenue" value={`₹${stats.totalRevenue}`} icon={DollarSign} color="#22c55e" />
                            <StatsCard title="Total Matches" value={stats.totalMatches} icon={CodeCard} color="#f59e0b" />
                            <StatsCard title="Active Rooms" value={stats.activeRoomsCount} icon={CheckCircle} color="#a78bfa" />
                        </>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', gridColumn: '1 / -1' }}><Loader2 className="animate-spin" /></div>
                    )}
                </div>
            )}

            {activeTab === 'requests' && (
                loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>
                ) : requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', border: 'var(--border-main)', borderRadius: '0', background: 'var(--bg-card)', fontWeight: 700 }}>No pending requests.</div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {requests.map(req => (
                            <div key={req._id} className="neo-card" style={{ background: 'var(--bg-card)', border: 'var(--border-main)', borderRadius: '0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow-main)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontWeight: 950, textTransform: 'uppercase' }}>{req.userId?.displayName}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>{req.userId?.email}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 950, color: 'var(--accent)' }}>₹{req.amount}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>{req.credits} CREDITS</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => handleAction(req._id, 'reject')} style={{ flex: 1, padding: '10px', borderRadius: '0', background: 'transparent', border: 'var(--border-main)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 950 }}>REJECT</button>
                                    <button onClick={() => handleAction(req._id, 'approve')} className="neo-btn" style={{ flex: 2, padding: '10px', borderRadius: '0', background: 'var(--accent-green)', border: 'var(--border-main)', color: 'black', fontWeight: 950, cursor: 'pointer' }}>VERIFY & APPROVE</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {activeTab === 'users' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {onlineUsers.map(user => (
                        <div key={user.userId || user.socketId} className="neo-card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '0', border: 'var(--border-main)', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: 'var(--shadow-main)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-main)', border: 'var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} color="var(--text-muted)" /></div>
                            <div>
                                <div style={{ fontWeight: 950, textTransform: 'uppercase' }}>{user.displayName}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>{user.email}</div>
                                <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 950, marginTop: '4px' }}>● ONLINE</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'all_users' && (
                <div className="neo-card" style={{ background: 'var(--bg-card)', borderRadius: '0', border: 'var(--border-main)', overflow: 'hidden', boxShadow: 'var(--shadow-main)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--bg-main)', borderBottom: 'var(--border-main)' }}>
                            <tr style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 950 }}>
                                <th style={{ padding: '16px', textAlign: 'left' }}>User / Joined</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Tier</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Credits</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map(user => (
                                <tr key={user._id} style={{ borderBottom: 'var(--border-main)' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 950, textTransform: 'uppercase' }}>{user.displayName}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>{user.email} • {new Date(user.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span onClick={() => handleUserAction(user._id, 'togglePremium')} style={{
                                            background: user.isPremium ? 'var(--accent)' : 'var(--bg-main)',
                                            color: user.isPremium ? 'black' : 'var(--text-main)', padding: '4px 10px', borderRadius: '0', border: 'var(--border-main)', fontSize: '11px', fontWeight: 950, cursor: 'pointer'
                                        }}>
                                            {user.isPremium ? 'PRO' : 'FREE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 950, color: 'var(--accent)' }}>{user.credits}</div>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => {
                                                    const c = prompt("Set Credits:", user.credits);
                                                    if (c !== null) handleUserAction(user._id, 'setCredits', c);
                                                }}
                                                style={{ padding: '6px 12px', borderRadius: '0', background: 'var(--bg-main)', color: 'var(--text-main)', border: 'var(--border-main)', fontSize: '12px', fontWeight: 950, cursor: 'pointer' }}
                                            >
                                                EDIT_CREDITS
                                            </button>
                                            <button
                                                onClick={() => handleUserAction(user._id, 'delete')}
                                                style={{ padding: '6px', borderRadius: '0', background: 'var(--accent-red)', color: 'black', border: 'var(--border-main)', cursor: 'pointer' }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'activity' && (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {matches.map(m => (
                        <div key={m._id} className="neo-card" style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '0', border: 'var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-main)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ padding: '10px', borderRadius: '0', background: 'var(--bg-main)', border: 'var(--border-main)' }}><Code size={20} color="var(--text-muted)" /></div>
                                <div>
                                    <div style={{ fontWeight: 950, textTransform: 'uppercase' }}>{m.problem?.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>{m.players?.length} Players • {new Date(m.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 950 }}>WINNER: {m.winner || 'DRAW/DNF'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 800 }}>ROOM ID: {m.roomId}</div>
                            </div>
                        </div>
                    ))}
                    {matches.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', border: 'var(--border-main)', borderRadius: '0', background: 'var(--bg-card)', fontWeight: 700 }}>No recent activity.</div>}
                </div>
            )}

            <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const CodeCard = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
);
const CheckCircle = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const Code = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
);

export default AdminDashboard;
