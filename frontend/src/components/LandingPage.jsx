import React, { useEffect } from 'react';
import { Code2, Swords, Zap, Trophy, TrendingUp, Users, Terminal, Github, Twitter, Linkedin } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {

    // Smooth Scroll Helper
    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#09090b',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            overflowY: 'auto',
            scrollBehavior: 'smooth'
        }}>
            {/* NAVBAR */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                padding: '20px 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(9, 9, 11, 0.9)', // Solid-ish background for performance (removed blur)
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                zIndex: 100
            }}>
                <div style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-1px', cursor: 'pointer' }} onClick={() => scrollToSection('hero')}>
                    <span style={{ color: '#22c55e' }}>Algo</span>Duel.
                </div>
                <div style={{ display: 'flex', gap: '30px', fontSize: '14px', fontWeight: 500, color: '#a1a1aa' }}>
                    <button onClick={() => scrollToSection('purpose')} style={navLinkStyle}>Purpose</button>
                    <button onClick={() => scrollToSection('workflow')} style={navLinkStyle}>How it Works</button>
                    <button onClick={() => scrollToSection('about')} style={navLinkStyle}>About Us</button>
                </div>
                <button
                    onClick={onGetStarted}
                    style={{
                        padding: '8px 20px', fontSize: '13px', fontWeight: 600,
                        background: '#22c55e', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer',
                        transition: 'transform 0.1s'
                    }}
                >
                    Play Now
                </button>
            </nav>

            {/* HERO SECTION */}
            <section id="hero" style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Optimized Background (Reduced Blurs) */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(#1f1f23 1px, transparent 1px), linear-gradient(90deg, #1f1f23 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.05, zIndex: 0 }} />

                {/* Single optimized glow blob */}
                <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: '#22c55e', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ zIndex: 10, textAlign: 'center', marginTop: '60px', padding: '0 20px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '10px',
                        background: 'rgba(39, 39, 42, 0.5)', border: '1px solid #3f3f46',
                        padding: '8px 16px', borderRadius: '100px', marginBottom: '30px',
                    }}>
                        <span style={{ display: 'flex', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#d4d4d8', letterSpacing: '0.5px' }}>LIVE MULTIPLAYER CODING</span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(50px, 8vw, 90px)', fontWeight: '900', margin: '0',
                        lineHeight: '1.1', letterSpacing: '-3px',
                        background: 'linear-gradient(to bottom right, #ffffff 40%, #94a3b8 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        ALGO DUEL
                    </h1>

                    <p style={{ fontSize: '18px', color: '#a1a1aa', maxWidth: '600px', margin: '24px auto 40px', lineHeight: '1.6' }}>
                        The ultimate 1v1 coding arena. Battle friends, solve algorithms, and master data structures in real-time.
                    </p>

                    <button
                        onClick={onGetStarted}
                        style={{
                            padding: '18px 40px', fontSize: '18px', fontWeight: '700',
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto',
                            boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.2)'
                        }}
                    >
                        <Zap fill="white" size={20} /> ENTER THE ARENA
                    </button>

                    {/* Features Row */}
                    <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', opacity: 0.9 }}>
                        <Feature icon={<Swords color="#ef4444" />} text="1v1 Battles" />
                        <Feature icon={<Code2 color="#3b82f6" />} text="Real-time IDE" />
                        <Feature icon={<Trophy color="#eab308" />} text="Global Rank" />
                    </div>
                </div>
            </section>

            {/* PURPOSE SECTION */}
            <section id="purpose" style={sectionStyle}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={sectionTitleStyle}>Why Algo Duel?</h2>
                    <p style={{ color: '#a1a1aa', fontSize: '18px', lineHeight: '1.8', maxWidth: '700px', margin: '0 auto 60px' }}>
                        Coding interviews are stressful. Solo practice is boring.
                        <span style={{ color: 'white', fontWeight: 600 }}> Algo Duel</span> simulates high-pressure environments to help you master DSA faster.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <Card icon={<Terminal color="#3b82f6" size={32} />} title="Real-Time IDE" desc="Synchronized code execution with instant feedback. It's like Google Docs for code." />
                        <Card icon={<Users color="#ef4444" size={32} />} title="Voice Chat" desc="Discuss approaches live. In real interviews, communication matters as much as code." />
                        <Card icon={<TrendingUp color="#eab308" size={32} />} title="Skill Growth" desc="Turning practice into a game makes you consistent. Consistency is the key to mastery." />
                    </div>
                </div>
            </section>

            {/* WORKFLOW SECTION */}
            <section id="workflow" style={{ ...sectionStyle, background: '#0c0c0e' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ ...sectionTitleStyle, textAlign: 'center' }}>How It Works</h2>
                    <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <Step number="01" title="Create a Room" desc="Start a new lobby. Select your topic (Arrays, DP, Graphs) and difficulty." />
                        <Step number="02" title="Invite a Friend" desc="Share your unique room link. They join instantly without sign-up." />
                        <Step number="03" title="Battle Begins" desc="Both players get the same problem. The timer starts. Talk via voice chat!" />
                        <Step number="04" title="Write & Run" desc="Write solution in the shared IDE. Run test cases to verify logic." />
                        <Step number="05" title="Submit & Win" desc="Pass all hidden test cases first to trigger the victory screen." />
                    </div>
                </div>
            </section>

            {/* ABOUT US SECTION */}
            <section id="about" style={{ ...sectionStyle, paddingBottom: '100px' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={sectionTitleStyle}>About Us</h2>
                    <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                        Algo Duel is a passion project built to redefine interview prep.
                    </p>

                    <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', border: '1px solid #27272a', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: '#27272a', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#52525b' }}>
                            ST
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '5px', color: 'white' }}>Somesh Tiwari</h3>
                        <p style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>Creator</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            <a href="https://github.com/Somesh520" target="_blank" rel="noreferrer" style={socialBtnStyle}><Github size={18} /></a>
                            <a href="#" style={socialBtnStyle}><Twitter size={18} /></a>
                            <a href="#" style={socialBtnStyle}><Linkedin size={18} /></a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: '40px', textAlign: 'center', borderTop: '1px solid #1f1f23', color: '#52525b', fontSize: '13px' }}>
                © 2024 Algo Duel. Built by Somesh.
            </footer>
        </div>
    );
};

// --- STYLES & COMPONENTS ---

const navLinkStyle = {
    background: 'transparent', border: 'none', color: '#a1a1aa',
    cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s'
};

const sectionStyle = {
    padding: '120px 20px',
    borderTop: '1px solid #1f1f23'
};

const sectionTitleStyle = {
    fontSize: '40px', fontWeight: 800, marginBottom: '20px', letterSpacing: '-1px'
};

const Card = ({ icon, title, desc }) => (
    <div style={{ background: '#121214', padding: '30px', borderRadius: '16px', border: '1px solid #27272a', textAlign: 'left', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ marginBottom: '15px' }}>{icon}</div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'white' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#71717a', lineHeight: '1.5' }}>{desc}</p>
    </div>
);

const Step = ({ number, title, desc }) => (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
            {number}
        </div>
        <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 5px 0', color: '#e4e4e7' }}>{title}</h3>
            <p style={{ fontSize: '14px', color: '#a1a1aa', margin: 0, lineHeight: '1.5' }}>{desc}</p>
        </div>
    </div>
);

const Feature = ({ icon, text }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {icon}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#d4d4d8' }}>{text}</span>
    </div>
);

const socialBtnStyle = {
    color: '#a1a1aa', padding: '8px', borderRadius: '8px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', textDecoration: 'none'
};

export default LandingPage;
