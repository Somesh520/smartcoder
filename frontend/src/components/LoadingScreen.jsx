import React from 'react';
import { Terminal } from 'lucide-react';

const LoadingScreen = ({ text = "ESTABLISHING CONNECTION..." }) => {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#09090b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22c55e',
            fontFamily: 'monospace'
        }}>
            <div style={{ position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
                    animation: 'pulse 2s infinite'
                }}></div>
                <Terminal size={64} />
            </div>

            <div style={{ marginTop: '20px', fontSize: '16px', letterSpacing: '2px', fontWeight: 'bold', display: 'flex', gap: '2px' }}>
                {text.split('').map((char, i) => (
                    <span key={i} style={{ animation: `fade 1.5s infinite ${i * 0.1}s` }}>{char}</span>
                ))}
            </div>

            <div style={{
                marginTop: '15px',
                width: '150px',
                height: '2px',
                background: '#333',
                overflow: 'hidden',
                borderRadius: '2px'
            }}>
                <div style={{
                    width: '50%',
                    height: '100%',
                    background: '#22c55e',
                    animation: 'slide 1.5s infinite ease-in-out'
                }}></div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 0.2; }
                    100% { transform: scale(0.8); opacity: 0.5; }
                }
                @keyframes fade {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 1; }
                }
                @keyframes slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
