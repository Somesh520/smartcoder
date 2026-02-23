import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

const AboutPage = ({ onNavigate, onGetStarted }) => {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>
            <Navbar onNavigate={onNavigate} onGetStarted={onGetStarted} current="about" />

            <div style={{ maxWidth: '800px', margin: '140px auto 40px', padding: '0 20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '48px', fontWeight: 950, marginBottom: '20px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                    ABOUT_THE_TEAM
                </h1>
                <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 60px', lineHeight: '1.6', fontWeight: 700 }}>
                    Algo Duel is a passion project built to redefine how developers prepare for technical interviews.
                </p>

                <div className="neo-card" style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '0', border: 'var(--border-main)', display: 'inline-block', textAlign: 'center', boxShadow: 'var(--shadow-main)' }}>
                    <div style={{ width: '120px', height: '120px', background: 'var(--bg-main)', border: 'var(--border-main)', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                        ST
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 950, marginBottom: '5px', color: 'var(--text-main)', textTransform: 'uppercase' }}>Somesh Tiwari</h2>
                    <p style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 950, marginBottom: '20px' }}>FULL STACK DEVELOPER & CREATOR</p>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 30px', fontSize: '15px', lineHeight: '1.6', fontWeight: 700 }}>
                        Specializing in React, Node.js, and Real-time Systems. Passionate about building competitive gaming experiences for coders.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <a href="https://github.com/Somesh520" target="_blank" rel="noreferrer" style={socialBtnStyle}><Github size={20} /></a>
                        <a href="#" style={socialBtnStyle}><Twitter size={20} /></a>
                        <a href="#" style={socialBtnStyle}><Linkedin size={20} /></a>
                    </div>
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

const socialBtnStyle = {
    color: 'var(--text-main)', padding: '10px', borderRadius: '0', background: 'var(--bg-card)', border: 'var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', textDecoration: 'none'
};

const navBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 950 };

export default AboutPage;
