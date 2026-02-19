import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header'; // Ensure Header is imported if used, or standard imports
import ElectricBorder from './ElectricBorder';
import SEO from './SEO';
import SchemaMarkup from './SchemaMarkup';
import {
    Code2, Swords, Zap, Trophy, TrendingUp, Users, Terminal,
    Github, Twitter, ChevronRight, Play, Server, Database,
    Globe, Cpu, Cpu as Microchip
} from 'lucide-react';
import LeetCodeStats from './LeetCodeStats';
import { submitReview, fetchReviews, getCurrentUser } from '../api';
import ReviewModal from './ReviewModal';
import { Star } from 'lucide-react';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });
    const [intro, setIntro] = useState(true);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [carouselPaused, setCarouselPaused] = useState(false);

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        // Fetch User Info
        getCurrentUser().then(user => setUserInfo(user));

        // Fetch Reviews
        fetchReviews().then(data => setReviews(data));
    }, []);

    const handleRateUsClick = () => {
        if (userInfo) {
            setIsReviewModalOpen(true);
        } else {
            // If not logged in, redirect to login (or show toast - using simple alert for now or modal)
            openModal("Login Required", "Please login to submit a review!");
            // Alternatively, redirect to /connect
            // window.location.href = '/connect'; 
        }
    };

    useEffect(() => {
        // Splash Screen Timer
        window.scrollTo(0, 0); // Force top on reload
        const timer = setTimeout(() => {
            setIntro(false);
        }, 2200);
        return () => clearTimeout(timer);
    }, []);

    const openModal = (title, body) => {
        setModalContent({ title, body });
        setModalOpen(true);
    };

    // Smooth scrolling for navigation links
    useEffect(() => {
        // Enable smooth scrolling
        document.documentElement.style.scrollBehavior = 'smooth';

        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Carousel auto-play (advances every 4 seconds when not paused)
    useEffect(() => {
        if (carouselPaused) return;
        const timer = setInterval(() => {
            setCarouselIndex(prev => (prev + 1) % 6);
        }, 4000);
        return () => clearInterval(timer);
    }, [carouselPaused]);

    // Scroll-triggered reveal animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        const elements = document.querySelectorAll('.reveal');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [intro]); // Re-run after splash screen

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: '#050505',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            overflowX: 'hidden',
            selection: { background: '#00FFFF', color: 'black' }
        }}>
            <SEO
                title="AlgoDuel - Build. Battle. Dominate."
                description="The ultimate competitive programming arena. Battle in real-time execution environments with multiplayer sync."
            />
            <SchemaMarkup />
            <style>{`
                @media (max-width: 768px) {
                    .landing-nav {
                        padding: 15px 20px !important;
                    }
                    .nav-links {
                        display: none !important;
                    }
                }
            `}</style>

            {/* SPLASH SCREEN */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: '#050505',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'opacity 0.8s ease-in-out, visibility 0.8s',
                opacity: intro ? 1 : 0,
                pointerEvents: intro ? 'all' : 'none',
                visibility: intro ? 'visible' : 'hidden'
            }}>
                <div style={{
                    width: '80px', height: '8px', background: '#27272a', borderRadius: '100px', overflow: 'hidden',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        width: '100%', height: '100%', background: '#00FFFF',
                        animation: 'loadingBar 2s cubic-bezier(0.85, 0, 0.15, 1) forwards'
                    }} />
                </div>
                <div style={{
                    fontFamily: 'monospace', fontSize: '14px', color: '#00FFFF', letterSpacing: '4px',
                    animation: 'blink 0.2s infinite alternate'
                }}>
                    INITIALIZING SYSTEM...
                </div>
                <style>{`
                    @keyframes loadingBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(0); } }
                    @keyframes blink { from { opacity: 0.5; } to { opacity: 1; } }
                `}</style>
            </div>
            {/* NAVBAR */}
            <nav className="landing-nav" style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                padding: '15px 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: scrolled ? 'rgba(5, 5, 5, 0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(10px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'all 0.3s ease',
                zIndex: 100,
                height: '80px'
            }}>
                <div
                    onClick={() => scrollToSection('hero')}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                    <img
                        src="/logo.svg"
                        alt="AlgoDuel Logo"
                        style={{
                            width: '36px', height: '36px',
                            filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.4))'
                        }}
                    />
                    <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
                        ALGO<span style={{ color: '#00FFFF' }}>DUEL</span>
                    </span>
                </div>

                <div className="nav-links" style={{ display: 'flex', gap: '40px', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <NavBtn onClick={() => scrollToSection('mission')}>Mission</NavBtn>
                    <NavBtn onClick={() => scrollToSection('workflow')}>Architecture</NavBtn>
                    <NavBtn onClick={() => scrollToSection('features')}>Engine</NavBtn>
                    <NavBtn onClick={() => scrollToSection('showcase')}>Showcase</NavBtn>
                    <NavBtn onClick={() => scrollToSection('studio')}>Studio</NavBtn>
                </div>

                <Link
                    to="/app"
                    style={{
                        padding: '10px 24px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                        background: '#00FFFF', color: 'black', borderRadius: '4px', cursor: 'pointer',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
                        textDecoration: 'none',
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
                    }}
                >
                    Launch <ChevronRight size={14} />
                </Link>
            </nav>

            {/* HERO SECTION */}
            <section id="hero" style={{
                height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Animated Floating Particles */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
                    {[...Array(30)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            position: 'absolute',
                            width: `${Math.random() * 20 + 8}px`,
                            height: `${Math.random() * 20 + 8}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.3 + 0.1,
                            animation: `float ${Math.random() * 10 + 15}s linear infinite`,
                            animationDelay: `${Math.random() * 5}s`
                        }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '16px', color: i % 3 === 0 ? '#00FFFF' : i % 3 === 1 ? '#FF7BAC' : '#a1a1aa' }}>
                                {['{', '}', '()', '=>', '//', '[]', '&&', '||', '++', '==='][i % 10]}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Background Grid (Faded) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                    maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
                    zIndex: 1
                }} />

                <div style={{ zIndex: 10, textAlign: 'center', padding: '0 20px', maxWidth: '1000px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px',
                        border: '1px solid rgba(0, 255, 255, 0.2)', padding: '6px 16px', borderRadius: '100px',
                        background: 'rgba(0, 255, 255, 0.05)'
                    }}>
                        <div style={{ width: '6px', height: '6px', background: '#00FFFF', borderRadius: '50%', boxShadow: '0 0 10px #00FFFF' }} />
                        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#00FFFF' }}>
                            v2.0 System Online
                        </span>
                    </div>

                    <h1 className="glitch-text" data-text="DS ALGO. BATTLE. DOMINATE." style={{
                        fontSize: 'clamp(50px, 8vw, 120px)', fontWeight: '900', margin: '0 0 20px 0',
                        lineHeight: '0.9', letterSpacing: '-0.04em', textTransform: 'uppercase',
                        color: 'white', fontFamily: "'Inter', sans-serif", position: 'relative'
                    }}>
                        <span className="glitch-layer">DS Algo.</span><br />
                        <span className="glitch-layer">Battle.</span><br />
                        <span className="glitch-layer" style={{
                            color: 'transparent', WebkitTextStroke: '2px #FF7BAC',
                            background: 'linear-gradient(180deg, #FF7BAC 0%, transparent 100%)',
                            WebkitBackgroundClip: 'text', opacity: 0.9
                        }}>Dominate.</span>
                    </h1>

                    <p style={{ fontSize: '18px', color: '#71717a', maxWidth: '600px', margin: '0 auto 50px', lineHeight: '1.6' }}>
                        The ultimate <strong>competitive programming arena</strong>. <br />
                        <span style={{ color: '#d4d4d8' }}>Real-time 1v1 execution. Multiplayer sync for <strong>Technical Interview</strong> prep.</span>
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <ElectricBorder color="#00FFFF" speed={2} chaos={0.10} thickness={2} style={{ borderRadius: '4px' }}>
                            <Link to="/app" className="cyber-btn-primary">
                                <span className="btn-content">Enter The Arena <Play fill="black" size={14} /></span>
                            </Link>
                        </ElectricBorder>
                    </div>
                </div>

                {/* Floating Code Snippet Effect */}
                <div className="desktop-only" style={{
                    position: 'absolute', bottom: '40px', right: '40px', zIndex: 5,
                    fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.2)',
                    textAlign: 'right'
                }}>
                    <div>socket.emit('join_room', {'{id}'});</div>
                    <div>await executionService.run(code);</div>
                    <div>:: 200 OK</div>
                </div>
            </section>

            {/* MISSION SECTION (Problem/Solution) */}
            <section id="mission" style={{ padding: '120px 20px', background: '#050505' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <SectionLabel className="reveal">The Mission</SectionLabel>

                    <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginBottom: '120px' }}>
                        <div>
                            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '20px', lineHeight: '1.2' }}>
                                The Problem.<br />
                                <span style={{ color: '#71717a' }}>Coding is lonely.</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: '1.7' }}>
                                Traditional <strong>DSA practice</strong> is a solitary experience. You, a static IDE, and a silent judge.
                                There's no adrenaline. No real-time pressure. No human connection.
                                <br /><br />
                                It's effective, but it lacks the thrill of a real <strong>coding duel</strong>.
                            </p>
                        </div>
                        <div>
                            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '20px', lineHeight: '1.2' }}>
                                The Solution.<br />
                                <span style={{ color: '#00FFFF' }}>Gamified Warfare.</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: '1.7' }}>
                                AlgoDuel transforms <strong>algorithms</strong> into a spectator sport. We drop two developers into a
                                <strong> synchronized 1v1 arena</strong>.
                                <br /><br />
                                It's not just about solving the problem—it's about solving it <em>faster</em> than the person breathing down your neck via Voice Chat.
                            </p>
                        </div>
                    </div>

                    <div className="reveal" style={{ background: '#0a0a0c', border: '1px solid #1f1f23', borderRadius: '24px', padding: '60px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '4px', color: '#FF7BAC', marginBottom: '20px', textTransform: 'uppercase' }}>
                            Why We Are Different
                        </h3>
                        <h2 style={{ fontSize: '42px', fontWeight: 900, color: 'white', marginBottom: '40px', lineHeight: '1.1' }}>
                            We don't just compile code.<br />
                            We compile <span style={{ color: '#00FFFF' }}>Adrenaline.</span>
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginTop: '60px' }}>
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>&lt; 15ms</div>
                                <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase' }}>Sync Latency</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>100%</div>
                                <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase' }}>Live Interaction</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Voice</div>
                                <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase' }}>Integrated Comms</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* USER JOURNEY (THE WORKFLOW) */}
            <section id="journey" style={{ padding: '120px 20px', background: '#050505' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <SectionLabel>The Workflow</SectionLabel>
                    <h2 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '20px', color: 'white' }}>
                        From Novice to <span style={{ color: '#00FFFF' }}>Grandmaster.</span>
                    </h2>
                    <p style={{ fontSize: '18px', color: '#a1a1aa', maxWidth: '600px', marginBottom: '80px' }}>
                        Stop solving random problems. Our structured workflow guides you through the patterns that matter, directly inside the platform.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        <JourneyCard
                            num="01"
                            title="Select a Pattern"
                            desc="Don't guess. Pick from 15+ curated patterns like 'Sliding Window' or 'Two Pointers' that cover 90% of interview questions."
                        />
                        <JourneyCard
                            num="02"
                            title="Internal Workspace"
                            desc="Launch a dedicated workspace instantly. No tab switching. Your code runs against LeetCode's engine directly within AlgoDuel."
                        />
                        <JourneyCard
                            num="03"
                            title="Analyze & Optimize"
                            desc="Get real-time feedback. Compare your runtime against global percentiles. Refine your solution until it's optimal."
                        />
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


            {/* FEATURES (ENGINE) SECTION */}
            <section id="features" style={{ padding: '120px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px' }}>
                        <div>
                            <SectionLabel>Engine</SectionLabel>
                            <h2 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-1px', maxWidth: '600px' }}>
                                Powered by modern<br />
                                <span style={{ color: '#71717a' }}>web technologies.</span>
                            </h2>
                        </div>
                        <div className="desktop-only" style={{ textAlign: 'right' }}>
                            <p style={{ color: '#71717a', fontSize: '14px', fontFamily: 'monospace' }}>
                                STATUS: OPTIMIZED<br />
                                LATENCY: 12ms
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        <FeatureCard
                            icon={<Zap color="#F7DF1E" />}
                            title="React + Vite"
                            tech="FRONTEND"
                            desc="Blazing fast UI rendering with granular state management for seamless typing."
                        />
                        <FeatureCard
                            icon={<Database color="#4DB33D" />}
                            title="MongoDB + Mongoose"
                            tech="STORAGE"
                            desc="Schema-less data modeling for flexible user profiles and fluid match history."
                        />
                        <FeatureCard
                            icon={<Globe color="#00FFFF" />}
                            title="Socket.io"
                            tech="REALTIME"
                            desc="Bi-directional event-based communication. No polling. Pure WebSocket speed."
                        />
                        <FeatureCard
                            icon={<Server color="#3C873A" />}
                            title="Node.js Execution"
                            tech="BACKEND"
                            desc="Scalable server architecture handling concurrent compilation requests."
                        />
                        <FeatureCard
                            icon={<Database color="#DC382D" />}
                            title="Redis"
                            tech="CACHING"
                            desc="Sub-millisecond data access for session management and real-time leadership boards."
                        />
                        <FeatureCard
                            icon={<Code2 color="#007ACC" />}
                            title="Monaco Editor"
                            tech="IDE"
                            desc="The power of VS Code in your browser. IntelliSense, syntax highlighting, and minimap."
                        />
                        <FeatureCard
                            icon={<Microchip color="#2496ED" />}
                            title="Docker"
                            tech="SANDBOX"
                            desc="Isolated containers for secure code execution. Preventing malicious system access."
                        />
                        <FeatureCard
                            icon={<Users color="#FFC107" />}
                            title="Passport.js"
                            tech="AUTH"
                            desc="Secure authentication strategies including Google OAuth and local JWT sessions."
                        />
                    </div>
                </div>

            </section >

            {/* INTERFACE SHOWCASE (INTERACTIVE CAROUSEL) */}
            <section id="showcase" style={{ padding: '120px 0', background: '#050505', overflow: 'hidden', position: 'relative' }}>
                <div className="reveal" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', marginBottom: '60px' }}>
                    <SectionLabel>The Interface</SectionLabel>
                    <h2 style={{ fontSize: '48px', fontWeight: 800, color: 'white' }}>
                        Designed for <span style={{ color: '#00FFFF' }}>Speed.</span>
                    </h2>
                    <p style={{ fontSize: '18px', color: '#a1a1aa', marginTop: '20px' }}>
                        Every pixel is crafted to keep you in the flow. Dark mode by default.
                    </p>
                </div>

                {/* CAROUSEL */}
                {(() => {
                    const slides = [
                        { src: "/screenshots/dashboard.png", label: "Ranked Dashboard", desc: "Track your Elo, streaks, and solve history." },
                        { src: "/screenshots/lobby.png", label: "Battle Lobby", desc: "Create private rooms and invite friends instantly." },
                        { src: "/screenshots/calendar.png", label: "Smart Calendar", desc: "Syncs directly with your Google Calendar." },
                        { src: "/screenshots/tasks.png", label: "Task Synchronization", desc: "Manage Google Tasks without leaving your IDE." },
                        { src: "/screenshots/patterns.png", label: "Pattern Archives", desc: "Master 15+ coding patterns with curated lists." },
                        { src: "/screenshots/assistant.png", label: "AI Neural Core", desc: "Real-time AI assistance for complex problems." }
                    ];
                    return (
                        <div
                            className="reveal"
                            style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto', padding: '0 60px' }}
                            onMouseEnter={() => setCarouselPaused(true)}
                            onMouseLeave={() => setCarouselPaused(false)}
                        >
                            {/* PREV ARROW */}
                            <button
                                onClick={() => setCarouselIndex((carouselIndex - 1 + slides.length) % slides.length)}
                                style={{
                                    position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)',
                                    width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0,255,255,0.1)',
                                    border: '1px solid #00FFFF', color: '#00FFFF', cursor: 'pointer', zIndex: 10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#00FFFF'; e.currentTarget.style.color = '#050505'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,255,0.1)'; e.currentTarget.style.color = '#00FFFF'; }}
                            >
                                ‹
                            </button>

                            {/* SLIDES CONTAINER */}
                            <div style={{ overflow: 'hidden', borderRadius: '16px', border: '1px solid #333' }}>
                                <div style={{
                                    display: 'flex',
                                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: `translateX(-${carouselIndex * 100}%)`
                                }}>
                                    {slides.map((item, i) => (
                                        <div key={i} style={{ flex: '0 0 100%', position: 'relative' }}>
                                            <img src={item.src} alt={item.label} style={{ width: '100%', display: 'block' }} />
                                            <div style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
                                                padding: '60px 30px 30px'
                                            }}>
                                                <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{item.label}</h3>
                                                <p style={{ fontSize: '16px', color: '#a1a1aa' }}>{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* NEXT ARROW */}
                            <button
                                onClick={() => setCarouselIndex((carouselIndex + 1) % slides.length)}
                                style={{
                                    position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)',
                                    width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0,255,255,0.1)',
                                    border: '1px solid #00FFFF', color: '#00FFFF', cursor: 'pointer', zIndex: 10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#00FFFF'; e.currentTarget.style.color = '#050505'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,255,0.1)'; e.currentTarget.style.color = '#00FFFF'; }}
                            >
                                ›
                            </button>

                            {/* NAVIGATION DOTS */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '30px' }}>
                                {slides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCarouselIndex(i)}
                                        style={{
                                            width: carouselIndex === i ? '32px' : '10px', height: '10px',
                                            borderRadius: '100px', border: 'none', cursor: 'pointer',
                                            background: carouselIndex === i ? '#00FFFF' : '#333',
                                            boxShadow: carouselIndex === i ? '0 0 15px #00FFFF' : 'none',
                                            transition: 'all 0.3s'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })()}
            </section>

            {/* WALL OF LOVE (REVIEWS) */}
            <section id="reviews" style={{ padding: '120px 20px', background: '#08080a', borderTop: '1px solid #1f1f23' }}>
                <div className="reveal" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <SectionLabel>Wall of Love</SectionLabel>
                        <h2 style={{ fontSize: '48px', fontWeight: 800, color: 'white', marginBottom: '20px' }}>
                            What Developers <span style={{ color: '#FF7BAC' }}>Say.</span>
                        </h2>

                        <button
                            onClick={handleRateUsClick}
                            style={{
                                padding: '12px 30px', background: 'linear-gradient(90deg, #FF7BAC, #7c3aed)',
                                border: 'none', borderRadius: '100px', color: 'white', fontWeight: 700,
                                fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(124, 58, 237, 0.4)',
                                transition: 'transform 0.2s', display: 'inline-flex', alignItems: 'center', gap: '8px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Star fill="white" size={18} /> Rate Us
                        </button>
                    </div>

                    {/* REVIEWS GRID */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px',
                        maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                    }}>
                        {reviews.length > 0 ? reviews.map((review, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                padding: '30px', borderRadius: '20px', position: 'relative'
                            }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                                    <img
                                        src={review.user?.photos || review.user?.photoURL || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                        alt="User"
                                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>{review.user?.displayName || "Anonymous"}</div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {[...Array(5)].map((_, starI) => (
                                                <Star key={starI} size={12} fill={starI < review.rating ? "#FFB800" : "gray"} color="none" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                                    "{review.comment}"
                                </p>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#555' }}>
                                No reviews yet. Be the first to review! 🚀
                            </div>
                        )}
                    </div>
                </div>

                {/* REVIEW MODAL */}
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    userInfo={userInfo || {}}
                    onReviewSubmitted={() => {
                        fetchReviews().then(data => setReviews(data)); // Refresh reviews
                    }}
                />
            </section>
            <section style={{
                padding: '100px 20px',
                background: '#050505',
                borderTop: '1px solid rgba(0,255,255,0.1)',
                borderBottom: '1px solid rgba(0,255,255,0.1)'
            }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="stats-grid reveal" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '40px',
                        textAlign: 'center'
                    }}>
                        {[
                            { value: '500+', label: 'Problems Solved', icon: '⚡' },
                            { value: '1v1', label: 'Battle Modes', icon: '⚔️' },
                            { value: '99.9%', label: 'Uptime', icon: '🟢' },
                            { value: '< 50ms', label: 'Execution Time', icon: '🚀' }
                        ].map((stat, i) => (
                            <div key={i} className="stat-card" style={{
                                padding: '40px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid #222',
                                borderRadius: '16px',
                                transition: 'all 0.3s'
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#00FFFF';
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,255,255,0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#222';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ fontSize: '32px', marginBottom: '15px' }}>{stat.icon}</div>
                                <div style={{
                                    fontSize: '42px', fontWeight: 900, color: '#00FFFF',
                                    fontFamily: 'monospace', letterSpacing: '-2px', marginBottom: '10px'
                                }} className="counter-value">
                                    {stat.value}
                                </div>
                                <div style={{
                                    fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
                                    textTransform: 'uppercase', color: '#71717a'
                                }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STUDIO SECTION - PREMIUM DESIGN */}
            < section id="studio" style={{
                padding: '160px 20px',
                background: '#050505',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated Background Gradient Orbs */}
                <div style={{
                    position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
                    width: '600px', height: '600px',
                    background: 'radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%)',
                    filter: 'blur(60px)', pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-100px', right: '-100px',
                    width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(255,123,172,0.06) 0%, transparent 70%)',
                    filter: 'blur(50px)', pointerEvents: 'none'
                }} />

                <div className="reveal" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                    {/* Profile Avatar with Glow Ring */}
                    <div style={{
                        marginBottom: '40px',
                        display: 'inline-block',
                        position: 'relative'
                    }}>
                        <div className="avatar-glow" style={{
                            width: '120px', height: '120px',
                            borderRadius: '50%',
                            background: 'conic-gradient(from 0deg, #00FFFF, #FF7BAC, #00FFFF)',
                            padding: '3px',
                            animation: 'spin-slow 8s linear infinite'
                        }}>
                            <div style={{
                                width: '100%', height: '100%',
                                borderRadius: '50%',
                                background: '#050505',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '48px', fontWeight: 900, color: '#00FFFF'
                            }}>
                                S
                            </div>
                        </div>
                    </div>

                    <h2 style={{
                        fontSize: '12px', fontWeight: 700, letterSpacing: '4px',
                        textTransform: 'uppercase', color: '#FF7BAC', marginBottom: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px'
                    }}>
                        <span style={{ width: '30px', height: '1px', background: 'linear-gradient(90deg, transparent, #FF7BAC)' }} />
                        The Studio
                        <span style={{ width: '30px', height: '1px', background: 'linear-gradient(90deg, #FF7BAC, transparent)' }} />
                    </h2>

                    <h3 className="gradient-text-animated" style={{
                        fontSize: 'clamp(40px, 8vw, 72px)',
                        fontWeight: 900,
                        marginBottom: '30px',
                        background: 'linear-gradient(135deg, #fff 0%, #00FFFF 50%, #FF7BAC 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundSize: '200% 200%',
                        animation: 'gradient-shift 4s ease infinite'
                    }}>
                        Crafted by Somesh.
                    </h3>

                    <p style={{
                        fontSize: '18px', color: '#a1a1aa', lineHeight: '1.9',
                        marginBottom: '50px', maxWidth: '650px', margin: '0 auto 50px'
                    }}>
                        AlgoDuel is a passion project built with obsessive attention to detail —<br />
                        from <span style={{ color: '#00FFFF' }}>real-time WebSocket battles</span> to <span style={{ color: '#FF7BAC' }}>pixel-perfect UI</span>.
                    </p>

                    {/* Tech Pills */}
                    <div style={{
                        display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
                        marginBottom: '50px'
                    }}>
                        {['React', 'Node.js', 'MongoDB', 'Socket.io', 'Docker'].map((tech, i) => (
                            <span key={i} style={{
                                padding: '8px 18px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '100px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#71717a',
                                letterSpacing: '1px'
                            }}>
                                {tech}
                            </span>
                        ))}
                    </div>

                    {/* Social Links - Premium Style */}
                    <div style={{
                        display: 'flex', gap: '20px', justifyContent: 'center',
                        paddingTop: '40px',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {[
                            { label: 'GitHub', href: 'https://github.com/Somesh520', icon: '⌘' },
                            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/somesh-tiwari-236555322/', icon: '◉' },
                            { label: 'Portfolio', href: 'https://someshxd.netlify.app/', icon: '◈' }
                        ].map((link, i) => (
                            <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
                                className="studio-link"
                                style={{
                                    padding: '14px 28px',
                                    background: 'transparent',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#a1a1aa',
                                    textDecoration: 'none',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#00FFFF';
                                    e.currentTarget.style.color = '#00FFFF';
                                    e.currentTarget.style.boxShadow = '0 0 25px rgba(0,255,255,0.2)';
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#333';
                                    e.currentTarget.style.color = '#a1a1aa';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{link.icon}</span>
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </section >

            {/* FOOTER - PREMIUM DESIGN */}
            < footer style={{
                borderTop: '1px solid rgba(0,255,255,0.1)',
                background: '#050505',
                paddingTop: '100px',
                paddingBottom: '40px',
                position: 'relative'
            }}>
                {/* Top Glow Line */}
                <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '300px', height: '1px',
                    background: 'linear-gradient(90deg, transparent, #00FFFF, transparent)',
                    boxShadow: '0 0 20px #00FFFF'
                }} />

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '60px', marginBottom: '80px' }}>

                        {/* BRAND COLUMN */}
                        <div style={{ gridColumn: 'span 1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <img
                                    src="/logo.svg"
                                    alt="AlgoDuel Logo"
                                    style={{
                                        width: '36px', height: '36px',
                                        filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.3))'
                                    }}
                                />
                                <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                                    ALGO<span style={{ color: '#00FFFF' }}>DUEL</span>
                                </span>
                            </div>
                            <p style={{ color: '#71717a', fontSize: '14px', lineHeight: '1.7', marginBottom: '30px' }}>
                                The operating system for competitive developers.<br />
                                <span style={{ color: '#a1a1aa' }}>Build your rank. Prove your worth.</span>
                            </p>

                            {/* Mini CTA */}
                            <Link to="/app" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '12px 20px',
                                background: 'rgba(0,255,255,0.1)',
                                border: '1px solid rgba(0,255,255,0.3)',
                                borderRadius: '6px',
                                color: '#00FFFF',
                                fontSize: '12px',
                                fontWeight: 700,
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                textDecoration: 'none',
                                transition: 'all 0.3s'
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = '#00FFFF';
                                    e.currentTarget.style.color = '#050505';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(0,255,255,0.1)';
                                    e.currentTarget.style.color = '#00FFFF';
                                }}
                            >
                                Enter Arena →
                            </Link>
                        </div>

                        {/* PLATFORM LINKS */}
                        <div>
                            <FooterHeader>Platform</FooterHeader>
                            <FooterLink onClick={() => openModal("Live Arena", "Experience real-time 1v1 coding battles. \n\n- Synchronized Editor\n- Voice Chat Integration\n- Instant Test Case Feedback")}>Live Arena</FooterLink>
                            <FooterLink onClick={() => openModal("Problem Set", "Access our curated archive of algorithmic challenges.\n\nDifficulty levels: Easy, Medium, Hard, Nightmare.\nTopics: DP, Graphs, Trees, Strings.")}>Problem Set</FooterLink>
                            <FooterLink onClick={() => openModal("Leaderboard", "Compete for the top spot. \n\nElo Rating System: start at 1200.\nRanks: Novice, Apprentice, Expert, Master, Grandmaster.")}>Leaderboard</FooterLink>
                            <FooterLink onClick={() => openModal("IDE Features", "Pro-grade coding environment in your browser.\n\n- Monaco Editor (VS Code based)\n- Vim/Emacs Keybindings\n- Multiple Themes (Dracula, Monokai, GitHub)")}>IDE Features</FooterLink>
                        </div>

                        {/* RESOURCES LINKS */}
                        <div>
                            <FooterHeader>Resources</FooterHeader>
                            <Link to="/docs" style={{ color: '#71717a', textDecoration: 'none', fontSize: '14px', transition: 'all 0.2s', cursor: 'pointer', display: 'block', marginBottom: '12px' }} onMouseEnter={(e) => e.target.style.color = '#00FFFF'} onMouseLeave={(e) => e.target.style.color = '#71717a'}>Documentation</Link>
                            <FooterLink onClick={() => openModal("API Reference", "Our REST and WebSocket APIs are rate-limited to 100 req/min. Authentication via JWT required for all endpoints.")}>API Reference</FooterLink>
                            <FooterLink onClick={() => openModal("Guidelines", "Be respectful. No cheating. Ensure fair play. Bans are permanent for macro usage or multiple account abuse.")}>Community Guidelines</FooterLink>
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
                                    <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
                                        style={{
                                            width: '40px', height: '40px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid #222',
                                            borderRadius: '8px',
                                            color: '#71717a',
                                            textDecoration: 'none',
                                            fontSize: '16px',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = '#00FFFF';
                                            e.currentTarget.style.color = '#00FFFF';
                                            e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,255,0.2)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = '#222';
                                            e.currentTarget.style.color = '#71717a';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {link.icon}
                                    </a>
                                ))}
                            </div>
                            <p style={{ color: '#52525b', fontSize: '12px', lineHeight: '1.6' }}>
                                Built with 💻 by Somesh
                            </p>
                        </div>

                    </div>

                    {/* BOTTOM BAR */}
                    <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
                        fontSize: '11px', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
                            <span>All Systems Operational</span>
                            <span style={{ color: '#27272a' }}>•</span>
                            <span>© 2024 AlgoDuel</span>
                        </div>
                        <div style={{ display: 'flex', gap: '25px' }}>
                            <Link to="/privacy" style={{ cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'none', color: '#3f3f46' }} onMouseEnter={e => e.target.style.color = '#00FFFF'} onMouseLeave={e => e.target.style.color = '#3f3f46'}>Privacy</Link>
                            <Link to="/terms" style={{ cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'none', color: '#3f3f46' }} onMouseEnter={e => e.target.style.color = '#00FFFF'} onMouseLeave={e => e.target.style.color = '#3f3f46'}>Terms</Link>
                            <span onClick={() => openModal('Cookies', 'We use essential cookies to maintain your login session. No third-party tracking cookies are used.')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#00FFFF'} onMouseLeave={e => e.target.style.color = '#3f3f46'}>Cookies</span>
                        </div>
                    </div>
                </div>
            </footer >

            {/* INLINE STYLES FOR BUTTON HOVERS */}
            < style > {`
                .cyber-btn-primary {
                    background: white; color: black; padding: 18px 40px; border-radius: 4px;
                    font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;
                    text-decoration: none; position: relative; overflow: hidden; transition: all 0.3s;
                }
                .cyber-btn-primary:hover {
                    box-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
                    transform: translateY(-2px);
                }
                .desktop-only {
                    display: none;
                }
                @media (min-width: 768px) {
                    .desktop-only {
                        display: block;
                    }
                }

                /* FLOATING PARTICLE ANIMATION */
                @keyframes float {
                    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.3; }
                    90% { opacity: 0.3; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
                .particle {
                    pointer-events: none;
                }

                /* GLITCH TEXT EFFECT */
                .glitch-text {
                    animation: subtle-glitch 8s infinite;
                }
                .glitch-layer {
                    position: relative;
                    display: inline-block;
                }
                .glitch-text:hover .glitch-layer {
                    animation: glitch-flicker 0.3s steps(2) infinite;
                }
                @keyframes subtle-glitch {
                    0%, 90%, 100% { text-shadow: none; }
                    92% { text-shadow: -2px 0 #FF7BAC, 2px 0 #00FFFF; }
                    94% { text-shadow: 2px 0 #FF7BAC, -2px 0 #00FFFF; }
                    96% { text-shadow: none; }
                }
                @keyframes glitch-flicker {
                    0% { transform: translate(0); text-shadow: -3px 0 #FF7BAC, 3px 0 #00FFFF; }
                    25% { transform: translate(-2px, 1px); text-shadow: 3px 0 #FF7BAC, -3px 0 #00FFFF; }
                    50% { transform: translate(2px, -1px); text-shadow: -3px 0 #FF7BAC, 3px 0 #00FFFF; }
                    75% { transform: translate(-1px, 2px); text-shadow: 3px 0 #FF7BAC, -3px 0 #00FFFF; }
                    100% { transform: translate(0); text-shadow: -3px 0 #FF7BAC, 3px 0 #00FFFF; }
                }

                /* RESPONSIVE STATS GRID */
                @media (max-width: 900px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 500px) {
                    .stats-grid {
                        grid-template-columns: 1fr !important;
                        gap: 20px !important;
                    }
                    .stat-card {
                        padding: 25px !important;
                    }
                    .counter-value {
                        font-size: 32px !important;
                    }
                }

                /* SCROLL-TRIGGERED REVEAL ANIMATIONS */
                .reveal {
                    opacity: 0;
                    transform: translateY(40px);
                    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                }
                .reveal.revealed {
                    opacity: 1;
                    transform: translateY(0);
                }
                .reveal-left {
                    opacity: 0;
                    transform: translateX(-40px);
                    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                }
                .reveal-left.revealed {
                    opacity: 1;
                    transform: translateX(0);
                }
                .reveal-right {
                    opacity: 0;
                    transform: translateX(40px);
                    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                }
                .reveal-right.revealed {
                    opacity: 1;
                    transform: translateX(0);
                }
                .reveal-scale {
                    opacity: 0;
                    transform: scale(0.9);
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                }
                .reveal-scale.revealed {
                    opacity: 1;
                    transform: scale(1);
                }
                /* Staggered delay classes */
                .delay-1 { transition-delay: 0.1s; }
                .delay-2 { transition-delay: 0.2s; }
                .delay-3 { transition-delay: 0.3s; }
                .delay-4 { transition-delay: 0.4s; }

                /* STUDIO SECTION ANIMATIONS */
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style >

            {/* CONTENT MODAL */}
            {
                modalOpen && (
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

                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '20px', textTransform: 'uppercase' }}>
                                {modalContent.title}
                            </h2>
                            <div style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                {modalContent.body}
                            </div>

                            <button onClick={() => setModalOpen(false)} style={{
                                marginTop: '30px', width: '100%', padding: '12px', background: 'white', color: 'black',
                                border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase'
                            }}>
                                Close
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

// --- SUBCOMPONENTS ---

const NavBtn = ({ children, onClick }) => (
    <button
        onClick={onClick}
        style={{
            background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer',
            fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px',
            transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.target.style.color = 'white'}
        onMouseLeave={e => e.target.style.color = '#a1a1aa'}
    >
        {children}
    </button>
);

const SectionLabel = ({ children }) => (
    <div style={{
        color: '#00FFFF', fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
        textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
    }}>
        <div style={{ width: '20px', height: '1px', background: '#00FFFF' }} />
        {children}
    </div>
);

const JourneyCard = ({ num, title, desc }) => (
    <div style={{
        background: '#121214', border: '1px solid #27272a', padding: '40px',
        borderRadius: '16px', position: 'relative', overflow: 'hidden',
        transition: 'transform 0.3s'
    }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#00FFFF'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#27272a'}
    >
        <div style={{
            fontSize: '80px', fontWeight: 900, color: 'rgba(255, 255, 255, 0.03)',
            position: 'absolute', top: -20, right: -10, pointerEvents: 'none'
        }}>
            {num}
        </div>
        <div style={{
            color: '#00FFFF', fontSize: '14px', fontWeight: 700, marginBottom: '16px',
            textTransform: 'uppercase', letterSpacing: '2px'
        }}>
            Step {num}
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>{title}</h3>
        <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

const FeatureCard = ({ icon, title, tech, desc }) => (
    <div style={{
        background: '#0a0a0c', border: '1px solid #1f1f23', padding: '32px',
        borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px',
        transition: 'border-color 0.3s'
    }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#1f1f23'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: '#121214', borderRadius: '8px' }}>{icon}</div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#3f3f46', border: '1px solid #27272a', padding: '4px 8px', borderRadius: '100px' }}>{tech}</span>
        </div>
        <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{title}</h3>
            <p style={{ fontSize: '14px', color: '#71717a', lineHeight: '1.5' }}>{desc}</p>
        </div>
    </div>
);

const SocialLink = ({ label, href }) => (
    <a href={href} style={{
        color: '#71717a', textDecoration: 'none', fontSize: '12px', fontWeight: 700,
        letterSpacing: '1px', transition: 'color 0.2s'
    }}
        onMouseEnter={e => e.target.style.color = 'white'}
        onMouseLeave={e => e.target.style.color = '#71717a'}>
        {label}
    </a>
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

const SocialIcon = ({ children }) => (
    <div style={{
        width: '32px', height: '32px', borderRadius: '50%', background: '#121214',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa',
        border: '1px solid #1f1f23', cursor: 'pointer', transition: 'all 0.2s'
    }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#00FFFF'; e.currentTarget.style.color = '#00FFFF'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f1f23'; e.currentTarget.style.color = '#a1a1aa'; }}>
        {children}
    </div>
);



export default LandingPage;
