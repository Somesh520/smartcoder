import React from 'react';
import { ExternalLink, RefreshCw, ShieldAlert, Download } from 'lucide-react';

const ConnectLeetCode = ({ onCheckConnection }) => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#18181b', // Background color matching the app
            color: 'white',
            textAlign: 'center',
            padding: '20px'
        }}>
            {/* Main Card */}
            <div style={{
                background: '#27272a',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '1px solid #3f3f46',
                maxWidth: '500px',
                width: '100%'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <ShieldAlert size={64} color="#eab308" />
                </div>

                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>One-Time Setup Required</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '30px', lineHeight: '1.6' }}>
                    Unlike other platforms, we verify your submissions in <b>Real-Time</b> securely. <br />
                    To do this, we need a tiny bridge between AlgoDuel and LeetCode.
                </p>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginBottom: '30px' }}>

                    {/* Step 1: Install Instructions */}
                    <div style={{ background: '#3f3f46', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ background: '#2563eb', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>1</div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#60a5fa' }}>Download & Load Extension</div>
                        </div>

                        <a href="/leetcode-sync-ext.zip" download="leetcode-sync-ext.zip" style={{
                            textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            background: '#27272a', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '14px',
                            fontWeight: '600', marginBottom: '15px', border: '1px solid #52525b', transition: 'background 0.2s',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#3f3f46'}
                            onMouseLeave={e => e.currentTarget.style.background = '#27272a'}
                        >
                            <Download size={18} /> Click here to Download Extension (ZIP)
                        </a>

                        <div style={{ fontSize: '13px', color: '#e4e4e7', lineHeight: '1.6' }}>
                            <div style={{ marginBottom: '4px' }}>👉 <b>Unzip</b> the downloaded file.</div>
                            <div style={{ marginBottom: '4px' }}>👉 Go to <code style={{ background: '#18181b', padding: '2px 6px', borderRadius: '4px', border: '1px solid #52525b' }}>chrome://extensions</code></div>
                            <div style={{ marginBottom: '4px' }}>👉 Turn on <b>Developer mode</b> (top-right).</div>
                            <div>👉 Click <b>Load unpacked</b> & select the unzipped folder.</div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div style={{ background: '#3f3f46', padding: '15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: '#2563eb', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>2</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Login to LeetCode</div>
                            <div style={{ fontSize: '12px', color: '#ccc' }}>Ensure you are logged in on leetcode.com</div>
                        </div>
                        <ExternalLink size={18} color="#60a5fa" />
                    </div>

                    {/* Step 3 */}
                    <div style={{ background: '#3f3f46', padding: '15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: '#2563eb', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>3</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Sync Account</div>
                            <div style={{ fontSize: '12px', color: '#ccc' }}>Click the <b>LeetCode Sync</b> icon and hit "Sync"</div>
                        </div>
                        <RefreshCw size={18} color="#60a5fa" />
                    </div>

                </div>

                <button
                    onClick={onCheckConnection}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#22c55e',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: '0.2s'
                    }}
                    onMouseEnter={e => e.target.style.background = '#16a34a'}
                    onMouseLeave={e => e.target.style.background = '#22c55e'}
                >
                    I've Synced My Account
                </button>

                <div style={{ marginTop: '15px', fontSize: '12px', color: '#71717a' }}>
                    Waiting for storage update...
                </div>
            </div>
        </div>
    );
};

export default ConnectLeetCode;
