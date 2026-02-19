import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [text, setText] = useState('INITIALIZING...');

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 500);
                    return 100;
                }
                const increment = Math.random() * 10;
                return Math.min(prev + increment, 100);
            });
        }, 100);

        const textInterval = setInterval(() => {
            const texts = [
                'LOADING ASSETS...',
                'CONNECTING TO SERVER...',
                'ESTABLISHING SECURE LINK...',
                'SYNCING BATTLEGROUND...',
                'SYSTEM READY'
            ];
            setText(texts[Math.floor(Math.random() * texts.length)]);
        }, 800);

        return () => {
            clearInterval(interval);
            clearInterval(textInterval);
        };
    }, [onComplete]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: '#000',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#00FFFF', fontFamily: "'Courier New', Courier, monospace"
        }}>
            {/* Glitch Logo */}
            <div className="glitch-wrapper" style={{ marginBottom: '40px' }}>
                <h1 className="glitch" data-text="ALGO DUEL">ALGO DUEL</h1>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '300px', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                    width: `${progress}%`, height: '100%', background: '#00FFFF',
                    boxShadow: '0 0 10px #00FFFF', transition: 'width 0.1s linear'
                }} />
            </div>

            {/* Terminal Text */}
            <div style={{ marginTop: '20px', fontSize: '12px', color: '#00FFFF', opacity: 0.7 }}>
                {`> ${text}`} <span className="blink">_</span>
            </div>

            <style>{`
                .glitch-wrapper {
                    position: relative;
                }
                .glitch {
                    font-size: 64px;
                    font-weight: 900;
                    letter-spacing: 5px;
                    position: relative;
                    color: #fff;
                }
                .glitch::before,
                .glitch::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .glitch::before {
                    left: 2px;
                    text-shadow: -2px 0 #ff00c1;
                    clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim 5s infinite linear alternate-reverse;
                }
                .glitch::after {
                    left: -2px;
                    text-shadow: -2px 0 #00fff9;
                    clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim2 5s infinite linear alternate-reverse;
                }
                .blink {
                    animation: blink 1s infinite;
                }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                @keyframes glitch-anim {
                    0% { clip: rect(31px, 9999px, 94px, 0); transform: skew(0.85deg); }
                    5% { clip: rect(70px, 9999px, 71px, 0); transform: skew(0.89deg); }
                    10% { clip: rect(27px, 9999px, 2px, 0); transform: skew(0.01deg); }
                    15% { clip: rect(6px, 9999px, 83px, 0); transform: skew(0.4deg); }
                    20% { clip: rect(61px, 9999px, 47px, 0); transform: skew(0.12deg); }
                    25% { clip: rect(32px, 9999px, 13px, 0); transform: skew(0.46deg); }
                    30% { clip: rect(96px, 9999px, 5px, 0); transform: skew(0.32deg); }
                    35% { clip: rect(69px, 9999px, 3px, 0); transform: skew(0.56deg); }
                    40% { clip: rect(2px, 9999px, 37px, 0); transform: skew(0.81deg); }
                    45% { clip: rect(9px, 9999px, 24px, 0); transform: skew(0.12deg); }
                    50% { clip: rect(27px, 9999px, 15px, 0); transform: skew(0.25deg); }
                    55% { clip: rect(10px, 9999px, 23px, 0); transform: skew(0.86deg); }
                    60% { clip: rect(30px, 9999px, 20px, 0); transform: skew(0.09deg); }
                    65% { clip: rect(30px, 9999px, 32px, 0); transform: skew(0.16deg); }
                    70% { clip: rect(10px, 9999px, 44px, 0); transform: skew(0.2deg); }
                    75% { clip: rect(29px, 9999px, 16px, 0); transform: skew(0.56deg); }
                    80% { clip: rect(34px, 9999px, 7px, 0); transform: skew(0.39deg); }
                    85% { clip: rect(17px, 9999px, 41px, 0); transform: skew(0.2deg); }
                    90% { clip: rect(36px, 9999px, 46px, 0); transform: skew(0.96deg); }
                    95% { clip: rect(74px, 9999px, 90px, 0); transform: skew(0.5deg); }
                    100% { clip: rect(23px, 9999px, 21px, 0); transform: skew(0.81deg); }
                }
                @keyframes glitch-anim2 {
                    0% { clip: rect(65px, 9999px, 100px, 0); transform: skew(0.36deg); }
                    5% { clip: rect(52px, 9999px, 74px, 0); transform: skew(0.67deg); }
                    10% { clip: rect(81px, 9999px, 2px, 0); transform: skew(0.95deg); }
                    15% { clip: rect(4px, 9999px, 94px, 0); transform: skew(0.4deg); }
                    20% { clip: rect(43px, 9999px, 3px, 0); transform: skew(0.72deg); }
                    25% { clip: rect(11px, 9999px, 13px, 0); transform: skew(0.46deg); }
                    30% { clip: rect(72px, 9999px, 5px, 0); transform: skew(0.29deg); }
                    35% { clip: rect(93px, 9999px, 3px, 0); transform: skew(0.56deg); }
                    40% { clip: rect(21px, 9999px, 37px, 0); transform: skew(0.81deg); }
                    45% { clip: rect(2px, 9999px, 24px, 0); transform: skew(0.12deg); }
                    50% { clip: rect(76px, 9999px, 15px, 0); transform: skew(0.58deg); }
                    55% { clip: rect(10px, 9999px, 23px, 0); transform: skew(0.86deg); }
                    60% { clip: rect(30px, 9999px, 20px, 0); transform: skew(0.09deg); }
                    65% { clip: rect(30px, 9999px, 32px, 0); transform: skew(0.16deg); }
                    70% { clip: rect(10px, 9999px, 44px, 0); transform: skew(0.2deg); }
                    75% { clip: rect(29px, 9999px, 16px, 0); transform: skew(0.56deg); }
                    80% { clip: rect(34px, 9999px, 7px, 0); transform: skew(0.39deg); }
                    85% { clip: rect(17px, 9999px, 41px, 0); transform: skew(0.2deg); }
                    90% { clip: rect(36px, 9999px, 46px, 0); transform: skew(0.96deg); }
                    95% { clip: rect(74px, 9999px, 90px, 0); transform: skew(0.5deg); }
                    100% { clip: rect(23px, 9999px, 21px, 0); transform: skew(0.81deg); }
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;
