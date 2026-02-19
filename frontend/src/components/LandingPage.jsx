import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import ElectricBorder from './ElectricBorder';
import SEO from './SEO';
import SchemaMarkup from './SchemaMarkup';
import {
    Code2, Swords, Zap, Trophy, TrendingUp, Users, Terminal,
    Github, Twitter, ChevronRight, Play, Server, Database,
    Globe, Cpu, Cpu as Microchip, Star, Brain, Lock
} from 'lucide-react';
import { fetchReviews, getCurrentUser } from '../api';
import Hero3D from './Hero3D';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [intro, setIntro] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });

    useEffect(() => {
        getCurrentUser().then(user => setUserInfo(user));
        fetchReviews().then(data => {
            console.log("Fetched Reviews:", data);
            setReviews(data);
        });

        // Splash timer
        const timer = setTimeout(() => setIntro(false), 2000);

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Scroll Observer for Reviews and other reveal elements
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('revealed');
            });
        }, { threshold: 0.1 });

        // Delay to ensure DOM is ready
        const timeout = setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        }, 100);

        return () => {
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, [reviews]);



    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const openModal = (title, body) => {
        setModalContent({ title, body });
        setModalOpen(true);
    };

    return (
        <div style={{ background: '#050505', color: 'white', minHeight: '100vh', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
            <SEO title="AlgoDuel - Multiplayer Coding Battles" description="The ultimate competitive programming arena." />
            <SchemaMarkup />

            {/* SPLASH SCREEN */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999, background: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: intro ? 1 : 0, pointerEvents: intro ? 'all' : 'none', transition: 'opacity 0.5s'
            }}>
                <div style={{ width: '200px', height: '2px', background: '#333', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#00FFFF', animation: 'loading 1.5s infinite' }} />
                </div>
                <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
            </div>

            {/* NAVBAR */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, padding: '20px 40px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: scrolled ? 'rgba(5,5,5,0.8)' : 'transparent', backdropFilter: 'blur(10px)',
                zIndex: 100, borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'all 0.3s'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 800 }}>
                    <div style={{ width: '30px', height: '30px', background: '#00FFFF', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                    <span>ALGO<span style={{ color: '#00FFFF' }}>DUEL</span></span>
                </div>
                <div className="desktop-only" style={{ display: 'flex', gap: '30px', fontSize: '14px', fontWeight: 600, color: '#a1a1aa' }}>
                    {['Features', 'Workflow', 'Reviews'].map(item => (
                        <button key={item} onClick={() => scrollToSection(item.toLowerCase())} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                            {item}
                        </button>
                    ))}
                </div>
                <Link to="/app" style={{
                    padding: '10px 24px', background: '#00FFFF', color: 'black', fontWeight: 700,
                    borderRadius: '100px', textDecoration: 'none', fontSize: '14px',
                    boxShadow: '0 0 20px rgba(0,255,255,0.3)'
                }}>
                    Launch App
                </Link>
            </nav>

            {/* HERO SECTION */}
            <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingTop: '80px' }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.05) 0%, transparent 50%)',
                    zIndex: 0
                }} />

                {/* 3D SCENE */}
                <Hero3D />

                <div className="hero-grid" style={{
                    position: 'absolute', inset: 0, opacity: 0.1,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px', maskImage: 'radial-gradient(circle, black 30%, transparent 80%)',
                    zIndex: 0, pointerEvents: 'none'
                }} />

                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 20px' }}>
                    <div className="reveal" style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '100px', background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.2)', marginBottom: '30px', color: '#00FFFF', fontSize: '12px', fontWeight: 600, letterSpacing: '2px' }}>
                        ● SYSTEM v2.0 ONLINE
                    </div>
                    <h1 className="reveal" style={{
                        fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 900, lineHeight: 0.9, marginBottom: '30px',
                        background: 'linear-gradient(to bottom, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        CODE. BATTLE.<br />
                        <span style={{ color: 'transparent', WebkitTextStroke: '2px #00FFFF', opacity: 0.8 }}>DOMINATE.</span>
                    </h1>
                    <p className="reveal" style={{ fontSize: '18px', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto 50px', lineHeight: 1.6 }}>
                        The first e-sports platform for developers. Compete in real-time execution environments, rank up, and get hired.
                    </p>
                    <div className="reveal" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <Link to="/app" style={{
                            padding: '16px 40px', background: '#fff', color: 'black', fontWeight: 800,
                            borderRadius: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                            boxShadow: '0 0 30px rgba(255,255,255,0.2)'
                        }}>
                            Enter Arena <Play size={18} fill="black" />
                        </Link>
                        <button onClick={() => scrollToSection('features')} style={{
                            padding: '16px 40px', background: 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 600,
                            borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                        }}>
                            Explore Features
                        </button>
                    </div>
                </div>
            </section>

            {/* BENTO GRID FEATURES */}
            <section id="features" style={{ padding: '100px 20px', background: '#08080a' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 className="reveal" style={{ fontSize: '42px', fontWeight: 800, textAlign: 'center', marginBottom: '60px' }}>
                        Everything you need to <span style={{ color: '#00FFFF' }}>Win.</span>
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: 'minmax(200px, auto)', gap: '20px' }}>

                        {/* 1v1 BATTLES (Large) */}
                        <div className="reveal glass" style={{ gridColumn: 'span 8', padding: '40px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(0,255,255,0.05), transparent)' }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div style={{ background: '#00FFFF', color: 'black', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', fontWeight: 700, fontSize: '12px', marginBottom: '20px' }}>CORE MODE</div>
                                <h3 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '10px' }}>1v1 Live Battles</h3>
                                <p style={{ color: '#a1a1aa', maxWidth: '400px' }}>Challenge friends or random opponents. Real-time code synchronization, test case execution, and voice chat integration.</p>
                            </div>
                            <Swords size={200} style={{ position: 'absolute', bottom: -40, right: -40, opacity: 0.1, color: '#00FFFF' }} />
                        </div>

                        {/* AI CORE (Medium) */}
                        <div className="reveal glass" style={{ gridColumn: 'span 4', padding: '30px', background: 'linear-gradient(135deg, rgba(236,72,153,0.05), transparent)' }}>
                            <Brain size={40} color="#ec4899" style={{ marginBottom: '20px' }} />
                            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px' }}>AI Neural Core</h3>
                            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Smart hints and personalized analysis after every match.</p>
                        </div>

                        {/* STATS (Medium) */}
                        <div className="reveal glass" style={{ gridColumn: 'span 4', padding: '30px' }}>
                            <TrendingUp size={40} color="#fbbf24" style={{ marginBottom: '20px' }} />
                            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px' }}>Live Analytics</h3>
                            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Track your Elo rating, global rank, and solve speed.</p>
                        </div>

                        {/* PREMIUM (Large) */}
                        <div className="reveal glass" style={{ gridColumn: 'span 8', padding: '40px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <Lock size={40} color="#a78bfa" style={{ marginBottom: '20px' }} />
                                <h3 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '10px' }}>Pro Features</h3>
                                <p style={{ color: '#a1a1aa', maxWidth: '500px' }}>Unlock unlimited private rooms, advanced analytics, and exclusive "Grandmaster" profile badges.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* WORKFLOW (ROOM EXPERIENCE) SECTION */}
            <section id="workflow" style={{ padding: '120px 20px', background: '#050505' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <SectionLabel>The Experience</SectionLabel>
                    <h2 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '80px', letterSpacing: '-1px' }}>
                        Inside The Arena
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', position: 'relative' }}>
                        {/* Connecting Line (Desktop) */}
                        <div className="desktop-only" style={{
                            position: 'absolute', top: '40px', left: '0', right: '0', height: '2px',
                            background: 'linear-gradient(90deg, #00FFFF, #FF7BAC)', opacity: 0.2, zIndex: 0,
                        }} />

                        {[
                            {
                                icon: <Users size={24} />,
                                title: "Connect",
                                desc: "Share a simple link. Jump into a private room. Voice chat activates instantly—no setup required.",
                                color: "#00FFFF",
                                code: "Join Room"
                            },
                            {
                                icon: <Code2 size={24} />,
                                title: "Collaborate",
                                desc: "See your partner's cursor in real-time. Discuss logic, debug together, or race against them.",
                                color: "#FF7BAC",
                                code: "Live Edit"
                            },
                            {
                                icon: <Play size={24} />,
                                title: "Compete",
                                desc: "Run your code against 100+ hidden test cases. Sandbox execution ensures fairness.",
                                color: "#B6A1C4",
                                code: "Run Code"
                            },
                            {
                                icon: <Trophy size={24} />,
                                title: "Victory",
                                desc: "Get an instant verdict. Analyze memory usage and runtime. Claim your rank points.",
                                color: "#ffffff",
                                code: "Win Match"
                            }
                        ].map((step, i) => (
                            <div key={i} style={{
                                background: '#121214', border: '1px solid #27272a', padding: '30px',
                                borderRadius: '16px', position: 'relative', zIndex: 1,
                                transition: 'transform 0.3s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = step.color}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#27272a'}>
                                <div style={{
                                    width: '50px', height: '50px', background: `rgba(255,255,255,0.05)`,
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: step.color, marginBottom: '24px', border: `1px solid ${step.color}20`
                                }}>
                                    {step.icon}
                                </div>
                                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: step.color, marginBottom: '8px' }}>
                                    Step 0{i + 1} // {step.code}
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>{step.title}</h3>
                                <p style={{ fontSize: '14px', color: '#71717a', lineHeight: '1.6' }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* WALL OF LOVE */}
            <section id="reviews" style={{ padding: '100px 20px', borderTop: '1px solid #222' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className="reveal" style={{ fontSize: '42px', fontWeight: 800, marginBottom: '60px' }}>
                        Wall of <span style={{ color: '#ec4899' }}>Love.</span>
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {reviews.length > 0 ? reviews.map((review, i) => (
                            <div key={i} className="reveal glass" style={{ padding: '30px', textAlign: 'left' }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                                    <img src={review.user?.photos || review.user?.photoURL || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt="User" />
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{review.user?.displayName || "Coder"}</div>
                                        <div style={{ display: 'flex' }}>{[...Array(5)].map((_, j) => <Star key={j} size={12} fill={j < review.rating ? "#fbbf24" : "#333"} color="none" />)}</div>
                                    </div>
                                </div>
                                <p style={{ color: '#a1a1aa', fontStyle: 'italic' }}>"{review.comment}"</p>
                            </div>
                        )) : <div style={{ gridColumn: '1/-1', color: '#666' }}>No reviews yet. Be the first!</div>}
                    </div>
                </div>
            </section>

            {/* STUDIO SECTION */}
            <section id="studio" style={{ padding: '160px 20px', background: '#050505', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                <div className="reveal" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                    <div style={{ marginBottom: '40px', display: 'inline-block', position: 'relative' }}>
                        <div className="avatar-glow" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'conic-gradient(from 0deg, #00FFFF, #FF7BAC, #00FFFF)', padding: '3px', animation: 'spin-slow 8s linear infinite' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 900, color: '#00FFFF' }}>S</div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#FF7BAC', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <span style={{ width: '30px', height: '1px', background: 'linear-gradient(90deg, transparent, #FF7BAC)' }} />
                        The Studio
                        <span style={{ width: '30px', height: '1px', background: 'linear-gradient(90deg, #FF7BAC, transparent)' }} />
                    </h2>

                    <h3 className="gradient-text-animated" style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 900, marginBottom: '30px', background: 'linear-gradient(135deg, #fff 0%, #00FFFF 50%, #FF7BAC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite' }}>
                        Crafted by Somesh.
                    </h3>

                    <p style={{ fontSize: '18px', color: '#a1a1aa', lineHeight: '1.9', marginBottom: '50px', maxWidth: '650px', margin: '0 auto 50px' }}>
                        AlgoDuel is a passion project built with obsessive attention to detail —<br />
                        from <span style={{ color: '#00FFFF' }}>real-time WebSocket battles</span> to <span style={{ color: '#FF7BAC' }}>pixel-perfect UI</span>.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '50px' }}>
                        {['React', 'Node.js', 'MongoDB', 'Socket.io', 'Docker'].map((tech, i) => (
                            <span key={i} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '12px', fontWeight: 600, color: '#71717a', letterSpacing: '1px' }}>{tech}</span>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        {[
                            { label: 'GitHub', href: 'https://github.com/Somesh520', icon: '⌘' },
                            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/somesh-tiwari-236555322/', icon: '◉' },
                            { label: 'Portfolio', href: 'https://someshxd.netlify.app/', icon: '◈' }
                        ].map((link, i) => (
                            <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="studio-link" style={{ padding: '14px 28px', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#a1a1aa', textDecoration: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '10px' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#00FFFF'; e.currentTarget.style.color = '#00FFFF'; e.currentTarget.style.boxShadow = '0 0 25px rgba(0,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                <span style={{ fontSize: '16px' }}>{link.icon}</span>
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER - PREMIUM DESIGN */}
            <footer style={{ borderTop: '1px solid rgba(0,255,255,0.1)', background: '#050505', paddingTop: '100px', paddingBottom: '40px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '300px', height: '1px', background: 'linear-gradient(90deg, transparent, #00FFFF, transparent)', boxShadow: '0 0 20px #00FFFF' }} />

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '60px', marginBottom: '80px' }}>

                        {/* BRAND COLUMN */}
                        <div style={{ gridColumn: 'span 1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '30px', height: '30px', background: '#00FFFF', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                                <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>ALGO<span style={{ color: '#00FFFF' }}>DUEL</span></span>
                            </div>
                            <p style={{ color: '#71717a', fontSize: '14px', lineHeight: '1.7', marginBottom: '30px' }}>
                                The operating system for competitive developers.<br />
                                <span style={{ color: '#a1a1aa' }}>Build your rank. Prove your worth.</span>
                            </p>
                            <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '6px', color: '#00FFFF', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.3s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#00FFFF'; e.currentTarget.style.color = '#050505'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,255,0.1)'; e.currentTarget.style.color = '#00FFFF'; }}>
                                Enter Arena →
                            </Link>
                        </div>

                        {/* PLATFORM LINKS */}
                        <div>
                            <FooterHeader>Platform</FooterHeader>
                            <FooterLink onClick={() => openModal("Live Arena", "Experience real-time 1v1 coding battles. \n\n- Synchronized Editor\n- Voice Chat Integration\n- Instant Test Case Feedback")}>Live Arena</FooterLink>
                            <FooterLink onClick={() => openModal("Problem Set", "Access our curated archive of algorithmic challenges.\n\nDifficulty levels: Easy, Medium, Hard, Nightmare.\nTopics: DP, Graphs, Trees, Strings.")}>Problem Set</FooterLink>
                            <FooterLink onClick={() => openModal("Leaderboard", "Compete for the top spot. \n\nElo Rating System: start at 1200.\nRanks: Novice, Apprentice, Expert, Master, Grandmaster.")}>Leaderboard</FooterLink>
                        </div>

                        {/* RESOURCES LINKS */}
                        <div>
                            <FooterHeader>Resources</FooterHeader>
                            <Link to="/docs" style={{ color: '#71717a', textDecoration: 'none', fontSize: '14px', transition: 'all 0.2s', cursor: 'pointer', display: 'block', marginBottom: '12px' }} onMouseEnter={(e) => e.target.style.color = '#00FFFF'} onMouseLeave={(e) => e.target.style.color = '#71717a'}>Documentation</Link>
                            <FooterLink onClick={() => openModal("API Reference", "Our REST and WebSocket APIs are rate-limited to 100 req/min. Authentication via JWT required for all endpoints.")}>API Reference</FooterLink>
                            <FooterLink onClick={() => openModal("System Status", "All Systems Operational. 99.9% Uptime this month.\n\n- Matchmaking: ONLINE\n- Execution Engine: ONLINE\n- Voice Server: ONLINE")}>System Status</FooterLink>
                        </div>

                        {/* CONNECT COLUMN */}
                        <div>
                            <FooterHeader>Connect</FooterHeader>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                {[
                                    { href: 'https://github.com/Somesh520', icon: '⌘' },
                                    { href: 'https://www.linkedin.com/in/somesh-tiwari-236555322/', icon: '◉' },
                                    { href: 'https://someshxd.netlify.app/', icon: '◈' }
                                ].map((link, i) => (
                                    <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '8px', color: '#71717a', textDecoration: 'none', fontSize: '16px', transition: 'all 0.3s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#00FFFF'; e.currentTarget.style.color = '#00FFFF'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,255,0.2)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.color = '#71717a'; e.currentTarget.style.boxShadow = 'none'; }}>
                                        {link.icon}
                                    </a>
                                ))}
                            </div>
                            <p style={{ color: '#52525b', fontSize: '12px', lineHeight: '1.6' }}>Built with 💻 by Somesh</p>
                        </div>
                    </div>

                    {/* BOTTOM BAR */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', fontSize: '11px', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
                            <span>All Systems Operational</span>
                            <span style={{ color: '#27272a' }}>•</span>
                            <span>© 2026 AlgoDuel</span>
                        </div>
                        <div style={{ display: 'flex', gap: '25px' }}>
                            <Link to="/privacy" style={{ cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'none', color: '#3f3f46' }} onMouseEnter={e => e.target.style.color = '#00FFFF'} onMouseLeave={e => e.target.style.color = '#3f3f46'}>Privacy</Link>
                            <Link to="/terms" style={{ cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'none', color: '#3f3f46' }} onMouseEnter={e => e.target.style.color = '#00FFFF'} onMouseLeave={e => e.target.style.color = '#3f3f46'}>Terms</Link>
                            <span onClick={() => openModal('Cookies', 'We use essential cookies.')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#00FFFF'} onMouseLeave={e => e.target.style.color = '#3f3f46'}>Cookies</span>
                        </div>
                    </div>
                </div>
            </footer>



            {/* CONTENT MODAL */}
            {modalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }} onClick={() => setModalOpen(false)}>
                    <div style={{
                        background: '#121214', border: '1px solid #27272a', width: '100%', maxWidth: '500px',
                        padding: '40px', borderRadius: '16px', position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setModalOpen(false)} style={{
                            position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none',
                            color: '#71717a', cursor: 'pointer', fontSize: '24px'
                        }}>&times;</button>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '20px', textTransform: 'uppercase' }}>{modalContent.title}</h2>
                        <div style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{modalContent.body}</div>
                        <button onClick={() => setModalOpen(false)} style={{
                            marginTop: '30px', width: '100%', padding: '12px', background: 'white', color: 'black',
                            border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase'
                        }}>Close</button>
                    </div>
                </div>
            )}

            <style>{`
                .glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; backdrop-filter: blur(10px); }
                .glass:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); transition: all 0.3s; transform: translateY(-5px); box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5); }
                
                .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .reveal.revealed { opacity: 1; transform: translateY(0); }
                
                @media (max-width: 768px) {
                    .glass { grid-column: span 12 !important; }
                    .desktop-only { display: none !important; }
                }

                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            `}</style>
        </div>
    );
};

// --- SUBCOMPONENTS ---

const SectionLabel = ({ children }) => (
    <div style={{
        color: '#00FFFF', fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
        textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'
    }}>
        <div style={{ width: '20px', height: '1px', background: '#00FFFF' }} />
        {children}
    </div>
);

const FooterHeader = ({ children }) => (
    <div style={{ color: 'white', fontWeight: 700, fontSize: '14px', marginBottom: '24px', letterSpacing: '0.5px' }}>
        {children}
    </div>
);

const FooterLink = ({ children, onClick, to }) => (
    <div style={{ marginBottom: '16px' }}>
        {to ? (
            <Link to={to} style={{ color: '#71717a', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s', display: 'block' }}
                onMouseEnter={e => e.target.style.color = '#00FFFF'}
                onMouseLeave={e => e.target.style.color = '#71717a'}>
                {children}
            </Link>
        ) : (
            <div onClick={(e) => { e.preventDefault(); onClick && onClick(); }}
                style={{ color: '#71717a', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = '#00FFFF'}
                onMouseLeave={e => e.target.style.color = '#71717a'}>
                {children}
            </div>
        )}
    </div>
);

export default LandingPage;
