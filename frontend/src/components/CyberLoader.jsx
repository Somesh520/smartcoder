import React from 'react';

const CyberLoader = () => {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'absolute', inset: 0,
            background: 'rgba(5, 5, 10, 0.7)', backdropFilter: 'blur(5px)',
            zIndex: 100, borderRadius: '24px'
        }}>
            <div className="cyber-spinner" style={{
                width: '60px', height: '60px',
                border: '4px solid transparent',
                borderTop: '4px solid #00FFFF',
                borderLeft: '4px solid #FF00FF',
                borderRadius: '50%',
                animation: 'spin-cyber 1s linear infinite',
                boxShadow: '0 0 15px #00FFFF, 0 0 5px #FF00FF'
            }}></div>
            <div style={{
                marginTop: '20px',
                fontFamily: 'monospace',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                animation: 'pulse-text 1.5s infinite ease-in-out'
            }}>
                Processing<span className="dots">...</span>
            </div>

            <style>{`
                @keyframes spin-cyber {
                    0% { transform: rotate(0deg); box-shadow: 0 0 15px #00FFFF; }
                    50% { transform: rotate(180deg); box-shadow: 0 0 25px #FF00FF; }
                    100% { transform: rotate(360deg); box-shadow: 0 0 15px #00FFFF; }
                }
                @keyframes pulse-text {
                    0%, 100% { opacity: 0.8; text-shadow: 0 0 10px #00FFFF; }
                    50% { opacity: 1; text-shadow: 0 0 20px #00FFFF, 0 0 10px white; }
                }
                .dots::after {
                    content: '';
                    animation: dots 1.5s infinite;
                }
                @keyframes dots {
                    0% { content: ''; }
                    25% { content: '.'; }
                    50% { content: '..'; }
                    75% { content: '...'; }
                }
            `}</style>
        </div>
    );
};

export default CyberLoader;
