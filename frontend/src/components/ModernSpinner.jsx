import React from 'react';

const ModernSpinner = ({ size = 60, color = '#22c55e', text = '' }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
        }}>
            {/* Spinner Container */}
            <div style={{
                position: 'relative',
                width: `${size}px`,
                height: `${size}px`
            }}>
                {/* Outer Ring */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    border: `3px solid rgba(34, 197, 94, 0.1)`,
                    borderRadius: '50%'
                }}></div>

                {/* Spinning Ring */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    border: `3px solid transparent`,
                    borderTopColor: color,
                    borderRightColor: color,
                    borderRadius: '50%',
                    animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
                }}></div>

                {/* Inner Pulsing Dot */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${size * 0.3}px`,
                    height: `${size * 0.3}px`,
                    background: color,
                    borderRadius: '50%',
                    boxShadow: `0 0 20px ${color}`,
                    animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>

                {/* Orbiting Dots */}
                {[0, 120, 240].map((angle, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: `${size * 0.15}px`,
                            height: `${size * 0.15}px`,
                            background: color,
                            borderRadius: '50%',
                            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${size * 0.4}px)`,
                            animation: `orbit 2s linear infinite`,
                            animationDelay: `${i * 0.2}s`,
                            opacity: 0.6
                        }}
                    ></div>
                ))}
            </div>

            {/* Loading Text */}
            {text && (
                <div style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    animation: 'fadeInOut 2s ease-in-out infinite'
                }}>
                    {text}
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0%, 100% { 
                        transform: translate(-50%, -50%) scale(1); 
                        opacity: 1;
                    }
                    50% { 
                        transform: translate(-50%, -50%) scale(1.2); 
                        opacity: 0.7;
                    }
                }

                @keyframes orbit {
                    0% { transform: translate(-50%, -50%) rotate(0deg) translateY(-${size * 0.4}px); }
                    100% { transform: translate(-50%, -50%) rotate(360deg) translateY(-${size * 0.4}px); }
                }

                @keyframes fadeInOut {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ModernSpinner;
