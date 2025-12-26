import React from 'react';
import { Code2, Swords, Zap, Trophy, ChevronRight } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#09090b',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Grid & Glows */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'linear-gradient(#1f1f23 1px, transparent 1px), linear-gradient(90deg, #1f1f23 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                opacity: 0.1,
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute', top: '-20%', left: '20%', width: '400px', height: '400px',
                background: '#22c55e', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%'
            }} />
            <div style={{
                position: 'absolute', bottom: '-20%', right: '20%', width: '400px', height: '400px',
                background: '#3b82f6', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%'
            }} />

            {/* Main Content */}
            <div style={{ zIndex: 10, textAlign: 'center', padding: '0 20px' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    background: 'rgba(39, 39, 42, 0.5)', border: '1px solid #3f3f46',
                    padding: '8px 16px', borderRadius: '100px', marginBottom: '30px',
                    backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                    <span style={{ display: 'flex', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#d4d4d8', letterSpacing: '0.5px' }}>LIVE MULTIPLAYER CODING</span>
                </div>

                <h1 style={{
                    fontSize: '80px', fontWeight: '900', margin: '0',
                    lineHeight: '1.1', letterSpacing: '-2px',
                    background: 'linear-gradient(to bottom right, #ffffff 40%, #94a3b8 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(255,255,255,0.1)'
                }}>
                    ALGO DUEL
                </h1>

                <p style={{
                    fontSize: '18px', color: '#a1a1aa', maxWidth: '500px', margin: '20px auto 40px',
                    lineHeight: '1.6', fontWeight: 400
                }}>
                    Prove your skills in real-time 1v1 coding battles.
                    Master algorithms, defeat opponents, and climb the global leaderboard.
                </p>

                <button
                    onClick={onGetStarted}
                    style={{
                        padding: '18px 40px',
                        fontSize: '18px', fontWeight: '700',
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        color: 'white', border: 'none', borderRadius: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.2), 0 10px 20px -5px rgba(34, 197, 94, 0.4)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        margin: '0 auto'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 0 0 6px rgba(34, 197, 94, 0.3), 0 15px 30px -5px rgba(34, 197, 94, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.2), 0 10px 20px -5px rgba(34, 197, 94, 0.4)';
                    }}
                >
                    <Zap fill="white" size={20} /> ENTER THE ARENA
                </button>
            </div>

            {/* Features Row */}
            <div style={{
                marginTop: '80px', display: 'flex', gap: '60px', zIndex: 10,
                opacity: 0.8
            }}>
                <Feature icon={<Swords color="#ef4444" />} text="1v1 Battles" />
                <Feature icon={<Code2 color="#3b82f6" />} text="Real-time IDE" />
                <Feature icon={<Trophy color="#eab308" />} text="Global Rank" />
            </div>

            {/* Footer */}
            <div style={{ position: 'absolute', bottom: '30px', color: '#52525b', fontSize: '13px' }}>
                v1.0.0 • Powered by SmartCoder
            </div>
        </div>
    );
};

const Feature = ({ icon, text }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{
            background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            {icon}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#d4d4d8' }}>{text}</span>
    </div>
);

export default LandingPage;
