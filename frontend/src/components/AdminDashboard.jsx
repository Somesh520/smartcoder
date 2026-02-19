import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Loader2, DollarSign, Calendar, User, CreditCard } from 'lucide-react';
import { BASE_URL, getAuthHeaders } from '../api';

const AdminDashboard = ({ onBack }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');

    const [activeTab, setActiveTab] = useState('requests');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);

    const [allUsers, setAllUsers] = useState([]);
    const [allUsersCount, setAllUsersCount] = useState(0);

    useEffect(() => {
        if (activeTab === 'requests') fetchRequests();
        if (activeTab === 'users') fetchOnlineUsers();
        if (activeTab === 'all_users') fetchAllUsers();
    }, [activeTab]);

    // ... (keep online users interval)

    const fetchAllUsers = async () => {
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
                // Remove from list
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

    return (
        <div style={{ padding: '24px', background: '#09090b', minHeight: '100vh', color: '#e4e4e7' }}>
            {/* Header ... */}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid #27272a' }}>
                <button
                    onClick={() => setActiveTab('requests')}
                    style={{
                        background: 'transparent', border: 'none', padding: '12px 0',
                        color: activeTab === 'requests' ? '#a78bfa' : '#71717a',
                        borderBottom: activeTab === 'requests' ? '2px solid #a78bfa' : '2px solid transparent',
                        cursor: 'pointer', fontWeight: 600
                    }}
                >
                    Payment Requests
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        background: 'transparent', border: 'none', padding: '12px 0',
                        color: activeTab === 'users' ? '#a78bfa' : '#71717a',
                        borderBottom: activeTab === 'users' ? '2px solid #a78bfa' : '2px solid transparent',
                        cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                >
                    Online Users <span style={{ background: '#22c55e', color: '#000', padding: '0 6px', borderRadius: '4px', fontSize: '11px' }}>{onlineCount}</span>
                </button>
                <button
                    onClick={() => setActiveTab('all_users')}
                    style={{
                        background: 'transparent', border: 'none', padding: '12px 0',
                        color: activeTab === 'all_users' ? '#a78bfa' : '#71717a',
                        borderBottom: activeTab === 'all_users' ? '2px solid #a78bfa' : '2px solid transparent',
                        cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                >
                    All Users <span style={{ background: '#3f3f46', color: '#fff', padding: '0 6px', borderRadius: '4px', fontSize: '11px' }}>{allUsersCount}</span>
                </button>
            </div>

            {error && <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

            {activeTab === 'requests' && (
                // ... (Payment Requests Content)
                loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>
                ) : requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#71717a', border: '1px dashed #27272a', borderRadius: '12px' }}>
                        No pending requests found.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {requests.map(req => (
                            <div key={req._id} style={{
                                background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '20px',
                                display: 'flex', flexDirection: 'column', gap: '16px'
                            }}>
                                {/* User Info & Plan */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#f4f4f5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <User size={16} color="#a1a1aa" /> {req.userId?.displayName || 'Unknown User'}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '4px' }}>
                                            {req.userId?.email}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#a78bfa' }}>₹{req.amount}</div>
                                        <div style={{ fontSize: '12px', color: '#e4e4e7', background: 'rgba(167,139,250,0.1)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                                            +{req.credits} Credits
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction Details */}
                                <div style={{ background: '#09090b', padding: '12px', borderRadius: '8px', border: '1px solid #27272a' }}>
                                    <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transaction ID</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#e4e4e7' }}>{req.transactionId}</div>
                                    <div style={{ fontSize: '11px', color: '#52525b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={10} /> {new Date(req.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                    <button
                                        onClick={() => handleAction(req._id, 'reject')}
                                        disabled={actionLoading === req._id}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #3f3f46',
                                            background: 'transparent', color: '#e4e4e7', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            fontSize: '13px', fontWeight: 500, transition: 'all 0.2s'
                                        }}
                                    >
                                        {actionLoading === req._id ? <Loader2 size={16} className="animate-spin" /> : <><X size={16} /> Reject</>}
                                    </button>
                                    <button
                                        onClick={() => handleAction(req._id, 'approve')}
                                        disabled={actionLoading === req._id}
                                        style={{
                                            flex: 2, padding: '10px', borderRadius: '8px', border: 'none',
                                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
                                            opacity: actionLoading === req._id ? 0.7 : 1
                                        }}
                                    >
                                        {actionLoading === req._id ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Verify & Approve</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {activeTab === 'users' && (
                // ... (Online Users Content)
                onlineUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#71717a', border: '1px dashed #27272a', borderRadius: '12px' }}>
                        No users currently online.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                        {onlineUsers.map(user => (
                            <div key={user.userId || user.socketId} style={{
                                background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px',
                                display: 'flex', alignItems: 'center', gap: '12px'
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', background: '#27272a',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa'
                                }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#f4f4f5' }}>{user.displayName || user.username || 'Anonymous'}</div>
                                    <div style={{ fontSize: '12px', color: '#71717a' }}>{user.email}</div>
                                    <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></div>
                                        Online Now
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {activeTab === 'all_users' && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #27272a', color: '#a1a1aa' }}>
                                <th style={{ padding: '12px' }}>User</th>
                                <th style={{ padding: '12px' }}>Email</th>
                                <th style={{ padding: '12px' }}>Joined</th>
                                <th style={{ padding: '12px' }}>Credits</th>
                                <th style={{ padding: '12px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map((user, i) => (
                                <tr key={user._id || i} style={{ borderBottom: '1px solid #1f1f22', color: '#f4f4f5' }}>
                                    <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} /></div>
                                        {user.displayName}
                                    </td>
                                    <td style={{ padding: '12px', color: '#a1a1aa' }}>{user.email}</td>
                                    <td style={{ padding: '12px', color: '#71717a' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px' }}>{user.credits}</td>
                                    <td style={{ padding: '12px' }}>
                                        {user.isPremium ? (
                                            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>PRO</span>
                                        ) : (
                                            <span style={{ background: '#27272a', color: '#a1a1aa', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>FREE</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default AdminDashboard;
