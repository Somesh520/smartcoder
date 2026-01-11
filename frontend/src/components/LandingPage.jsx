import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Code2, Swords, Zap, Trophy, TrendingUp, Users, Terminal,
    Github, Twitter, ChevronRight, Play, Server, Database,
    Globe, Cpu, Cpu as Microchip
} from 'lucide-react';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });

    const openModal = (title, body) => {
        setModalContent({ title, body });
        setModalOpen(true);
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            {/* NAVBAR */}
            <nav style={{
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
                    <div style={{
                        width: '32px', height: '32px',
                        background: 'conic-gradient(from 180deg at 50% 50%, #00FFFF 0deg, #FF7BAC 180deg, #00FFFF 360deg)',
                        borderRadius: '8px',
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
                    }} />
                    <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
                        ALGO<span style={{ color: '#00FFFF' }}>DUEL</span>
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '40px', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <NavBtn onClick={() => scrollToSection('mission')}>Mission</NavBtn>
                    <NavBtn onClick={() => scrollToSection('workflow')}>Architecture</NavBtn>
                    <NavBtn onClick={() => scrollToSection('features')}>Engine</NavBtn>
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
                {/* Background Grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
                    zIndex: 0
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

                    <h1 style={{
                        fontSize: 'clamp(50px, 8vw, 120px)', fontWeight: '900', margin: '0 0 20px 0',
                        lineHeight: '0.9', letterSpacing: '-0.04em', textTransform: 'uppercase',
                        color: 'white', fontFamily: "'Inter', sans-serif"
                    }}>
                        Build. Battle.<br />
                        <span style={{
                            color: 'transparent', WebkitTextStroke: '2px #FF7BAC',
                            background: 'linear-gradient(180deg, #FF7BAC 0%, transparent 100%)',
                            WebkitBackgroundClip: 'text', opacity: 0.8
                        }}>Dominate.</span>
                    </h1>

                    <p style={{ fontSize: '18px', color: '#71717a', maxWidth: '500px', margin: '0 auto 50px', lineHeight: '1.6' }}>
                        The ultimate competitive programming arena. <br />
                        <span style={{ color: '#d4d4d8' }}>Real-time execution. Multiplayer sync. Zero latency.</span>
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <Link to="/app" className="cyber-btn-primary">
                            <span className="btn-content">Enter The Arena <Play fill="black" size={14} /></span>
                        </Link>
                    </div>
                </div>

                {/* Floating Code Snippet Effect */}
                <div className="desktop-only" style={{
                    position: 'absolute', bottom: '40px', right: '40px',
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
                    <SectionLabel>The Mission</SectionLabel>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginBottom: '120px' }}>
                        <div>
                            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '20px', lineHeight: '1.2' }}>
                                The Problem.<br />
                                <span style={{ color: '#71717a' }}>Coding is lonely.</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: '1.7' }}>
                                Traditional competitive programming is a solitary experience. You, a static IDE, and a silent judge.
                                There's no adrenaline. No real-time pressure. No human connection.
                                <br /><br />
                                It's effective, but it lacks the thrill of a real duel.
                            </p>
                        </div>
                        <div>
                            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '20px', lineHeight: '1.2' }}>
                                The Solution.<br />
                                <span style={{ color: '#00FFFF' }}>Gamified Warfare.</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: '1.7' }}>
                                AlgoDuel transforms algorithms into a spectator sport. We drop two developers into a
                                <strong> synchronized 1v1 arena</strong>.
                                <br /><br />
                                It's not just about solving the problem—it's about solving it <em>faster</em> than the person breathing down your neck via Voice Chat.
                            </p>
                        </div>
                    </div>

                    <div style={{ background: '#0a0a0c', border: '1px solid #1f1f23', borderRadius: '24px', padding: '60px', textAlign: 'center' }}>
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
            <section id="journey" style={{ padding: '120px 20px', background: '#080808' }}>
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
            <section id="workflow" style={{ padding: '120px 20px', background: '#080808' }}>
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

            {/* STUDIO SECTION */}
            < section id="studio" style={{ padding: '160px 20px', background: 'radial-gradient(circle at 50% 10%, #111, #050505)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#FF7BAC', marginBottom: '20px' }}>
                        The Studio
                    </h2>
                    <h3 style={{ fontSize: '60px', fontWeight: 900, marginBottom: '40px', color: 'white' }}>
                        Designed by Somesh.
                    </h3>
                    <p style={{ fontSize: '18px', color: '#a1a1aa', lineHeight: '1.8', marginBottom: '60px' }}>
                        AlgoDuel is a project born from a passion for high-performance systems and competitive coding.
                        Crafted with attention to detail, from the database schema to the pixel-perfect UI.
                    </p>

                    <div style={{ display: 'inline-flex', gap: '20px', borderTop: '1px solid #333', paddingTop: '40px' }}>
                        <SocialLink label="GITHUB" href="https://github.com/Somesh520" />
                        <SocialLink label="LINKEDIN" href="#" />
                        <SocialLink label="PORTFOLIO" href="#" />
                    </div>
                </div>
            </section >

            {/* FOOTER */}
            < footer style={{ borderTop: '1px solid #1f1f23', background: '#080808', paddingTop: '80px', paddingBottom: '40px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px', marginBottom: '80px' }}>

                        {/* BRAND COLUMN */}
                        <div style={{ gridColumn: 'span 1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ width: '24px', height: '24px', background: '#00FFFF', borderRadius: '6px' }} />
                                <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>ALGODUEL</span>
                            </div>
                            <p style={{ color: '#71717a', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                                The operating system for competitive developers. Build your rank. Prove your worth.
                            </p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <SocialIcon><Twitter size={16} /></SocialIcon>
                                <SocialIcon><Github size={16} /></SocialIcon>
                                <SocialIcon><Globe size={16} /></SocialIcon>
                            </div>
                        </div>

                        {/* LINKS COLUMNS */}
                        <div>
                            <FooterHeader>Platform</FooterHeader>
                            <FooterLink onClick={() => openModal("Live Arena", "Experience real-time 1v1 coding battles. \n\n- Synchronized Editor\n- Voice Chat Integration\n- Instant Test Case Feedback")}>Live Arena</FooterLink>
                            <FooterLink onClick={() => openModal("Problem Set", "Access our curated archive of algorithmic challenges.\n\nDifficulty levels: Easy, Medium, Hard, Nightmare.\nTopics: DP, Graphs, Trees, Strings.")}>Problem Set</FooterLink>
                            <FooterLink onClick={() => openModal("Leaderboard", "Compete for the top spot. \n\nElo Rating System: start at 1200.\nRanks: Novice, Apprentice, Expert, Master, Grandmaster.")}>Leaderboard</FooterLink>
                            <FooterLink onClick={() => openModal("IDE Features", "Pro-grade coding environment in your browser.\n\n- Monaco Editor (VS Code based)\n- Vim/Emacs Keybindings\n- Multiple Themes (Dracula, Monokai, GitHub)")}>IDE Features</FooterLink>
                        </div>

                        <div>
                            <FooterHeader>Resources</FooterHeader>
                            <FooterLink onClick={() => openModal("Documentation", "Full system documentation including WebSocket event specifications and Docker container constraints is available in our developer portal (Coming Soon).")}>Documentation</FooterLink>
                            <FooterLink onClick={() => openModal("API Reference", "Our REST and WebSocket APIs are rate-limited to 100 req/min. Authentication via JWT required for all endpoints.")}>API Reference</FooterLink>
                            <FooterLink onClick={() => openModal("Guidelines", "Be respectful. No cheating. Ensure fair play. Bans are permanent for macro usage or multiple account abuse.")}>Community Guidelines</FooterLink>
                            <FooterLink onClick={() => openModal("System Status", "All Systems Operational. 99.9% Uptime this month.\n\n- Matchmaking: ONLINE\n- Execution Engine: ONLINE\n- Voice Server: ONLINE")}>System Status</FooterLink>
                        </div>


                    </div>

                    {/* BOTTOM BAR */}
                    <div style={{
                        borderTop: '1px solid #1f1f23', paddingTop: '40px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
                        fontSize: '12px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600
                    }}>
                        <div>
                            © 2024 AlgoDuel System. All rights reserved.
                        </div>
                        <div style={{ display: 'flex', gap: '30px' }}>
                            <span onClick={() => openModal('Privacy Policy', 'We value your privacy. We collect minimal data (username, email) solely for authentication and matchmaking purposes. We do not sell your data.')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#52525b'}>Privacy Policy</span>
                            <span onClick={() => openModal('Terms of Service', 'By using AlgoDuel, you agree to our fair play rules. No cheating, no macros, no abuse. Violations result in immediate bans.')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#52525b'}>Terms of Service</span>
                            <span onClick={() => openModal('Cookies', 'We use essential cookies to maintain your login session. No third-party tracking cookies are used.')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#52525b'}>Cookies</span>
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
