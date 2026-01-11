import React from 'react';
import { ExternalLink, RefreshCw, ShieldAlert, Download } from 'lucide-react';

const ConnectLeetCode = ({ onCheckConnection }) => {
    // Auto-check for sync every 1 second
    React.useEffect(() => {
        const checkSync = () => {
            const session = localStorage.getItem('user_session');
            if (session && session !== "undefined" && session.length > 10) {
                window.location.href = '/app'; // Force reload/redirect to clear state
            }
        };

        const interval = setInterval(checkSync, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            minHeight: '100vh', // Changed to minHeight for scrolling on small screens
            paddingTop: '80px', // Add padding for fixed header
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#09090b', // Darker background
            color: 'white',
            textAlign: 'center',
            paddingBottom: '40px'
        }}>
            <div style={{
                background: 'rgba(24, 24, 27, 0.6)', // Glassmorphism
                backdropFilter: 'blur(12px)',
                padding: '30px', // Reduced padding
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                maxWidth: '650px',
                width: '100%',
                position: 'relative',
                // Removed overflow: hidden to prevent clipping
            }}>
                {/* Glow Effect (Moved to a clipped inner container if needed, or left to overflow safely) */}
                <div style={{
                    position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
                    width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
                    pointerEvents: 'none', zIndex: 0
                }} />

                <div style={{ marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                    <ShieldAlert size={56} color="#eab308" /> {/* Reduced Icon Size */}
                </div>

                <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', position: 'relative', zIndex: 1 }}>How to Participate</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '25px', lineHeight: '1.5', fontSize: '14px', position: 'relative', zIndex: 1 }}>
                    Welcome to <b>AlgoDuel</b>. To ensure fair play and real-time verification,
                    we require a secure link to your LeetCode account.
                </p>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginBottom: '30px', position: 'relative', zIndex: 1 }}>

                    {/* Step 1 */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px' }}> {/* Compact padding */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                width: '28px', height: '28px', borderRadius: '50%', // Compact size
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.5)'
                            }}>1</div>
                            <div style={{ fontWeight: '700', fontSize: '16px', color: '#fff' }}>Install Extension</div>
                        </div>

                        <a href="/algoduel-sync.zip" download="algoduel-sync.zip" style={{
                            textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            background: '#2563eb', padding: '12px', borderRadius: '10px', color: 'white', fontSize: '14px',
                            fontWeight: '600', marginBottom: '16px', transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; }}
                        >
                            <Download size={18} /> Download Extension (ZIP)
                        </a>

                        {/* ANIMATED BROWSER MOCKUP */}
                        <div style={{
                            background: '#18181b', borderRadius: '8px', border: '1px solid #52525b',
                            overflow: 'hidden', position: 'relative', height: '150px', marginBottom: '16px' // Reduced height
                        }}>
                            {/* Browser Header */}
                            <div style={{ background: '#27272a', padding: '6px 10px', borderBottom: '1px solid #3f3f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                                <div style={{
                                    background: '#18181b', borderRadius: '4px', padding: '2px 8px', marginLeft: '8px',
                                    fontSize: '9px', color: '#71717a', flex: 1, fontFamily: 'monospace'
                                }}>chrome://extensions</div>
                            </div>

                            {/* Browser Content */}
                            <div style={{ padding: '12px', position: 'relative', height: '100%' }}>
                                {/* Header Bar */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '16px', height: '16px', background: '#3f3f46', borderRadius: '3px' }} />
                                        <div style={{ height: '6px', width: '50px', background: '#3f3f46', borderRadius: '3px' }} />
                                    </div>
                                    {/* Developer Mode Toggle */}
                                    <div className="dev-mode-toggle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ fontSize: '9px', color: '#71717a' }}>Developer mode</div>
                                        <div className="toggle-switch" style={{
                                            width: '20px', height: '10px', background: '#3f3f46', borderRadius: '10px',
                                            position: 'relative'
                                        }}>
                                            <div className="toggle-knob" style={{
                                                width: '8px', height: '8px', background: '#71717a', borderRadius: '50%',
                                                position: 'absolute', top: '1px', left: '1px', transition: 'all 0.3s'
                                            }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Load Unpacked Button */}
                                <div className="load-unpacked" style={{
                                    padding: '4px 10px', background: 'transparent', border: '1px solid #3f3f46',
                                    borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    opacity: 0.5, transition: 'all 0.3s'
                                }}>
                                    <div style={{ fontSize: '9px', color: '#a1a1aa' }}>Load unpacked</div>
                                </div>

                                {/* Cursor */}
                                <div className="cursor-hand" style={{
                                    position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px', // Smaller cursor
                                    background: 'white', borderRadius: '50%', border: '2px solid black',
                                    pointerEvents: 'none', zIndex: 10,
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                                }} />
                            </div>
                        </div>

                        <div style={{ fontSize: '12px', color: '#d4d4d8', paddingLeft: '8px', lineHeight: '1.7' }}>
                            <strong style={{ color: '#fff' }}>Step A: </strong> Right-click downloaded file &gt; <b>Extract All</b>.<br />
                            <strong style={{ color: '#fff' }}>Step B: </strong> Go to <code>chrome://extensions</code>.<br />
                            <strong style={{ color: '#fff' }}>Step C: </strong> Toggle <b>Developer Mode</b> (Top Right).<br />
                            <strong style={{ color: '#fff' }}>Step D: </strong> Click <b>Load Unpacked</b> (Top Left).<br />
                            <strong style={{ color: '#ef4444' }}>Note: </strong> Select the <u>extracted folder</u>.
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            background: '#27272a', width: '28px', height: '28px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '13px', border: '1px solid #3f3f46', color: '#a1a1aa'
                        }}>2</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>Login to LeetCode</div>
                            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>Ensure you are logged in on <a href="https://leetcode.com" target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>leetcode.com</a>.</div>
                        </div>
                        <ExternalLink size={18} color="#60a5fa" />
                    </div>

                    {/* Step 3 */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            background: '#27272a', width: '28px', height: '28px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '13px', border: '1px solid #3f3f46', color: '#a1a1aa'
                        }}>3</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>Hit "Sync"</div>
                            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>Click the extension icon & press <b>Sync</b>.</div>
                        </div>
                        <RefreshCw size={18} color="#22c55e" />
                    </div>
                </div>

                <div style={{
                    padding: '12px', background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center'
                }}>
                    <div className="loader" style={{ width: '18px', height: '18px', border: '2px solid #22c55e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: '600' }}>Waiting for sync... (Auto-refresh)</span>
                </div>

                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    
                    /* Animation Scenario */
                    .cursor-hand { animation: cursorScenario 6s infinite ease-in-out; }
                    .toggle-switch { animation: toggleBg 6s infinite steps(1); }
                    .toggle-knob { animation: knobMove 6s infinite steps(1); }
                    .load-unpacked { animation: btnActivate 6s infinite steps(1); }

                    @keyframes cursorScenario {
                        0%, 10% { top: 120%; left: 80%; opacity: 0; }
                        15% { top: 40px; left: 88%; opacity: 1; transform: scale(1); }
                        20% { transform: scale(0.8); }
                        25% { transform: scale(1); }
                        30% { top: 40px; left: 88%; }
                        45% { top: 75px; left: 60px; }
                        50% { transform: scale(0.8); }
                        55% { transform: scale(1); }
                        70% { opacity: 1; }
                        80% { top: 120%; opacity: 0; }
                        100% { opacity: 0; }
                    }

                    @keyframes toggleBg {
                        0%, 20% { background: #3f3f46; }
                        20%, 100% { background: #2563eb; }
                    }
                    @keyframes knobMove {
                        0%, 20% { left: 1px; background: #71717a; }
                        20%, 100% { left: 11px; background: white; }
                    }

                    @keyframes btnActivate {
                        0%, 20% { opacity: 0.5; border-color: #3f3f46; }
                        20%, 50% { opacity: 1; border-color: #71717a; color: white; }
                        50%, 55% { background: #3f3f46; }
                        55%, 100% { background: transparent; }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ConnectLeetCode;
