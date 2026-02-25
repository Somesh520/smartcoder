import React, { useState, useEffect } from 'react';
import { Search, Trophy, Flame, CheckCircle2, XCircle, Loader2, Zap, Clock, Code2 } from 'lucide-react';
import { fetchDailyChallenge, fetchUserSubmissions, fetchUserStats, fetchUserCalendar, fetchUserContest, fetchUserSkills } from '../api';

const LeetCodeStats = ({ onSelectProblem }) => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [calendarData, setCalendarData] = useState(null);
    const [contestData, setContestData] = useState(null);
    const [skillsData, setSkillsData] = useState(null);

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
            const [statsData, submissionsData, calData, contest, skills] = await Promise.all([
                fetchUserStats(user),
                fetchUserSubmissions(user, 10),
                fetchUserCalendar(user),
                fetchUserContest(user),
                fetchUserSkills(user)
            ]);

            // Guard: If disconnect was called during fetch, don't update state
            if (!localStorage.getItem('leetcode_username') && !user) return;

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
            if (contest) setContestData(contest);
            if (skills) setSkillsData(skills);
            localStorage.setItem('leetcode_username', user);

        } catch (err) {
            console.error("Fetch failed:", err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = () => {
        setStats(null);
        setSubmissions([]);
        setCalendarData(null);
        setContestData(null);
        setSkillsData(null);
        setUsername('');
        setError(null);
        localStorage.removeItem('leetcode_username');
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
        <div style={{ width: '100%', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden', minHeight: '100vh', background: '#050508' }} id="leetcode-stats">

            {/* BACKGROUND DYNAMIC DATA STREAMS */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.1 }}>
                {[12, 35, 58, 72, 90].map((pos, idx) => (
                    <div key={idx} className="v-stream" style={{ left: `${pos}%`, animationDelay: `${idx * 2}s` }} />
                ))}
            </div>

            <div style={{ margin: '0 auto', maxWidth: '1100px', padding: '24px', position: 'relative', zIndex: 1 }}>

                {/* DAILY CHALLENGE BANNER */}
                {dailyChallenge && (
                    <div style={{
                        background: 'var(--bg-card)', border: 'var(--border-main)', padding: '20px 28px',
                        marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-main)'
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, right: 0, width: '200px', height: '200px',
                            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)', filter: 'blur(40px)'
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1 }}>
                            <div style={{
                                width: '56px', height: '56px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
                            }}>
                                <Zap size={28} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                    DAILY_CHALLENGE • {dailyChallenge.date}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 950, color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase' }}>
                                    #{dailyChallenge.questionId}. {dailyChallenge.title}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        padding: '4px 10px', fontSize: '11px', fontWeight: 950,
                                        background: getDifficultyColor(dailyChallenge.difficulty),
                                        color: 'black', border: 'var(--border-main)', textTransform: 'uppercase'
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
                            background: 'var(--accent)', color: 'black', border: 'var(--border-main)', padding: '14px 28px',
                            fontWeight: 950, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1
                        }}>
                            <Code2 size={18} /> SOLVE_NOW
                        </button>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '20px', alignItems: 'start' }}>

                    {/* LEFT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* STATS CARD */}
                        {stats ? (
                            <div className="neo-card" style={{
                                background: 'var(--bg-card)', border: 'var(--border-main)', padding: '24px',
                                position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-main)'
                            }}>
                                <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--accent)', fontSize: '11px', fontWeight: 950, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    <div style={{ width: '20px', height: '3px', background: 'var(--accent)' }} />
                                    LEETCODE_STATS
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    {stats.avatar ? (
                                        <img src={stats.avatar} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', border: 'var(--border-main)' }} />
                                    ) : (
                                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 950, color: 'black', border: 'var(--border-main)' }}>
                                            {stats.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 950, color: 'var(--text-main)', textTransform: 'uppercase' }}>{stats.realName || stats.username}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>@{stats.username}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDisconnect();
                                        }}
                                        style={{
                                            marginLeft: 'auto',
                                            padding: '8px 12px',
                                            fontSize: '11px',
                                            color: 'var(--accent-red)',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid var(--accent-red)',
                                            cursor: 'pointer',
                                            fontWeight: 950,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        className="disconnect-btn"
                                    >
                                        Disconnect_Safe
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ background: 'var(--bg-main)', padding: '16px', border: 'var(--border-main)' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 950 }}>Ranking</div>
                                        <div style={{ fontSize: '20px', fontWeight: 950, color: 'var(--text-main)' }}>#{parseInt(stats.ranking || 0).toLocaleString()}</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-main)', padding: '16px', border: 'var(--border-main)' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 950 }}>Acceptance</div>
                                        <div style={{ fontSize: '20px', fontWeight: 950, color: 'var(--accent-green)' }}>{stats.acceptanceRate}%</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 950, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Problems Solved</span>
                                        <span style={{ fontSize: '16px', fontWeight: 950, color: 'var(--text-main)' }}>{stats.totalSolved}</span>
                                    </div>
                                    <div style={{ display: 'flex', height: '12px', overflow: 'hidden', background: 'var(--bg-main)', border: 'var(--border-main)' }}>
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
                        ) : (
                            <div className="neo-card" style={{ background: 'var(--bg-card)', border: 'var(--border-main)', padding: '40px', textAlign: 'center' }}>
                                <h2 style={{ fontSize: '28px', fontWeight: 950, marginBottom: '12px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                                    Connect <span style={{ color: 'var(--accent)' }}>Profile</span>
                                </h2>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 700 }}>Enter your LeetCode username to view tactical stats</p>
                                <form onSubmit={handleSubmit} style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
                                    <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                    <input type="text" placeholder="Username..." value={username} onChange={(e) => setUsername(e.target.value)}
                                        style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'var(--bg-main)', border: 'var(--border-main)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }} />
                                    <button type="submit" disabled={loading} style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', padding: '0 20px', background: 'var(--accent)', color: 'black', border: 'var(--border-main)', fontWeight: 950, cursor: 'pointer' }}>
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'CONNECT'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* CONTEST RATING ARENA */}
                        {stats && contestData && !contestData.error && (
                            <div className="neo-card" style={{
                                background: 'var(--bg-card)', border: 'var(--border-main)', padding: '24px',
                                position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-main)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#8b5cf6', fontSize: '11px', fontWeight: 950, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    <div style={{ width: '20px', height: '3px', background: '#8b5cf6' }} />
                                    CONTEST_RATING_ARENA
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                                    <div style={{ fontSize: '48px', fontWeight: 950, color: '#fff', letterSpacing: '-2px' }}>{Math.round(contestData.contestRating || 0)}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 950 }}>ELO_RATING</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 950 }}>GLOBAL_RANK</div>
                                        <div style={{ fontSize: '16px', color: '#fff', fontWeight: 950 }}>#{contestData.contestGlobalRanking || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 950 }}>PERCENTILE</div>
                                        <div style={{ fontSize: '16px', color: '#fff', fontWeight: 950 }}>{contestData.contestTopPercentage?.toFixed(2)}%</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 950 }}>ATTENDED</div>
                                        <div style={{ fontSize: '16px', color: '#fff', fontWeight: 950 }}>{contestData.contestAttend || 0}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SKILL INSIGHTS */}
                        {stats && skillsData && !skillsData.error && (
                            <div className="neo-card" style={{ background: 'var(--bg-card)', border: 'var(--border-main)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent)', fontSize: '11px', fontWeight: 950, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    <div style={{ width: '20px', height: '3px', background: 'var(--accent)' }} />
                                    SKILL_MATRIX
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {[...(skillsData.advanced || []), ...(skillsData.intermediate || [])].slice(0, 12).map((skill, idx) => (
                                        <div key={idx} style={{ padding: '6px 10px', background: 'var(--bg-main)', border: 'var(--border-main)', fontSize: '10px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', gap: '6px' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{skill.tagName}</span>
                                            <span style={{ color: 'var(--accent)' }}>{skill.problemsSolved}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* RECENT SUBMISSIONS */}
                        <div className="neo-card" style={{ background: 'var(--bg-card)', border: 'var(--border-main)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-green)', fontSize: '11px', fontWeight: 950, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                <div style={{ width: '20px', height: '3px', background: 'var(--accent-green)' }} />
                                RECENT_SUBMISSIONS
                            </div>
                            {submissions.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {submissions.map((sub, idx) => (
                                        <div key={idx} style={{ background: 'var(--bg-main)', padding: '12px 16px', border: 'var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                                            onClick={() => onSelectProblem && onSelectProblem({ slug: sub.titleSlug || sub.slug, title: sub.title })}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {sub.status === 'Accepted' ? <CheckCircle2 size={16} color="var(--accent-green)" /> : <XCircle size={16} color="var(--accent-red)" />}
                                                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>{sub.title}</div>
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{formatTimestamp(sub.timestamp)}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>NO_SUBMISSIONS_FOUND</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* HEATMAP SECTION */}
                {stats && calendarData && !calendarData.error && (
                    <div className="neo-card" style={{ marginTop: '20px', background: 'var(--bg-card)', border: 'var(--border-main)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-green)', fontSize: '11px', fontWeight: 950, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            <div style={{ width: '20px', height: '3px', background: 'var(--accent-green)' }} />
                            ACTIVITY_PULSE
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ background: 'var(--bg-main)', padding: '16px', flex: 1, border: 'var(--border-main)' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Streak</div>
                                <div style={{ fontSize: '24px', fontWeight: 950 }}>{calendarData.streak} DAYS</div>
                            </div>
                            <div style={{ background: 'var(--bg-main)', padding: '16px', flex: 1, border: 'var(--border-main)' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Active Days</div>
                                <div style={{ fontSize: '24px', fontWeight: 950 }}>{calendarData.totalActiveDays} DAYS</div>
                            </div>
                        </div>
                        {/* Heatmap Visualization */}
                        <div style={{ background: 'var(--bg-main)', padding: '20px', border: 'var(--border-main)', overflowX: 'auto' }}>
                            {(() => {
                                const calendarDataRaw = calendarData.submissionCalendar;
                                if (!calendarDataRaw) return null;

                                // Ensure calendar is an object (parse if it's a string)
                                let calendar = calendarDataRaw;
                                if (typeof calendar === 'string') {
                                    try { calendar = JSON.parse(calendar); } catch (e) { calendar = {}; }
                                }

                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                const weeks = [];
                                const startDate = new Date(today);
                                startDate.setDate(today.getDate() - 364);
                                // Align to start of the week (Sunday)
                                while (startDate.getDay() !== 0) {
                                    startDate.setDate(startDate.getDate() - 1);
                                }

                                let currentDate = new Date(startDate);
                                for (let w = 0; w < 53; w++) {
                                    const weekDays = [];
                                    for (let d = 0; d < 7; d++) {
                                        // LeetCode timestamps are UTC midnight.
                                        // We'll normalize our local date to UTC midnight for comparison.
                                        const utcDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
                                        const ts = Math.floor(utcDate.getTime() / 1000);

                                        const count = calendar[ts] || calendar[String(ts)] || 0;
                                        weekDays.push({ date: new Date(currentDate), count });
                                        currentDate.setDate(currentDate.getDate() + 1);
                                    }
                                    weeks.push(weekDays);
                                }

                                return (
                                    <div style={{ display: 'flex', gap: '3px', padding: '10px 0' }}>
                                        {weeks.map((week, widx) => (
                                            <div key={widx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                {week.map((day, didx) => {
                                                    const isActive = day.count > 0;
                                                    // High-intensity green for active days
                                                    const greenColor = '#00ff9f';
                                                    const opacity = isActive ? 0.4 + Math.min(day.count * 0.2, 0.6) : 0.08;

                                                    return (
                                                        <div
                                                            key={didx}
                                                            title={`${day.count} submissions on ${day.date.toDateString()}`}
                                                            style={{
                                                                width: '10px',
                                                                height: '10px',
                                                                background: isActive ? greenColor : 'rgba(255,255,255,1)',
                                                                opacity: opacity,
                                                                borderRadius: '1px',
                                                                boxShadow: isActive ? `0 0 8px ${greenColor}44` : 'none',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .v-stream {
                    position: absolute; top: -20%; width: 1px; height: 140%;
                    background: linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.4), transparent);
                    animation: stream 8s linear infinite;
                }
                @keyframes stream { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
                .neo-btn:hover { background: #fff !important; color: #000 !important; }
                .disconnect-btn:hover { background: var(--accent-red) !important; color: #000 !important; }
            `}</style>
        </div>
    );
};

export default LeetCodeStats;