import React, { useState, useEffect } from 'react';
import { Search, Trophy, Flame, CheckCircle2, XCircle, Loader2, Zap, Clock, Code2 } from 'lucide-react';
import { fetchDailyChallenge, fetchUserSubmissions, fetchUserStats, fetchUserCalendar } from '../api';

const LeetCodeStats = ({ onSelectProblem }) => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [calendarData, setCalendarData] = useState(null);

    // Load persisted username on mount
    useEffect(() => {
        const savedUsername = localStorage.getItem('leetcode_username');
        if (savedUsername) {
            setUsername(savedUsername);
            fetchAllData(savedUsername);
        }
        loadDailyChallenge();
    }, []);

    const loadDailyChallenge = async () => {
        const daily = await fetchDailyChallenge();
        if (daily) setDailyChallenge(daily);
    };

    const fetchAllData = async (user) => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            const [statsData, submissionsData, calData] = await Promise.all([
                fetchUserStats(user),
                fetchUserSubmissions(user, 5),
                fetchUserCalendar(user)
            ]);

            if (!statsData) throw new Error("User not found");

            setStats({
                username: statsData.username,
                realName: statsData.realName,
                avatar: statsData.avatar,
                country: statsData.country,
                totalSolved: statsData.totalSolved || 0,
                easySolved: statsData.easySolved || 0,
                mediumSolved: statsData.mediumSolved || 0,
                hardSolved: statsData.hardSolved || 0,
                acceptanceRate: statsData.acceptanceRate || "0",
                ranking: statsData.ranking || 0,
                githubUrl: statsData.githubUrl
            });

            setSubmissions(submissionsData || []);
            if (calData) setCalendarData(calData);
            localStorage.setItem('leetcode_username', user);

        } catch (err) {
            console.error("Fetch failed:", err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchAllData(username);
    };

    const handleSolveDaily = () => {
        if (dailyChallenge && onSelectProblem) {
            onSelectProblem({
                id: dailyChallenge.questionId,
                title: dailyChallenge.title,
                slug: dailyChallenge.titleSlug,
                difficulty: dailyChallenge.difficulty
            });
        }
    };

    const getDifficultyColor = (diff) => {
        const d = String(diff).toLowerCase();
        if (d === 'easy') return '#22c55e';
        if (d === 'medium') return '#eab308';
        if (d === 'hard') return '#ef4444';
        return '#6b7280';
    };

    const formatTimestamp = (ts) => {
        const date = new Date(parseInt(ts) * 1000);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div style={{ width: '100%', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }} id="leetcode-stats">
            <div style={{ margin: '0 auto', maxWidth: '1100px', padding: '40px' }}>

                {/* DAILY CHALLENGE BANNER */}
                {dailyChallenge && (
                    <div style={{
                        background: 'var(--bg-card)',
                        border: 'var(--border-main)',
                        borderRadius: '0',
                        padding: '24px 32px',
                        marginBottom: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-main)'
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, right: 0, width: '200px', height: '200px',
                            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
                            filter: 'blur(40px)'
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1 }}>
                            <div style={{
                                width: '56px', height: '56px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                borderRadius: '14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
                            }}>
                                <Zap size={28} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                    DAILY_CHALLENGE • {dailyChallenge.date}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 950, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase' }}>
                                    #{dailyChallenge.questionId}. {dailyChallenge.title}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '0', fontSize: '11px', fontWeight: 950,
                                        background: getDifficultyColor(dailyChallenge.difficulty),
                                        color: 'black', border: 'var(--border-main)',
                                        textTransform: 'uppercase'
                                    }}>
                                        {dailyChallenge.difficulty}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                                        {dailyChallenge.acRate?.toFixed(1)}% ACCEPTANCE
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSolveDaily} className="neo-btn" style={{
                            background: 'var(--accent)',
                            color: 'black', border: 'var(--border-main)', padding: '14px 28px', borderRadius: '0',
                            fontWeight: 950, fontSize: '14px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            zIndex: 1
                        }}>
                            <Code2 size={18} /> SOLVE_NOW
                        </button>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                    {/* LEFT: STATS CARD */}
                    <div className="neo-card" style={{
                        background: 'var(--bg-card)', borderRadius: '0', border: 'var(--border-main)',
                        padding: '30px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-main)'
                    }}>
                        <div style={{
                            position: 'absolute', top: '-20%', right: '-10%', width: '200px', height: '200px',
                            background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', filter: 'blur(40px)'
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--accent)', fontSize: '11px', fontWeight: 950, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            <div style={{ width: '20px', height: '3px', background: 'var(--accent)' }} />
                            LEETCODE_STATS
                        </div>

                        {!stats ? (
                            <div>
                                <h2 style={{ fontSize: '28px', fontWeight: 950, marginBottom: '12px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                                    Connect <span style={{ color: 'var(--accent)' }}>Profile</span>
                                </h2>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 700 }}>
                                    Enter your LeetCode username to view stats
                                </p>

                                <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                                    <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                    <input
                                        type="text" placeholder="Enter username..." value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        style={{
                                            width: '100%', padding: '14px 14px 14px 44px', boxSizing: 'border-box', background: 'var(--bg-main)',
                                            border: 'var(--border-main)', borderRadius: '0', color: 'var(--text-main)', fontSize: '14px', outline: 'none', fontWeight: 700
                                        }}
                                    />
                                    <button type="submit" disabled={loading} style={{
                                        position: 'absolute', right: '6px', top: '6px', bottom: '6px', padding: '0 20px',
                                        background: loading ? 'var(--bg-card)' : 'var(--accent)', color: 'black',
                                        border: 'var(--border-main)', borderRadius: '0', fontWeight: 950, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '12px'
                                    }}>
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'CONNECT'}
                                    </button>
                                </form>

                                {error && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>
                                        <XCircle size={14} /> {error}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {/* User Info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    {stats.avatar ? (
                                        <img src={stats.avatar} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', border: 'var(--border-main)' }} />
                                    ) : (
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '50%',
                                            background: 'var(--accent)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '20px', fontWeight: 950, color: 'black', border: 'var(--border-main)'
                                        }}>
                                            {stats.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 950, color: 'var(--text-main)', textTransform: 'uppercase' }}>{stats.realName || stats.username}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>@{stats.username}</div>
                                    </div>
                                    <button onClick={() => { setStats(null); setSubmissions([]); localStorage.removeItem('leetcode_username'); }}
                                        style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--accent-red)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 800 }}>
                                        Disconnect
                                    </button>
                                </div>

                                {/* Stats Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '0', border: 'var(--border-main)', boxShadow: 'var(--shadow-main)' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 950 }}>Ranking</div>
                                        <div style={{ fontSize: '20px', fontWeight: 950, color: 'var(--text-main)' }}>#{parseInt(stats.ranking || 0).toLocaleString()}</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '0', border: 'var(--border-main)', boxShadow: 'var(--shadow-main)' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 950 }}>Acceptance</div>
                                        <div style={{ fontSize: '20px', fontWeight: 950, color: 'var(--accent-green)' }}>{stats.acceptanceRate}%</div>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 950, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Problems Solved</span>
                                        <span style={{ fontSize: '16px', fontWeight: 950, color: 'var(--text-main)' }}>{stats.totalSolved}</span>
                                    </div>
                                    <div style={{ display: 'flex', height: '12px', borderRadius: '0', overflow: 'hidden', background: 'var(--bg-main)', border: 'var(--border-main)' }}>
                                        <div style={{ width: `${(stats.easySolved / Math.max(stats.totalSolved, 1)) * 100}%`, background: 'var(--accent-green)' }} />
                                        <div style={{ width: `${(stats.mediumSolved / Math.max(stats.totalSolved, 1)) * 100}%`, background: 'var(--accent)' }} />
                                        <div style={{ width: `${(stats.hardSolved / Math.max(stats.totalSolved, 1)) * 100}%`, background: 'var(--accent-red)' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', fontWeight: 800 }}>
                                        <span style={{ color: 'var(--accent-green)' }}>EASY: {stats.easySolved}</span>
                                        <span style={{ color: 'var(--accent)' }}>MEDIUM: {stats.mediumSolved}</span>
                                        <span style={{ color: 'var(--accent-red)' }}>HARD: {stats.hardSolved}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: RECENT SUBMISSIONS */}
                    <div className="neo-card" style={{
                        background: 'var(--bg-card)', borderRadius: '0', border: 'var(--border-main)',
                        padding: '30px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-main)'
                    }}>
                        <div style={{
                            position: 'absolute', top: '-20%', left: '-10%', width: '200px', height: '200px',
                            background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)', filter: 'blur(40px)'
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--accent-green)', fontSize: '11px', fontWeight: 950, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            <div style={{ width: '20px', height: '3px', background: 'var(--accent-green)' }} />
                            RECENT_SUBMISSIONS
                        </div>

                        {submissions.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {submissions.map((sub, idx) => {
                                    const slug = sub.titleSlug || sub.slug;
                                    const canClick = !!slug;

                                    return (
                                        <div key={sub.id || idx} style={{
                                            background: 'var(--bg-main)', padding: '14px 16px', borderRadius: '0', border: 'var(--border-main)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            cursor: canClick ? 'pointer' : 'default', transition: 'all 0.2s',
                                            opacity: canClick ? 1 : 0.7, boxShadow: 'var(--shadow-main)'
                                        }}
                                            onClick={() => {
                                                if (canClick && onSelectProblem) {
                                                    onSelectProblem({ slug: slug, title: sub.title });
                                                }
                                            }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {sub.status === 'Accepted' ? <CheckCircle2 size={18} color="var(--accent-green)" /> : <XCircle size={18} color="var(--accent-red)" />}
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: 950, color: 'var(--text-main)', marginBottom: '2px', textTransform: 'uppercase' }}>{sub.title}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{sub.lang} • {sub.runtime} • {sub.memory}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800 }}>
                                                <Clock size={12} /> {formatTimestamp(sub.timestamp)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#3f3f46' }}>
                                <Clock size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>No recent submissions</div>
                                <div style={{ fontSize: '12px', color: '#27272a', marginTop: '4px' }}>Connect to see your activity</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* STREAK & HEATMAP SECTION */}
                {stats && (
                    <div style={{ marginTop: '30px' }}>
                        {/* Streak Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{
                                background: 'var(--bg-card)', borderRadius: '0', border: 'var(--border-main)',
                                padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-main)'
                            }}>
                                <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '0',
                                    background: 'var(--accent)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, border: 'var(--border-main)'
                                }}>
                                    <Flame size={26} color="black" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 950 }}>Current Streak</div>
                                    <div style={{ fontSize: '32px', fontWeight: 950, color: 'var(--text-main)', lineHeight: 1 }}>
                                        {calendarData?.streak || 0}
                                        <span style={{ fontSize: '14px', color: 'var(--accent)', marginLeft: '6px', fontWeight: 950 }}>DAYS</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                background: 'var(--bg-card)', borderRadius: '0', border: 'var(--border-main)',
                                padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-main)'
                            }}>
                                <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '0',
                                    background: 'var(--accent-green)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, border: 'var(--border-main)'
                                }}>
                                    <Trophy size={26} color="black" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 950 }}>Total Active Days</div>
                                    <div style={{ fontSize: '32px', fontWeight: 950, color: 'var(--text-main)', lineHeight: 1 }}>
                                        {calendarData?.totalActiveDays || 0}
                                        <span style={{ fontSize: '14px', color: 'var(--accent-green)', marginLeft: '6px', fontWeight: 950 }}>DAYS</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Heatmap */}
                        <div style={{
                            background: 'var(--bg-card)', borderRadius: '0', border: 'var(--border-main)',
                            padding: '28px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-main)'
                        }}>
                            <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)', filter: 'blur(50px)' }} />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '11px', fontWeight: 950, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    <div style={{ width: '20px', height: '3px', background: 'var(--accent-green)' }} />
                                    SUBMISSION_ACTIVITY
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>
                                    LESS
                                    {[0, 1, 2, 3, 4].map(level => (
                                        <div key={level} style={{
                                            width: '12px', height: '12px', borderRadius: '0', border: '1px solid var(--border-subtle)',
                                            background: level === 0 ? 'var(--bg-main)' : level === 1 ? '#064e3b' : level === 2 ? '#059669' : level === 3 ? '#10b981' : '#34d399'
                                        }} />
                                    ))}
                                    MORE
                                </div>
                            </div>
                            {(() => {
                                const calendar = calendarData?.submissionCalendar || {};
                                const now = new Date();
                                // Use UTC dates to match LeetCode's UTC midnight timestamps
                                const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
                                const weeks = 52;
                                const totalDays = weeks * 7;
                                const msPerDay = 86400000;

                                // Build day data for last 52 weeks
                                let startMs = todayUTC - (totalDays - 1) * msPerDay;
                                // Align to Sunday (0 = Sunday)
                                const startDay = new Date(startMs).getUTCDay();
                                startMs -= startDay * msPerDay;

                                const dayData = [];
                                for (let ms = startMs; ms <= todayUTC; ms += msPerDay) {
                                    const ts = (ms / 1000).toString();
                                    dayData.push({
                                        date: new Date(ms),
                                        count: parseInt(calendar[ts]) || 0
                                    });
                                }

                                // Find max for color scaling
                                const maxCount = Math.max(...dayData.map(d => d.count), 1);

                                const getColor = (count) => {
                                    if (count === 0) return 'var(--bg-main)';
                                    const ratio = count / maxCount;
                                    if (ratio <= 0.25) return '#064e3b';
                                    if (ratio <= 0.5) return '#059669';
                                    if (ratio <= 0.75) return '#10b981';
                                    return '#34d399';
                                };

                                // Group into weeks (columns)
                                const weekColumns = [];
                                for (let i = 0; i < dayData.length; i += 7) {
                                    weekColumns.push(dayData.slice(i, i + 7));
                                }

                                // Month labels
                                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                const monthLabels = [];
                                let lastMonth = -1;
                                weekColumns.forEach((week, idx) => {
                                    const firstDay = week[0];
                                    if (firstDay && firstDay.date.getMonth() !== lastMonth) {
                                        lastMonth = firstDay.date.getMonth();
                                        monthLabels.push({ idx, label: months[lastMonth] });
                                    }
                                });

                                const cellSize = 13;
                                const cellGap = 3;

                                return (
                                    <div style={{ overflowX: 'auto', position: 'relative', zIndex: 1 }}>
                                        {/* Month labels */}
                                        <div style={{ display: 'flex', marginBottom: '6px', marginLeft: '36px' }}>
                                            {monthLabels.map((m, i) => (
                                                <div key={i} style={{
                                                    position: 'absolute',
                                                    left: `${36 + m.idx * (cellSize + cellGap)}px`,
                                                    fontSize: '10px', color: '#52525b', fontWeight: 600
                                                }}>
                                                    {m.label}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: `${cellGap}px`, marginTop: '20px' }}>
                                            {/* Day labels */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: `${cellGap}px`, marginRight: '6px', justifyContent: 'flex-start' }}>
                                                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, i) => (
                                                    <div key={i} style={{ height: `${cellSize}px`, fontSize: '10px', color: '#3f3f46', display: 'flex', alignItems: 'center', lineHeight: 1, fontWeight: 600 }}>
                                                        {label}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Grid */}
                                            {weekColumns.map((week, wIdx) => (
                                                <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: `${cellGap}px` }}>
                                                    {week.map((day, dIdx) => (
                                                        <div
                                                            key={dIdx}
                                                            title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
                                                            style={{
                                                                width: `${cellSize}px`, height: `${cellSize}px`,
                                                                borderRadius: '0', border: '1px solid var(--border-subtle)',
                                                                background: getColor(day.count),
                                                                transition: 'transform 0.1s',
                                                                cursor: 'default'
                                                            }}
                                                            onMouseEnter={e => e.target.style.transform = 'scale(1.3)'}
                                                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .animate-spin { animation: spin 1s linear infinite; }
                `}</style>
            </div>
        </div>
    );
};

export default LeetCodeStats;
