import React from 'react';
import { Code2, Zap } from 'lucide-react';

const LoadingScreen = ({ text = "ESTABLISHING CONNECTION..." }) => {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Gradient */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 50%)',
                animation: 'rotate 20s linear infinite'
            }}></div>

            {/* Floating Particles */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            }}>
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: `${Math.random() * 4 + 2}px`,
                            height: `${Math.random() * 4 + 2}px`,
                            background: '#22c55e',
                            borderRadius: '50%',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.2,
                            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* Main Content */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '30px'
            }}>
                {/* Icon Container with Glow */}
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Outer Glow Ring */}
                    <div style={{
                        position: 'absolute',
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}></div>

                    {/* Middle Ring */}
                    <div style={{
                        position: 'absolute',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        border: '2px solid rgba(34, 197, 94, 0.3)',
                        animation: 'spin 3s linear infinite'
                    }}></div>

                    {/* Icon Background */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 40px rgba(34, 197, 94, 0.4), inset 0 0 20px rgba(34, 197, 94, 0.1)',
                        animation: 'iconPulse 2s ease-in-out infinite'
                    }}>
                        <Code2 size={40} color="#22c55e" strokeWidth={2} style={{ animation: 'iconFloat 3s ease-in-out infinite' }} />
                    </div>

                    {/* Orbiting Spark */}
                    <div style={{
                        position: 'absolute',
                        width: '100px',
                        height: '100px',
                        animation: 'orbit 4s linear infinite'
                    }}>
                        <Zap size={16} color="#fbbf24" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }} />
                    </div>
                </div>

                {/* Text with Gradient */}
                <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    letterSpacing: '4px',
                    fontFamily: 'monospace',
                    background: 'linear-gradient(90deg, #22c55e 0%, #4ade80 50%, #22c55e 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'shimmer 3s linear infinite',
                    textTransform: 'uppercase'
                }}>
                    {text}
                </div>

                {/* Progress Bar */}
                <div style={{
                    width: '250px',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}>
                    <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #22c55e, #4ade80, #22c55e)',
                        backgroundSize: '200% 100%',
                        borderRadius: '10px',
                        animation: 'progressSlide 2s ease-in-out infinite',
                        boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
                    }}></div>
                </div>

                {/* Loading Dots */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '10px'
                }}>
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#22c55e',
                                animation: `dotBounce 1.4s ease-in-out infinite`,
                                animationDelay: `${i * 0.2}s`,
                                boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes iconPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes iconFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes orbit {
                    from { transform: rotate(0deg) translateX(50px) rotate(0deg); }
                    to { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
                }
                @keyframes shimmer {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes progressSlide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes dotBounce {
                    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                    40% { transform: scale(1.2); opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    25% { transform: translateY(-20px) translateX(10px); }
                    50% { transform: translateY(-10px) translateX(-10px); }
                    75% { transform: translateY(-15px) translateX(5px); }
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
