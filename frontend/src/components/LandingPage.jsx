import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Swords, Zap, Trophy, TrendingUp, Users, Terminal, Github, Twitter, Linkedin, ChevronRight, Play } from 'lucide-react';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
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
            background: '#080808',
            color: 'white',
            fontFamily: "'Inter', sans-serif", // Ideally DINPro, but Inter Tight works
            overflowX: 'hidden'
        }}>
            {/* NAVBAR */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                padding: '15px 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: scrolled ? 'rgba(8, 8, 8, 0.95)' : 'transparent',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'all 0.3s ease',
                zIndex: 100,
                height: '80px'
            }}>
                <div
                    onClick={() => scrollToSection('hero')}
                    style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #00FFFF, #FF7BAC)', borderRadius: '50%' }} />
                    <span style={{ color: 'white', fontFamily: 'monospace', letterSpacing: '-1px' }}>TECHNIKA<span style={{ color: '#00FFFF' }}>.DEV</span></span>
                </div>

                <div style={{ display: 'flex', gap: '40px', fontSize: '14px', fontWeight: 600, color: '#d4d4d8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <button onClick={() => scrollToSection('purpose')} style={navLinkStyle}>Mission</button>
                    <button onClick={() => scrollToSection('workflow')} style={navLinkStyle}>Process</button>
                    <button onClick={() => scrollToSection('about')} style={navLinkStyle}>Studio</button>
                </div>

                <Link
                    to="/app"
                    style={{
                        padding: '12px 28px', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                        background: 'transparent', color: '#00FFFF', border: '1px solid #00FFFF', borderRadius: '100px', cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#00FFFF'; e.currentTarget.style.color = 'black'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#00FFFF'; }}
                >
                    Launch <ChevronRight size={14} />
                </Link>
            </nav>

            {/* HERO SECTION */}
            <section id="hero" style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden', paddingTop: '80px'
            }}>
                {/* Technika "Orb" Background */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'linear-gradient(135deg, #00FFFF 0%, #FF7BAC 100%)', opacity: 0.15, filter: 'blur(150px)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ zIndex: 10, textAlign: 'center', padding: '0 20px', maxWidth: '1200px' }}>
                    <div style={{
                        display: 'inline-block', marginBottom: '40px',
                        border: '1px solid rgba(255,255,255,0.1)', padding: '8px 24px', borderRadius: '100px',
                        fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#B6A1C4'
                    }}>
                        The Future of Competitive Coding
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(60px, 9vw, 130px)', fontWeight: '800', margin: '0',
                        lineHeight: '0.9', letterSpacing: '-4px', textTransform: 'uppercase',
                        color: 'white', marginBottom: '40px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                        Build.<br />
                        <span style={{
                            background: 'linear-gradient(to right, #00FFFF, #FF7BAC)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>Battle.</span> Win.
                    </h1>

                    <p style={{ fontSize: '22px', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto 60px', lineHeight: '1.5', fontWeight: 300 }}>
                        Experience the new standard in algorithmic duels. <br />Real-time. Multiplayer. Unforgiving.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <Link
                            to="/app"
                            style={{
                                padding: '24px 60px', fontSize: '16px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase',
                                background: 'white', color: 'black', border: 'none', borderRadius: '100px',
                                cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                textDecoration: 'none'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <Play fill="black" size={18} /> Enter The Arena
                        </Link>
                    </div>
                </div>
            </section>

            {/* PURPOSE SECTION (Grid) */}
            <section id="purpose" style={sectionStyle}>
                <div style={containerStyle}>
                    <div style={{ marginBottom: '80px', borderLeft: '4px solid #00FFFF', paddingLeft: '30px' }}>
                        <h2 style={sectionTitleStyle}>Precision<br />Engineering.</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', background: '#27272a', border: '1px solid #27272a' }}>
                        <TechnikaCard
                            icon={<Terminal size={32} color="#00FFFF" />}
                            title="Shared IDE"
                            desc="Synchronized Monaco Editor environment."
                            colSpan={2}
                        />
                        <TechnikaCard
                            icon={<Users size={32} color="#FF7BAC" />}
                            title="Voice Link"
                            desc="Low-latency audio channels."
                            colSpan={1}
                        />
                        <TechnikaCard
                            icon={<TrendingUp size={32} color="#B6A1C4" />}
                            title="Analytics"
                            desc="Deep performance metrics."
                            colSpan={1}
                        />
                        <TechnikaCard
                            icon={<Zap size={32} color="#ffffff" />}
                            title="Instant Exec"
                            desc="Server-side execution in <50ms."
                            colSpan={2}
                        />
                    </div>
                </div>
            </section>

            {/* WORKFLOW SECTION */}
            <section id="workflow" style={{ ...sectionStyle, background: '#0a0a0c' }}>
                <div style={containerStyle}>
                    <div style={{ marginBottom: '80px', borderLeft: '4px solid #FF7BAC', paddingLeft: '30px' }}>
                        <h2 style={sectionTitleStyle}>System<br />Workflow.</h2>
                    </div>

                    <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
                        <Step number="01" title="Initialize" desc="Create Lobby" color="#00FFFF" />
                        <Step number="02" title="Connect" desc="Invite Peer" color="#FF7BAC" />
                        <Step number="03" title="Execute" desc="Solve Problem" color="#B6A1C4" />
                        <Step number="04" title="Terminate" desc="Win & Rank Up" color="#ffffff" />
                    </div>
                </div>
            </section>

            {/* ABOUT US SECTION */}
            <section id="about" style={{ ...sectionStyle, paddingBottom: '160px' }}>
                <div style={{ ...containerStyle, textAlign: 'center' }}>
                    <h2 style={{ ...sectionTitleStyle, textAlign: 'center', fontSize: '40px' }}>Designed by Somesh.</h2>

                    <div style={{
                        marginTop: '60px',
                        background: '#121214',
                        padding: '60px', borderRadius: '0',
                        borderTop: '1px solid #00FFFF',
                        display: 'inline-block', maxWidth: '600px', width: '100%',
                    }}>
                        <div style={{ fontSize: '60px', marginBottom: '30px' }}>✦</div>
                        <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px', color: 'white', textTransform: 'uppercase', letterSpacing: '2px' }}>Somesh Tiwari</h3>
                        <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '40px', fontFamily: 'monospace' }}>FULL STACK ARCHITECT</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                            <SocialLink icon={<Github size={20} />} href="https://github.com/Somesh520" />
                            <SocialLink icon={<Twitter size={20} />} href="#" />
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: '80px 0', borderTop: '1px solid #1f1f23', textAlign: 'center', color: '#52525b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                © 2024 TECHNIKA.DEV / ALGODUEL.
            </footer>
        </div>
    );
};

// --- STYLES & COMPONENTS ---

const navLinkStyle = {
    background: 'transparent', border: 'none', color: '#a1a1aa',
    cursor: 'pointer', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s', padding: '0 10px'
};

const sectionStyle = { padding: '160px 20px' };
const containerStyle = { maxWidth: '1200px', margin: '0 auto' };
const sectionTitleStyle = { fontSize: '80px', fontWeight: 800, margin: 0, letterSpacing: '-3px', lineHeight: '0.9', textTransform: 'uppercase', color: 'white' };
const sectionDescStyle = { fontSize: '24px', color: '#a1a1aa', maxWidth: '600px', lineHeight: '1.4' };

const TechnikaCard = ({ icon, title, desc, colSpan }) => (
    <div style={{
        gridColumn: `span ${colSpan}`,
        background: '#080808', padding: '60px 40px',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden'
    }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#0e0e0e'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#080808'}
    >
        <div style={{ marginBottom: '40px' }}>{icon}</div>
        <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h3>
            <p style={{ fontSize: '15px', color: '#71717a', lineHeight: '1.6', margin: 0 }}>{desc}</p>
        </div>
    </div>
);

const Step = ({ number, title, desc, color }) => (
    <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: color, marginBottom: '20px', fontFamily: 'monospace' }}>{number}</div>
        <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px', color: 'white', textTransform: 'uppercase' }}>{title}</h3>
        <p style={{ color: '#71717a', fontSize: '15px' }}>{desc}</p>
    </div>
);

const SocialLink = ({ icon, href }) => (
    <a href={href} target="_blank" rel="noreferrer" style={{
        color: 'white', padding: '16px', borderRadius: '50%', background: '#18181b',
        transition: 'all 0.2s', display: 'flex', border: '1px solid #27272a'
    }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00FFFF'; e.currentTarget.style.color = '#00FFFF'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = 'white'; }}
    >
        {icon}
    </a>
);

export default LandingPage;
