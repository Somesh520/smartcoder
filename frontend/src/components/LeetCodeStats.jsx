import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trophy, Flame, Target, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const LeetCodeStats = () => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // Load persisted username OR Session on mount
    useEffect(() => {
        const savedUsername = localStorage.getItem('leetcode_username');
        const session = localStorage.getItem('user_session');

        if (savedUsername) {
            setUsername(savedUsername);
            fetchStats(savedUsername);
        } else if (session && session !== "undefined") {
            // Auto-sync using session
            fetchStatsFromSession(session);
        }
    }, []);

    const fetchStatsFromSession = async (session) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Identify User
            console.log("Identifying user from session...");
            const authRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/leetcode/me`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leetcode_session: session })
            });

            if (!authRes.ok) throw new Error("Session Invalid or Expired");

            const authData = await authRes.json();
            const username = authData.username;

            console.log("User Identified:", username);

            // 2. Fetch Stats using the username (Delegated to the main function)
            await fetchStats(username);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Auto-sync failed');
            setLoading(false);
        }
    };

    // Mock Data for demonstration
    const MOCK_DATA = useMemo(() => ({
        username: "Somesh Tiwari",
        totalSolved: 65,
        easySolved: 40,
        mediumSolved: 23,
        hardSolved: 2,
        acceptanceRate: "64.5%",
        ranking: "1,959,923",
        contributionPoints: 1250,
        reputation: 0,
        streak: 7,
        longestStreak: 13,
        // Generate pseudo-random calendar for 52 weeks (364 days)
        calendar: Array(364).fill(0).map(() => Math.random() > 0.8 ? Math.floor(Math.random() * 4) : 0)
    }), []);

    /**
     * Parse the submissionCalendar object { "timestamp": count }
     * into a structured array for the Heatmap + Streak info
     */
    const processCalendarData = (calendarObj) => {
        // The new API might return calendarObj as a JSON string, so parsing it safe
        let parsedCalendar = calendarObj;
        if (typeof calendarObj === 'string') {
            try {
                parsedCalendar = JSON.parse(calendarObj);
            } catch (e) {
                console.error("Failed to parse calendar JSON string", e);
                parsedCalendar = {};
            }
        }

        if (!parsedCalendar || Object.keys(parsedCalendar).length === 0) {
            return { calendar: Array(364).fill(0), currentStreak: 0, longestStreak: 0 };
        }

        const today = new Date();
        const timestamps = Object.keys(parsedCalendar).map(ts => parseInt(ts)).sort((a, b) => a - b);

        // Map timestamps to "YYYY-MM-DD" counts
        const calendarMap = new Map();
        timestamps.forEach(ts => {
            const date = new Date(ts * 1000);
            const key = date.toISOString().split('T')[0];
            calendarMap.set(key, parsedCalendar[ts]);
        });

        // Generate exactly 52 weeks * 7 days = 364 days ending today
        // This ensures the grid is always a perfect rectangle
        const totalDays = 364; // 52 weeks
        const calendarGrid = [];

        // Start from (Today - 363 days) to Today
        // We start loop such that the LAST element is today
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (totalDays - 1));

        for (let i = 0; i < totalDays; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const key = d.toISOString().split('T')[0];
            calendarGrid.push(calendarMap.get(key) || 0);
        }

        // --- Streak Calculation ---
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        // Get all unique sorted dates from the API data
        const dateSet = new Set();
        timestamps.forEach(ts => {
            const dateStr = new Date(ts * 1000).toISOString().split('T')[0];
            dateSet.add(dateStr);
        });
        const sortedDates = Array.from(dateSet).sort();

        // Calculate Longest Streak
        for (let i = 0; i < sortedDates.length; i++) {
            if (i > 0) {
                const prev = new Date(sortedDates[i - 1]);
                const curr = new Date(sortedDates[i]);
                const diffTime = Math.abs(curr - prev);
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
            } else {
                tempStreak = 1;
            }
            longestStreak = Math.max(longestStreak, tempStreak);
        }

        // Calculate Current Streak
        if (sortedDates.length > 0) {
            const lastSub = new Date(sortedDates[sortedDates.length - 1]);
            const diffFromToday = Math.floor((today - lastSub) / (1000 * 60 * 60 * 24));

            if (diffFromToday <= 1) {
                currentStreak = tempStreak;
            } else {
                currentStreak = 0;
            }
        }

        return { calendar: calendarGrid, currentStreak, longestStreak };
    };

    const fetchStats = async (user) => {
        if (!user) return;
        setLoading(true);
        setError(null);
        setStats(null);

        try {
            // Using our own backend proxy which now uses leetcode-query
            const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/leetcode/${user}`);

            if (!res.ok) {
                if (res.status === 404) throw new Error("User not found");
                throw new Error("Failed to fetch data");
            }

            const data = await res.json();
            processAndSetStats(data, user);

        } catch (err) {
            console.error("Fetch failed:", err);
            setError(err.message || "Something went wrong.");
            // Fallback to mock data if preferred, or just show error
            // setStats(MOCK_DATA); 
        } finally {
            setLoading(false);
        }
    };

    const processAndSetStats = (data, user) => {
        // Process Data
        const { calendar, currentStreak, longestStreak } = processCalendarData(data.submissionCalendar);

        setStats({
            username: user,
            totalSolved: data.totalSolved,
            easySolved: data.easySolved,
            mediumSolved: data.mediumSolved,
            hardSolved: data.hardSolved,
            acceptanceRate: data.acceptanceRate,
            ranking: data.ranking,
            contributionPoints: data.contributionPoints,
            reputation: data.reputation,
            streak: currentStreak,
            longestStreak: longestStreak,
            calendar: calendar
        });

        if (user) {
            setUsername(user);
            localStorage.setItem('leetcode_username', user);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchStats(username);
    };

    const getHeatmapColor = (count) => {
        if (count === 0) return '#1f1f23'; // Dark Gray (Empty)
        if (count <= 2) return '#0e4429'; // Dark Green
        if (count <= 5) return '#006d32'; // Medium Green
        if (count <= 8) return '#26a641'; // Bright Green
        return '#39d353'; // Neon Green
    };

    // Helper to split array into chunks of 7 (Weeks) for Vertical Column Layout
    // The calendar array is 364 days long.
    // 364 / 7 = 52 weeks.
    const weeks = useMemo(() => {
        const data = stats ? stats.calendar : [];
        if (data.length === 0) return [];

        const chunks = [];
        for (let i = 0; i < data.length; i += 7) {
            chunks.push(data.slice(i, i + 7));
        }
        return chunks;
    }, [stats]);

    return (
        <div style={{
            width: '100%',
            color: 'white',
            fontFamily: "'Inter', sans-serif"
        }} id="leetcode-stats">
            <div style={{ margin: '0 auto', maxWidth: '1000px', padding: '40px', background: '#09090b', borderRadius: '32px', border: '1px solid #27272a', position: 'relative', overflow: 'hidden' }}>

                {/* Background Glow */}
                <div style={{
                    position: 'absolute', top: '-20%', left: '-10%', width: '40%', height: '40%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
                    filter: 'blur(40px)', zIndex: 0
                }} />

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', position: 'relative', zIndex: 1,
                    color: '#22d3ee', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase'
                }}>
                    <div style={{ width: '24px', height: '2px', background: '#22d3ee' }} />
                    LEETCODE INTEGRATION
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.5fr', gap: '60px', alignItems: 'center', position: 'relative', zIndex: 1 }}>

                    {/* LEFT COLUMN: Input & Info */}
                    <div>
                        <h2 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '20px', lineHeight: '1.1', color: 'white', letterSpacing: '-1px' }}>
                            Showcase your <br />
                            <span style={{ color: '#22d3ee', textShadow: '0 0 20px rgba(34,211,238,0.3)' }}>Proof of Work.</span>
                        </h2>
                        <p style={{ fontSize: '16px', color: '#a1a1aa', marginBottom: '40px', lineHeight: '1.6', maxWidth: '90%' }}>
                            Connect your public LeetCode profile to visualize your daily progress, streaks, and problem-solving achievements.
                        </p>

                        {!stats ? (
                            <form onSubmit={handleSubmit} style={{ position: 'relative', maxWidth: '340px', marginBottom: '20px' }}>
                                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter LeetCode Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={{
                                        width: '100%', padding: '16px 16px 16px 48px',
                                        background: '#18181b', border: '1px solid #27272a', borderRadius: '14px',
                                        color: 'white', fontSize: '15px', outline: 'none',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#22d3ee';
                                        e.target.style.boxShadow = '0 0 0 2px rgba(34,211,238,0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#27272a';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        position: 'absolute', right: '6px', top: '6px', bottom: '6px',
                                        padding: '0 20px', background: loading ? '#27272a' : '#22d3ee',
                                        color: loading ? '#71717a' : 'black',
                                        border: 'none', borderRadius: '10px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '13px', transition: 'all 0.2s', display: 'flex', alignItems: 'center'
                                    }}
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'CONNECT'}
                                </button>
                            </form>
                        ) : (
                            <div style={{
                                background: '#121214', padding: '24px', borderRadius: '20px', border: '1px solid #27272a',
                                display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', maxWidth: '340px',
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                            }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #FF7BAC 0%, #F53C3C 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '24px', fontWeight: 800, color: 'white',
                                    boxShadow: '0 8px 16px rgba(245, 60, 60, 0.3)'
                                }}>
                                    {stats.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0', color: 'white' }}>{stats.username}</h3>
                                    <button
                                        onClick={() => {
                                            setStats(null);
                                            setUsername('');
                                            localStorage.removeItem('leetcode_username');
                                        }}
                                        style={{ fontSize: '13px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', opacity: 0.8 }}
                                    >
                                        Disconnect / Change User
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '14px', marginTop: '16px', fontWeight: 500 }}>
                                <XCircle size={16} /> {error}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: DASHBOARD */}
                    <div style={{ position: 'relative' }}>
                        {stats ? (
                            <div className="stats-card" style={{
                                background: '#0e0e10', border: '1px solid #27272a', borderRadius: '28px',
                                padding: '30px', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
                                animation: 'fadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                {/* Subtle grain or gradient overlay could go here */}

                                {/* Header / Stats Summary */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Global Ranking</div>
                                        <div style={{ fontSize: '24px', color: 'white', fontWeight: 800, letterSpacing: '-0.5px' }}>#{parseInt(stats.ranking).toLocaleString()}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Contributions</div>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                            <Flame size={20} fill="#f59e0b" /> {stats.contributionPoints}
                                        </div>
                                    </div>
                                </div>

                                {/* Streak Section */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ background: '#18181b', padding: '16px 20px', borderRadius: '16px', border: '1px solid #27272a' }}>
                                        <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: 500 }}>Current Streak</div>
                                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#22c55e', letterSpacing: '-0.5px' }}>{stats.streak} Days</div>
                                    </div>
                                    <div style={{ background: '#18181b', padding: '16px 20px', borderRadius: '16px', border: '1px solid #27272a' }}>
                                        <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '6px', fontWeight: 500 }}>Longest Streak</div>
                                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#eab308', letterSpacing: '-0.5px' }}>{stats.longestStreak} Days</div>
                                    </div>
                                </div>

                                {/* HEATMAP */}
                                <div style={{ marginBottom: '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#d4d4d8' }}>Activity Graph</span>
                                        <span style={{ fontSize: '11px', color: '#52525b', fontWeight: 500 }}>Last 12 Months</span>
                                    </div>

                                    {/* Flex Container for Weeks */}
                                    <div style={{
                                        padding: '4px 0',
                                        maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
                                        WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)'
                                    }}>
                                        <div style={{ display: 'flex', gap: '4px', height: '80px' }}>
                                            {/* Render only last 25 weeks for cleaner view in this card size, or full scroll */}
                                            {weeks.slice(-30).map((week, wIndex) => (
                                                <div key={wIndex} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                    {week.map((count, dIndex) => (
                                                        <div key={dIndex} style={{
                                                            width: '10px', height: '10px',
                                                            borderRadius: '2px',
                                                            background: getHeatmapColor(count),
                                                            transition: 'opacity 0.1s'
                                                        }} />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Total Solved</span>
                                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>{stats.totalSolved}</span>
                                    </div>

                                    {/* Multi-colored Progress Bar */}
                                    <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px', background: '#27272a' }}>
                                        <div style={{ width: `${(stats.easySolved / stats.totalSolved) * 100}%`, background: '#22c55e' }} />
                                        <div style={{ width: `${(stats.mediumSolved / stats.totalSolved) * 100}%`, background: '#eab308' }} />
                                        <div style={{ width: `${(stats.hardSolved / stats.totalSolved) * 100}%`, background: '#ef4444' }} />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e' }}>Easy: {stats.easySolved}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#eab308' }}>Medium: {stats.mediumSolved}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444' }}>Hard: {stats.hardSolved}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                width: '100%', height: '400px',
                                background: '#121214', border: '1px dashed #27272a', borderRadius: '28px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                color: '#27272a', position: 'relative'
                            }}>
                                <Trophy size={64} style={{ opacity: 0.1, marginBottom: '20px' }} />
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#3f3f46' }}>Waiting for Data...</div>
                                <div style={{ fontSize: '13px', color: '#27272a', marginTop: '8px' }}>Enter a username to connect</div>
                            </div>
                        )}

                        {/* Decorative Blur behind card */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            width: '90%', height: '90%', background: '#22d3ee', opacity: 0.08, filter: 'blur(90px)', zIndex: -1
                        }} />
                    </div>
                </div>
                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
            </div>
        </div>
    );
};

export default LeetCodeStats;
