import React, { useEffect, useState } from 'react';
import { Code2, Swords, Zap, Trophy, TrendingUp, Users, Terminal, Github, Twitter, Linkedin, ChevronRight, Play } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            // Native offset calculation
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
            // Removed fixed height/overflow to use native window scroll
        }}>
            {/* NAVBAR */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                padding: '15px 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: scrolled ? 'rgba(5, 5, 5, 0.95)' : 'transparent', // Solid background on scroll for performance
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'background 0.2s ease', // Faster transition
                zIndex: 100,
                height: '70px'
            }}>
                <div
                    onClick={() => scrollToSection('hero')}
                    style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '-1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <div style={{ width: '20px', height: '20px', background: '#22c55e', borderRadius: '6px', transform: 'rotate(45deg)' }} />
                    <span style={{ color: 'white' }}>AlgoDuel</span>
                </div>

                <div style={{ display: 'flex', gap: '40px', fontSize: '15px', fontWeight: 500, color: '#a1a1aa' }}>
                    <button onClick={() => scrollToSection('purpose')} style={navLinkStyle}>Mission</button>
                    <button onClick={() => scrollToSection('workflow')} style={navLinkStyle}>How it Works</button>
                    <button onClick={() => scrollToSection('about')} style={navLinkStyle}>Creators</button>
                </div>

                <button
                    onClick={onGetStarted}
                    style={{
                        padding: '12px 24px', fontSize: '14px', fontWeight: 600,
                        background: 'white', color: 'black', border: 'none', borderRadius: '100px', cursor: 'pointer',
                        transition: 'transform 0.2s',
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Start Coding <ChevronRight size={16} />
                </button>
            </nav>

            {/* HERO SECTION */}
            <section id="hero" style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden', paddingTop: '80px'
            }}>
                {/* Clean Background */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, #22c55e 0%, transparent 40%)', opacity: 0.15, filter: 'blur(120px)', pointerEvents: 'none' }} />

                <div style={{ zIndex: 10, textAlign: 'center', padding: '0 20px', maxWidth: '1000px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '100px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: '40px', fontSize: '13px', color: '#a1a1aa', fontWeight: 500
                    }}>
                        <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }} />
                        Real-time 1v1 Coding Battles
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(60px, 8vw, 110px)', fontWeight: '900', margin: '0',
                        lineHeight: '0.95', letterSpacing: '-4px',
                        background: 'linear-gradient(180deg, #fff 0%, #71717a 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        marginBottom: '30px'
                    }}>
                        CODE. COMPETE.<br />CONQUER.
                    </h1>

                    <p style={{ fontSize: '20px', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto 50px', lineHeight: '1.6', fontWeight: 400 }}>
                        The most immersive competitive programming platform. Challenge friends to live algorithm duels in a synchronized IDE.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <button
                            onClick={onGetStarted}
                            style={{
                                padding: '20px 50px', fontSize: '18px', fontWeight: '700',
                                background: '#22c55e', color: 'black', border: 'none', borderRadius: '16px',
                                cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(34, 197, 94, 0.5)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <Play fill="black" size={20} /> Enter Arena
                        </button>
                    </div>
                </div>

                {/* Floating Stats / Elements */}
                <div style={{ marginTop: '100px', display: 'flex', gap: '80px', opacity: 0.5, filter: 'grayscale(100%)' }}>
                    <div style={statStyle}><strong>10K+</strong> Battles</div>
                    <div style={statStyle}><strong>50+</strong> Problems</div>
                    <div style={statStyle}><strong>0ms</strong> Latency</div>
                </div>
            </section>

            {/* PURPOSE SECTION (Bento Grid) */}
            <section id="purpose" style={sectionStyle}>
                <div style={containerStyle}>
                    <h2 style={sectionTitleStyle}>Reinventing Practice.</h2>
                    <p style={sectionDescStyle}>Use pressure to your advantage. AlgoDuel turns anxiety into adrenaline.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '60px' }}>
                        <BentoCard
                            icon={<Terminal size={40} color="#3b82f6" />}
                            title="Shared IDE"
                            desc="Real-time synchronized editor. See every keystroke your opponent types."
                            colSpan={2}
                        />
                        <BentoCard
                            icon={<Users size={40} color="#ef4444" />}
                            title="Voice Chat"
                            desc="Communication is key. Built-in low latency voice channels."
                            colSpan={1}
                        />
                        <BentoCard
                            icon={<TrendingUp size={40} color="#eab308" />}
                            title="Analytics"
                            desc="Track your win rate and improve."
                            colSpan={1}
                        />
                        <BentoCard
                            icon={<Zap size={40} color="#22c55e" />}
                            title="Instant Feedback"
                            desc="Run test cases instantly. Visualize execution. Debug faster."
                            colSpan={2}
                        />
                    </div>
                </div>
            </section>

            {/* WORKFLOW SECTION */}
            <section id="workflow" style={{ ...sectionStyle, background: '#0a0a0c' }}>
                <div style={containerStyle}>
                    <h2 style={sectionTitleStyle}>How It Works</h2>
                    <div style={{ marginTop: '80px', position: 'relative' }}>
                        {/* Vertical Line */}
                        <div style={{ position: 'absolute', left: '24px', top: '0', bottom: '0', width: '2px', background: '#27272a' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                            <TimelineStep number="01" title="Create Lobby" desc="Start a room. Pick your topic (DP, Trees, Arrays)." />
                            <TimelineStep number="02" title="Share Link" desc="Send the unique invite link to a peer." />
                            <TimelineStep number="03" title="Code & Communicate" desc="Solve the problem while explaining your approach." />
                            <TimelineStep number="04" title="Victory" desc="Pass all test cases first to climb the leaderboard." />
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT US SECTION */}
            <section id="about" style={{ ...sectionStyle, paddingBottom: '160px' }}>
                <div style={{ ...containerStyle, textAlign: 'center' }}>
                    <h2 style={sectionTitleStyle}>Built by Developers.</h2>
                    <p style={{ ...sectionDescStyle, margin: '0 auto 80px' }}>We built the tool we wished we had during our interview prep.</p>

                    <div style={{
                        background: 'linear-gradient(145deg, #18181b, #09090b)',
                        padding: '60px', borderRadius: '32px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'inline-block', maxWidth: '500px', width: '100%',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #22c55e, transparent)' }} />

                        <div style={{ fontSize: '80px', color: '#3f3f46', marginBottom: '20px' }}>👨‍💻</div>
                        <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'white' }}>Somesh Tiwari</h3>
                        <p style={{ color: '#22c55e', fontSize: '16px', fontWeight: 600, marginBottom: '30px' }}>Lead Engineer</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                            <SocialLink icon={<Github size={24} />} href="https://github.com/Somesh520" />
                            <SocialLink icon={<Twitter size={24} />} href="#" />
                            <SocialLink icon={<Linkedin size={24} />} href="#" />
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: '60px 0', borderTop: '1px solid #1f1f23', textAlign: 'center', color: '#52525b', fontSize: '14px' }}>
                <div style={{ marginBottom: '20px', fontWeight: 700, fontSize: '20px', color: 'white' }}>AlgoDuel.</div>
                © 2024. All rights reserved.
            </footer>
        </div>
    );
};

