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

    // ... (keep existing fetchRequests, fetchOnlineUsers, handleAction)

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
                                {/* ... (Req Details) ... */}
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
                                {/* ... (User Details) ... */}
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
