import React, { useState } from 'react';
import { X, Check, Copy, Loader2 } from 'lucide-react';
import { BASE_URL, getAuthHeaders } from '../api';

const TopUpModal = ({ isOpen, onClose, onSuccess }) => {
    const [txnId, setTxnId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState({ amount: 30, credits: 30 }); // Default 30

    const plans = [
        { amount: 30, credits: 30 },
        { amount: 50, credits: 50 }
    ];

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
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    transactionId: txnId,
                    amount: selectedPlan.amount,
                    credits: selectedPlan.credits
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess && onSuccess();
                    onClose();
                    setSuccess(false);
                    setTxnId('');
                    setSelectedPlan(plans[0]);
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

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=someshtiwari532@okaxis&pn=SmartCoder&am=${selectedPlan.amount}&cu=INR`;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                background: '#18181b', border: '1px solid #27272a',
                borderRadius: '16px', width: '380px', padding: '24px',
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
                        Get More Credits 💎
                    </h2>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#a1a1aa' }}>
                        Select a plan and pay via UPI
                    </p>
                </div>

                {/* Plan Selection */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    {plans.map(plan => (
                        <div
                            key={plan.amount}
                            onClick={() => setSelectedPlan(plan)}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '10px',
                                border: selectedPlan.amount === plan.amount ? '1px solid #8b5cf6' : '1px solid #3f3f46',
                                background: selectedPlan.amount === plan.amount ? 'rgba(139, 92, 246, 0.1)' : '#27272a',
                                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#f4f4f5' }}>
                                ₹{plan.amount}
                            </div>
                            <div style={{ fontSize: '12px', color: selectedPlan.amount === plan.amount ? '#a78bfa' : '#a1a1aa' }}>
                                {plan.credits} Credits
                            </div>
                        </div>
                    ))}
                </div>

                {/* QR Display */}
                <div style={{
                    background: '#fff', padding: '12px', borderRadius: '12px',
                    margin: '0 auto 20px', width: 'fit-content',
                    border: '4px solid #fff'
                }}>
                    <img
                        src={qrUrl}
                        alt="QR Code"
                        style={{ display: 'block', width: '140px', height: '140px' }}
                    />
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#18181b', fontWeight: 700, textAlign: 'center' }}>
                        someshtiwari532@okaxis
                    </div>
                </div>

                {/* Input */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>
                        Paste Transaction / UTR ID
                    </label>
                    <input
                        type="text"
                        value={txnId}
                        onChange={(e) => setTxnId(e.target.value)}
                        placeholder="Expected: 12-digit UPI Ref ID"
                        style={{
                            width: '93%', padding: '12px',
                            background: '#09090b', border: '1px solid #3f3f46',
                            borderRadius: '8px', color: '#e4e4e7', outline: 'none',
                            fontSize: '14px', fontFamily: 'monospace'
                        }}
                    />
                </div>

                {error && <div style={{ color: '#f87171', fontSize: '12px', marginBottom: '12px', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: '6px' }}>{error}</div>}

                {success ? (
                    <div style={{
                        background: 'rgba(34,197,94,0.1)', color: '#4ade80',
                        padding: '12px', borderRadius: '8px', textAlign: 'center',
                        fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        <Check size={18} /> Request Submitted!
                    </div>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '12px',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                            border: 'none', borderRadius: '8px', color: '#fff',
                            fontWeight: 600, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                        }}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Verifying...' : `Submit Request for ₹${selectedPlan.amount}`}
                    </button>
                )}
            </div>
            <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default TopUpModal;
