import React from 'react';
import { Zap, Star } from 'lucide-react';
import SEO from './SEO';

const PathPradarshakPage = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            background: '#08080a',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <SEO title="PathPradarshak - AlgoDuel" description="A revolutionary AI-guided curriculum coming soon." />

            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(167, 139, 250, 0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '100px', background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.3)', color: '#a78bfa', fontSize: '14px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '40px', boxShadow: '0 0 20px rgba(167, 139, 250, 0.1)' }}>
                    <Zap size={16} fill="#a78bfa" />
                    A New Era of Learning
                </div>

                {/* Unique Font Container */}
                <div style={{ marginBottom: '50px', animation: 'fadeInUp 0.8s ease-out' }}>
                    <h1 style={{
                        fontFamily: "'Cinzel', 'Playfair Display', serif", // Unique elegant font stack
                        fontSize: 'clamp(56px, 10vw, 100px)',
                        fontWeight: 900,
                        letterSpacing: '4px',
                        margin: 0,
                        background: 'linear-gradient(135deg, #fff 0%, #a78bfa 50%, #7c3aed 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 10px 40px rgba(124, 58, 237, 0.4)'
                    }}>
                        PathPradarshak
                    </h1>
                    <div style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#a78bfa',
                        letterSpacing: '12px',
                        textTransform: 'uppercase',
                        marginTop: '15px',
                        textShadow: '0 0 10px rgba(167, 139, 250, 0.5)'
                    }}>
                        Coming Soon
                    </div>
                </div>

                <p style={{
                    fontSize: '20px',
                    color: '#a1a1aa',
                    maxWidth: '650px',
                    margin: '0 auto',
                    lineHeight: 1.8,
                    animation: 'fadeInUp 1s ease-out 0.2s both'
                }}>
                    Prepare to experience a revolutionary AI-guided curriculum designed to transform beginners into <strong style={{ color: '#fff' }}>Grandmasters</strong>. Your ultimate coding mentor is awakening.
                </p>

                {/* Decorative Elements */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '60px', opacity: 0.6, animation: 'fadeInUp 1s ease-out 0.4s both' }}>
                    <span style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, #a78bfa)' }} />
                    <Star size={24} color="#a78bfa" fill="#a78bfa" />
                    <span style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, #a78bfa, transparent)' }} />
                </div>
            </div>

            {/* Dynamically Inject Google Font for Cinzel and animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default PathPradarshakPage;