// --- STYLES & COMPONENTS ---

const navLinkStyle = {
    background: 'transparent', border: 'none', color: '#a1a1aa',
    cursor: 'pointer', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s', padding: '0 10px'
};

const sectionStyle = { padding: '160px 20px' };
const containerStyle = { maxWidth: '1200px', margin: '0 auto' };
const sectionTitleStyle = { fontSize: '56px', fontWeight: 800, marginBottom: '20px', letterSpacing: '-2px', lineHeight: '1.1' };
const sectionDescStyle = { fontSize: '20px', color: '#a1a1aa', maxWidth: '600px', lineHeight: '1.6' };
const statStyle = { fontSize: '18px', color: '#71717a' };

const BentoCard = ({ icon, title, desc, colSpan }) => (
    <div style={{
        gridColumn: `span ${colSpan}`,
        background: '#121214', padding: '40px', borderRadius: '24px',
        border: '1px solid #27272a', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', minHeight: '300px',
        transition: 'transform 0.3s', cursor: 'default'
    }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div style={{ background: 'rgba(255,255,255,0.05)', width: 'fit-content', padding: '16px', borderRadius: '16px' }}>{icon}</div>
        <div>
            <h3 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: 'white' }}>{title}</h3>
            <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: '1.6', margin: 0 }}>{desc}</p>
        </div>
    </div>
);

const TimelineStep = ({ number, title, desc }) => (
    <div style={{ display: 'flex', gap: '40px', alignItems: 'center', position: 'relative', paddingLeft: '24px' }}>
        <div style={{
            width: '48px', height: '48px', borderRadius: '50%', background: '#09090b',
            border: '2px solid #22c55e', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '16px', zIndex: 10
        }}>
            {number}
        </div>
        <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', color: 'white' }}>{title}</h3>
            <p style={{ fontSize: '17px', color: '#a1a1aa', margin: 0 }}>{desc}</p>
        </div>
    </div>
);

const SocialLink = ({ icon, href }) => (
    <a href={href} target="_blank" rel="noreferrer" style={{
        color: '#a1a1aa', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
        transition: 'all 0.2s', display: 'flex'
    }}>
        {icon}
    </a>
);

export default LandingPage;
