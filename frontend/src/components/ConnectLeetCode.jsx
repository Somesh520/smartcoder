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

                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Action Required</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '30px', lineHeight: '1.6' }}>
                    To participate in competitions, you need to sync your LeetCode account. We use a secure extension to fetch problems and verify submissions.
                </p>

                {/* Steps */}
                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginBottom: '30px' }}>

                    {/* Step 1: Manual Install Instructions */}
                    <div style={{ background: '#3f3f46', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ background: '#2563eb', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>1</div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#60a5fa' }}>Install Extension (Developer Mode)</div>
                        </div>
                        <ul style={{ fontSize: '13px', color: '#e4e4e7', paddingLeft: '20px', margin: 0, lineHeight: '1.5' }}>
                            <li>Open Chrome and go to <code style={{ background: '#18181b', padding: '2px 4px', borderRadius: '4px' }}>chrome://extensions</code></li>
                            <li>Toggle <b>"Developer mode"</b> (top-right) to <b>ON</b>.</li>
                            <li>Click <b>"Load unpacked"</b> button.</li>
                            <li>Select the <code style={{ background: '#18181b', padding: '2px 4px', borderRadius: '4px' }}>leetcode-sync-ext</code> folder in this project.</li>
                        </ul>
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
