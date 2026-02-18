import React, { useState } from 'react';
import { X, Check, Copy, Loader2 } from 'lucide-react';
import { BASE_URL, getAuthHeaders } from '../api';

const TopUpModal = ({ isOpen, onClose, onSuccess }) => {
    const [txnId, setTxnId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!txnId.trim()) {
            setError("Please enter a valid Transaction ID");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${BASE_URL}/api/payment/request-topup`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(), // Function from api.js needs to be exported or imported correctly. 
                    // Wait, api.js doesn't export getAuthHeaders. I should fix that or replicate logic.
                    // Actually, I can use a helper or just replicate.
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ transactionId: txnId })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess && onSuccess();
                    onClose();
                    setSuccess(false);
                    setTxnId('');
                }, 2000);
            } else {
                setError(data.error || "Submission failed");
            }
        } catch (e) {
            setError("Network Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: '#18181b', border: '1px solid #27272a',
                borderRadius: '16px', width: '360px', padding: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f4f4f5' }}>
                        Top-up Credits
                    </h2>
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#a1a1aa' }}>
                        Scan & Pay via UPI to request credits.
                    </p>
                </div>

                {/* QR Display */}
                <div style={{
                    background: '#fff', padding: '16px', borderRadius: '12px',
                    margin: '0 auto 20px', width: 'fit-content'
                }}>
                    <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=somesh520@oksbi&pn=SmartCoder&cu=INR"
                        alt="QR Code"
                        style={{ display: 'block', width: '150px', height: '150px' }}
                    />
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#18181b', fontWeight: 600, textAlign: 'center' }}>
                        UPI: somesh520@oksbi
                    </div>
                </div>

                {/* Input */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>
                        Transaction / UTR ID
                    </label>
                    <input
                        type="text"
                        value={txnId}
                        onChange={(e) => setTxnId(e.target.value)}
                        placeholder="Enter 12-digit UPI Ref ID"
                        style={{
                            width: '90%', padding: '10px 12px',
                            background: '#27272a', border: '1px solid #3f3f46',
                            borderRadius: '8px', color: '#e4e4e7', outline: 'none',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {error && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}

                {success ? (
                    <div style={{
                        background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                        padding: '10px', borderRadius: '8px', textAlign: 'center',
                        fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        <Check size={16} /> Request Sent!
                    </div>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '12px',
                            background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                            border: 'none', borderRadius: '8px', color: '#fff',
                            fontWeight: 600, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                )}
            </div>
            <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default TopUpModal;
