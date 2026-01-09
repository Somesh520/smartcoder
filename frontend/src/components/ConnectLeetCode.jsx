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
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#18181b',
            color: 'white',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: '#27272a',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '1px solid #3f3f46',
                maxWidth: '600px',
                width: '100%'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <ShieldAlert size={64} color="#eab308" />
                </div>

                <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>How to Participate</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '30px', lineHeight: '1.6', fontSize: '15px' }}>
                    Welcome to <b>AlgoDuel</b>. To ensure fair play and real-time verification,
                    we require a secure link to your LeetCode account.
                </p>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginBottom: '30px' }}>

                    {/* Step 1 */}
                    <div style={{ background: '#3f3f46', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <div style={{ background: '#2563eb', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>1</div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>Install the Companion Extension</div>
                        </div>

                        <a href="/algoduel-sync.zip" download="algoduel-sync.zip" style={{
                            textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            background: '#27272a', padding: '12px', borderRadius: '8px', color: '#60a5fa', fontSize: '14px',
                            fontWeight: '600', marginBottom: '12px', border: '1px solid #52525b', transition: 'background 0.2s',
                        }}>
                            <Download size={18} /> Download Extension (ZIP)
                        </a>

                        <div style={{ fontSize: '13px', color: '#d4d4d8', paddingLeft: '40px', lineHeight: '1.6' }}>
                            1. Unzip the file.<br />
                            2. Go to <code>chrome://extensions</code>.<br />
                            3. Enable <b>Developer Mode</b> (top right).<br />
                            4. Click <b>Load Unpacked</b> and select the folder.
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div style={{ background: '#3f3f46', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: '#2563eb', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>2</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>Login to LeetCode</div>
                            <div style={{ fontSize: '13px', color: '#a1a1aa' }}>Ensure you are logged in on <a href="https://leetcode.com" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>leetcode.com</a>.</div>
                        </div>
                        <ExternalLink size={20} color="#60a5fa" />
                    </div>

                    {/* Step 3 */}
                    <div style={{ background: '#3f3f46', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: '#2563eb', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>3</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>Hit "Sync"</div>
                            <div style={{ fontSize: '13px', color: '#a1a1aa' }}>Click the extension icon in your toolbar and press <b>Sync</b>.</div>
                        </div>
                        <RefreshCw size={20} color="#60a5fa" />
                    </div>
                </div>

                <div style={{
                    padding: '15px', background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center'
                }}>
                    <div className="loader" style={{ width: '20px', height: '20px', border: '2px solid #22c55e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: '600' }}>Waiting for sync... (This page will auto-refresh)</span>
                </div>

                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        </div>
    );
};

export default ConnectLeetCode;
