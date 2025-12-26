import React from 'react';
import { Code2, Swords, Zap, Trophy, ChevronRight } from 'lucide-react';

const LandingPage = ({ onNavigate, onGetStarted }) => {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#09090b',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* NAVBAR */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                padding: '20px 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backdropFilter: 'blur(10px)',
                background: 'rgba(9, 9, 11, 0.6)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                zIndex: 100
            }}>
                <div style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-1px' }}>
                    <span style={{ color: '#22c55e' }}>Algo</span>Duel.
                </div>
                <div style={{ display: 'flex', gap: '30px', fontSize: '14px', fontWeight: 500, color: '#a1a1aa' }}>
                    <button onClick={() => onNavigate('purpose')} style={navLinkStyle}>Purpose</button>
                    <button onClick={() => onNavigate('workflow')} style={navLinkStyle}>How it Works</button>
                    <button onClick={() => onNavigate('about')} style={navLinkStyle}>About Us</button>
                </div>
                <button
                    onClick={onGetStarted}
                    style={{
                        padding: '8px 20px', fontSize: '13px', fontWeight: 600,
                        background: '#22c55e', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer'
                    }}
                >
                    Play Now
                </button>
            </nav>

            {/* Background Grid & Glows */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'linear-gradient(#1f1f23 1px, transparent 1px), linear-gradient(90deg, #1f1f23 1px, transparent 1px)',
                backgroundSize: '40px 40px', opacity: 0.1, zIndex: 0
            }} />
            <div style={{ position: 'absolute', top: '-10%', left: '30%', width: '500px', height: '500px', background: '#22c55e', filter: 'blur(180px)', opacity: 0.1, borderRadius: '50%' }} />

            {/* Main Content (Centered) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10, textAlign: 'center', marginTop: '20px' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    background: 'rgba(39, 39, 42, 0.5)', border: '1px solid #3f3f46',
                    padding: '8px 16px', borderRadius: '100px', marginBottom: '30px',
                }}>
                    <span style={{ display: 'flex', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#d4d4d8', letterSpacing: '0.5px' }}>LIVE MULTIPLAYER CODING</span>
                </div>

                <h1 style={{
                    fontSize: '90px', fontWeight: '900', margin: '0',
                    lineHeight: '1.1', letterSpacing: '-3px',
                    background: 'linear-gradient(to bottom right, #ffffff 40%, #94a3b8 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    ALGO DUEL
                </h1>

                <p style={{ fontSize: '18px', color: '#a1a1aa', maxWidth: '500px', margin: '24px auto 40px', lineHeight: '1.6' }}>
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
                <div style={{ marginTop: '80px', display: 'flex', gap: '60px', opacity: 0.8 }}>
                    <Feature icon={<Swords color="#ef4444" />} text="1v1 Battles" />
                    <Feature icon={<Code2 color="#3b82f6" />} text="Real-time IDE" />
                    <Feature icon={<Trophy color="#eab308" />} text="Global Rank" />
                </div>
            </div>

            {/* Footer */}
            <div style={{ width: '100%', padding: '20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#52525b', fontSize: '13px' }}>
                v1.0.0 • Powered by SmartCoder
            </div>
        </div>
    );
};

const Feature = ({ icon, text }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {icon}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#d4d4d8' }}>{text}</span>
    </div>
);

const navLinkStyle = { background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '14px', fontWeight: 500 };

export default LandingPage;
