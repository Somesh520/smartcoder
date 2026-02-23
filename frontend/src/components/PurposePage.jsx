import React from 'react';
import { Terminal, Users, TrendingUp, Zap } from 'lucide-react';

const PurposePage = ({ onNavigate, onGetStarted }) => {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>
            <Navbar onNavigate={onNavigate} onGetStarted={onGetStarted} current="purpose" />

            <div style={{ maxWidth: '800px', margin: '120px auto 40px', padding: '0 20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '48px', fontWeight: 950, marginBottom: '20px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                    WHY_WE_BUILT_ALGO_DUEL
                </h1>
                <p style={{ fontSize: '20px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '60px', fontWeight: 700 }}>
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
            backdropFilter: 'blur(10px)', background: 'var(--bg-main)', borderBottom: 'var(--border-main)', zIndex: 100
        }}>
            <div onClick={() => onNavigate('landing')} style={{ cursor: 'pointer', fontWeight: 950, fontSize: '20px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                <span style={{ color: 'var(--accent)' }}>ALGO</span>DUEL.
            </div>
            <div style={{ display: 'flex', gap: '30px', fontSize: '14px', fontWeight: 950, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <button onClick={() => onNavigate('purpose')} style={{ ...navBtnStyle, color: current === 'purpose' ? 'var(--text-main)' : 'var(--text-muted)' }}>Purpose</button>
                <button onClick={() => onNavigate('workflow')} style={{ ...navBtnStyle, color: current === 'workflow' ? 'var(--text-main)' : 'var(--text-muted)' }}>How it Works</button>
                <button onClick={() => onNavigate('about')} style={{ ...navBtnStyle, color: current === 'about' ? 'var(--text-main)' : 'var(--text-muted)' }}>About Us</button>
            </div>
            <button onClick={onGetStarted} className="neo-btn" style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 950, background: 'var(--accent)', color: 'black', border: 'var(--border-main)', borderRadius: '0', cursor: 'pointer', textTransform: 'uppercase' }}>Play Now</button>
        </nav>
    );
};

const Card = ({ icon, title, desc }) => (
    <div className="neo-card" style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '0', border: 'var(--border-main)', transition: 'transform 0.2s', cursor: 'default', boxShadow: 'var(--shadow-main)' }}>
        <div style={{ marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ fontSize: '24px', fontWeight: 950, marginBottom: '10px', color: 'var(--text-main)', textTransform: 'uppercase' }}>{title}</h3>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.6', fontWeight: 700 }}>{desc}</p>
    </div>
);

const navBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 950 };

export default PurposePage;
