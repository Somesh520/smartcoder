import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

const AboutPage = ({ onNavigate, onGetStarted }) => {
    return (
        <div style={{ minHeight: '100vh', background: '#09090b', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            <Navbar onNavigate={onNavigate} onGetStarted={onGetStarted} current="about" />

            <div style={{ maxWidth: '800px', margin: '140px auto 40px', padding: '0 20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '20px', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    About The Team
                </h1>
                <p style={{ fontSize: '18px', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto 60px', lineHeight: '1.6' }}>
                    Algo Duel is a passion project built to redefine how developers prepare for technical interviews.
                </p>

                <div style={{ background: '#18181b', padding: '40px', borderRadius: '24px', border: '1px solid #27272a', display: 'inline-block', textAlign: 'center', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}>
                    <div style={{ width: '120px', height: '120px', background: '#27272a', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', color: '#52525b' }}>
                        ST
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '5px', color: 'white' }}>Somesh Tiwari</h2>
                    <p style={{ color: '#22c55e', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>Full Stack Developer & Creator</p>
                    <p style={{ color: '#a1a1aa', maxWidth: '400px', margin: '0 auto 30px', fontSize: '15px', lineHeight: '1.6' }}>
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

const socialBtnStyle = {
    color: '#a1a1aa', padding: '10px', borderRadius: '8px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', textDecoration: 'none'
};

const navBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500 };

export default AboutPage;
