import React, { useState, useEffect } from 'react';
import { fetchGithubUser, fetchGithubRepos, saveGithubDsaRepo, removeGithubDsaRepo, BASE_URL } from '../api';
import { Github as GithubIcon, Users, MapPin, Link as LinkIcon, Star, GitBranch, Terminal, BookOpen, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Github = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [repos, setRepos] = useState([]);
    const [error, setError] = useState(null);
    const [savingRepo, setSavingRepo] = useState(false);

    // Use the value from the user prop, default to empty string if undefined
    const [currentDsaRepo, setCurrentDsaRepo] = useState(user?.githubDsaRepo || "");

    useEffect(() => {
        // Sync state if user prop changes
        if (user && user.githubDsaRepo !== currentDsaRepo) {
            setCurrentDsaRepo(user.githubDsaRepo);
        }
    }, [user]);

    useEffect(() => {
        const loadGithubData = async () => {
            setLoading(true);
            try {
                const userRes = await fetchGithubUser();

                if (userRes?.error === "not_connected" || userRes?.error === "Token not found") {
                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.get('just_authorized') === 'true') {
                        setError("cookie_blocked");
                        setLoading(false);
                        return;
                    }
                    window.location.href = `${BASE_URL}/auth/github`;
                    return;
                }

                if (userRes?.data) {
                    setProfile(userRes.data);

                    const repoRes = await fetchGithubRepos();
                    if (repoRes?.data) {
                        // Sort repos by stars descending
                        const sortedRepos = repoRes.data.sort((a, b) => b.stargazers_count - a.stargazers_count);
                        setRepos(sortedRepos);
                    }
                } else {
                    setError("failed");
                }
            } catch (e) {
                console.error("Error loading github data:", e);
                setError("failed");
            }
            setLoading(false);
        };

        loadGithubData();
    }, []);

    const handleConnect = () => {
        // Redirect to backend auth endpoint
        window.location.href = `${BASE_URL}/auth/github`;
    };

    const handleSetDsaRepo = async (e, repoName) => {
        e.preventDefault(); // Prevent navigating to github
        if (savingRepo || currentDsaRepo === repoName) return;

        setSavingRepo(true);
        const username = profile.login;
        const result = await saveGithubDsaRepo(username, repoName);
        if (result && result.message) {
            setCurrentDsaRepo(repoName);
        } else {
            alert("Failed to save DSA Repo");
        }
        setSavingRepo(false);
    };

    const handleRemoveDsaRepo = async (e) => {
        e.preventDefault();
        if (savingRepo) return;

        setSavingRepo(true);
        const result = await removeGithubDsaRepo();
        if (result && result.message) {
            setCurrentDsaRepo("");
        } else {
            alert("Failed to remove DSA Repo");
        }
        setSavingRepo(false);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a', color: 'white' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <GithubIcon size={40} color="var(--accent)" />
                </motion.div>
            </div>
        );
    }

    if (error === "cookie_blocked") {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                height: '100%', padding: '40px', background: '#0a0a0a'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '24px', padding: '60px', textAlign: 'center', maxWidth: '500px'
                }}>
                    <GithubIcon size={64} color="#ef4444" style={{ margin: '0 auto 24px', opacity: 0.8 }} />
                    <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Cookie Blocked</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                        Your browser is blocking the GitHub authorization cookies. This is usually caused by strict privacy settings, Brave Shields, or blocking third-party cookies.
                        <br /><br />
                        Please allow cookies for this site or disable shields, then try again!
                    </p>
                    <button
                        onClick={handleConnect}
                        style={{
                            background: '#ef4444', color: 'white', border: 'none', padding: '16px 32px',
                            borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px', margin: '0 auto',
                            boxShadow: '0 4px 15px rgba(239,68,68,0.2)'
                        }}
                    >
                        Retry Authorization
                    </button>
                </div>
            </div>
        );
    }

    if (error === "not_connected") {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                height: '100%', padding: '40px', background: '#0a0a0a'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px', padding: '60px', textAlign: 'center', maxWidth: '500px'
                }}>
                    <GithubIcon size={64} color="white" style={{ margin: '0 auto 24px', opacity: 0.8 }} />
                    <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Connect GitHub</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                        Link your GitHub account to AlgoDuel to showcase your repositories and track your open-source contributions directly on your profile.
                    </p>
                    <button
                        onClick={handleConnect}
                        style={{
                            background: 'white', color: 'black', border: 'none', padding: '16px 32px',
                            borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px', margin: '0 auto',
                            boxShadow: '0 4px 15px rgba(255,255,255,0.2)'
                        }}
                    >
                        <GithubIcon size={20} /> Authorize with GitHub
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', background: '#0a0a0a', minHeight: '100vh', color: 'white', overflowY: 'auto' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Profile Header */}
                {profile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: 'linear-gradient(145deg, rgba(34,197,94,0.1) 0%, rgba(0,0,0,0.5) 100%)',
                            border: '1px solid rgba(34,197,94,0.2)',
                            borderRadius: '24px', padding: '40px', display: 'flex', gap: '32px', alignItems: 'center',
                            marginBottom: '40px', flexWrap: 'wrap'
                        }}
                    >
                        <img
                            src={profile.avatar_url}
                            alt={profile.login}
                            style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid rgba(34,197,94,0.3)', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 8px 0' }}>{profile.name || profile.login}</h1>
                            <p style={{ fontSize: '18px', color: 'var(--accent)', margin: '0 0 16px 0', fontWeight: 600 }}>@{profile.login}</p>

                            {profile.bio && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '16px', maxWidth: '600px', lineHeight: '1.5' }}>{profile.bio}</p>}

                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                                    <Users size={16} /> <strong style={{ color: 'white' }}>{profile.followers}</strong> followers · <strong style={{ color: 'white' }}>{profile.following}</strong> following
                                </div>
                                {profile.location && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                                        <MapPin size={16} /> {profile.location}
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                                    <Terminal size={16} /> <strong style={{ color: 'white' }}>{profile.public_repos}</strong> Repositories
                                </div>
                            </div>
                        </div>
                        <a
                            href={profile.html_url} target="_blank" rel="noreferrer"
                            style={{
                                padding: '12px 24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px', color: 'white', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <GithubIcon size={18} /> View on GitHub
                        </a>
                    </motion.div>
                )}

                {/* Repositories Grid */}
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Terminal size={24} color="var(--accent)" /> Top Repositories
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {repos.map((repo, idx) => (
                            <motion.a
                                href={repo.html_url} target="_blank" rel="noreferrer"
                                key={repo.id}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                style={{
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '16px', padding: '24px', textDecoration: 'none', color: 'inherit',
                                    display: 'flex', flexDirection: 'column', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)';
                                    e.currentTarget.style.background = 'rgba(34,197,94,0.05)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                }}
                            >
                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BookOpen size={18} /> {repo.name}
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.5', flex: 1, margin: '0 0 20px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {repo.description || "No description provided."}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                    {repo.language && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }} />
                                            {repo.language}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={14} /> {repo.stargazers_count}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <GitBranch size={14} /> {repo.forks_count}
                                    </div>
                                </div>

                                {/* Set as DSA Repo Button overlay */}
                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={(e) => handleSetDsaRepo(e, repo.name)}
                                        disabled={savingRepo}
                                        style={{
                                            background: currentDsaRepo === repo.name ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                            color: currentDsaRepo === repo.name ? '#22c55e' : 'white',
                                            border: `1px solid ${currentDsaRepo === repo.name ? '#22c55e' : 'rgba(255,255,255,0.2)'}`,
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            cursor: currentDsaRepo === repo.name ? 'default' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s',
                                            zIndex: 10
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentDsaRepo !== repo.name) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentDsaRepo !== repo.name) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                            }
                                        }}
                                    >
                                        {currentDsaRepo === repo.name ? (
                                            <><CheckCircle size={16} /> Selected</>
                                        ) : (
                                            "Set as DSA Repo"
                                        )}
                                    </button>
                                    {currentDsaRepo === repo.name && (
                                        <button
                                            onClick={handleRemoveDsaRepo}
                                            disabled={savingRepo}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.2s',
                                                zIndex: 10,
                                                marginLeft: '8px'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </motion.a>
                        ))}
                    </div>
                    {repos.length === 0 && !loading && error !== "not_connected" && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                            No public repositories found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Github;
