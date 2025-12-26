import React from 'react';
import { Terminal, Users, TrendingUp, Zap } from 'lucide-react';

const PurposePage = ({ onNavigate, onGetStarted }) => {
    return (
        <div style={{ minHeight: '100vh', background: '#09090b', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            <Navbar onNavigate={onNavigate} onGetStarted={onGetStarted} current="purpose" />

            <div style={{ maxWidth: '800px', margin: '120px auto 40px', padding: '0 20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '20px', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Why We Built Algo Duel
                </h1>
                <p style={{ fontSize: '20px', color: '#a1a1aa', lineHeight: '1.6', marginBottom: '60px' }}>
                    Standard coding practice is often lonely, disconnected, and lacks the pressure of real interviews.
                    We set out to change that.
                </p>

                <div style={{ display: 'grid', gap: '30px', textAlign: 'left' }}>
                    <Card
                        icon={<Terminal color="#3b82f6" size={32} />}
                        title="Simulating the Real World"
                        desc="In a real interview, you don't just write code; you communicate. Our built-in voice chat and synchronized editor force you to explain your thought process while you code, exactly like a technical interview."
                    />
                    <Card
                        icon={<Users color="#ef4444" size={32} />}
                        title="The Power of Competition"
                        desc="Gamification drives improvement. Knowing you are racing against a peer pushes you to think faster, optimize better, and handle stress more effectively."
                    />
                    <Card
                        icon={<TrendingUp color="#eab308" size={32} />}
                        title="Consistent Growth"
                        desc="By turning LeetCode-style problems into quick 1v1 battles, we make daily practice addictive. Consistency is the key to mastery, and Algo Duel helps you stay consistent."
                    />
                </div>
            </div>
        </div>
    );
};

const Navbar = ({ onNavigate, onGetStarted, current }) => {
    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, padding: '20px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backdropFilter: 'blur(10px)', background: 'rgba(9, 9, 11, 0.8)', borderBottom: '1px solid #27272a', zIndex: 100
        }}>
            <div onClick={() => onNavigate('landing')} style={{ cursor: 'pointer', fontWeight: 800, fontSize: '20px' }}>
                <span style={{ color: '#22c55e' }}>Algo</span>Duel.
            </div>
            <div style={{ display: 'flex', gap: '30px', fontSize: '14px', fontWeight: 500, color: '#a1a1aa' }}>
                <button onClick={() => onNavigate('purpose')} style={{ ...navBtnStyle, color: current === 'purpose' ? 'white' : '#a1a1aa' }}>Purpose</button>
                <button onClick={() => onNavigate('workflow')} style={{ ...navBtnStyle, color: current === 'workflow' ? 'white' : '#a1a1aa' }}>How it Works</button>
                <button onClick={() => onNavigate('about')} style={{ ...navBtnStyle, color: current === 'about' ? 'white' : '#a1a1aa' }}>About Us</button>
            </div>
            <button onClick={onGetStarted} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600, background: '#22c55e', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Play Now</button>
        </nav>
    );
};

const Card = ({ icon, title, desc }) => (
    <div style={{ background: '#121214', padding: '40px', borderRadius: '16px', border: '1px solid #27272a', transition: 'transform 0.2s', cursor: 'default' }}>
        <div style={{ marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px', color: 'white' }}>{title}</h3>
        <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

const navBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500 };

export default PurposePage;
