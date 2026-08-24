import React, { useState } from 'react';
import { X, Check, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { BASE_URL, getAuthHeaders } from '../api';

const TopUpModal = ({ isOpen, onClose, onSuccess, user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState({ amount: 10, credits: 10 }); // Default 10

    const plans = [
        { amount: 10, credits: 10 },
        { amount: 30, credits: 30 },
        { amount: 50, credits: 50 }
    ];

    if (!isOpen) return null;

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Fetch Order details from Backend
            const orderRes = await fetch(`${BASE_URL}/api/payment/razorpay-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ amount: selectedPlan.amount })
            });

            if (!orderRes.ok) {
                const errData = await orderRes.json();
                throw new Error(errData.error || "Order creation failed");
            }

            const orderData = await orderRes.json();

            // 2. Configure Razorpay checkout options
            const options = {
                key: "rzp_live_TTi2Yf4lj6c6kH", // Live Key ID
                amount: orderData.amount,
                currency: orderData.currency,
                name: "SmartCoder",
                description: `Get ${selectedPlan.credits} credits instantly`,
                order_id: orderData.id,
                handler: async function (response) {
                    setLoading(true);
                    try {
                        // 3. Verify signature on successful transaction
                        const verifyRes = await fetch(`${BASE_URL}/api/payment/razorpay-verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                ...getAuthHeaders()
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                credits: selectedPlan.credits,
                                amount: selectedPlan.amount
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok && verifyData.success) {
                            setSuccess(true);
                            setTimeout(() => {
                                onSuccess && onSuccess(verifyData.newCredits);
                                onClose();
                                setSuccess(false);
                            }, 2000);
                        } else {
                            setError(verifyData.error || "Payment verification failed");
                        }
                    } catch (verifyErr) {
                        setError("Verification connection failed");
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: user?.displayName || "",
                    email: user?.email || ""
                },
                theme: {
                    color: "#2cbb5d" // Matches AlgoDuel theme
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Razorpay Error:", err);
            setError(err.message || "Unable to start Razorpay payment");
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)'
        }}>
            <div className="neo-card" style={{
                background: 'var(--bg-card)', border: 'var(--border-main)',
                borderRadius: '0', width: '380px', padding: '32px',
                boxShadow: 'var(--shadow-main)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '50px', height: '50px', background: 'var(--accent)',
                        borderRadius: '0', border: 'var(--border-main)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'black', margin: '0 auto 16px'
                    }}>
                        <CreditCard size={24} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 950, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                        GET_CREDITS 💎
                    </h2>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        Add credits instantly using Razorpay
                    </p>
                </div>

                {/* Plan Selection */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
                    {plans.map(plan => (
                        <div
                            key={plan.amount}
                            onClick={() => setSelectedPlan(plan)}
                            style={{
                                flex: 1, padding: '16px 12px', borderRadius: '0',
                                border: selectedPlan.amount === plan.amount ? 'var(--border-main)' : 'var(--border-main)',
                                background: selectedPlan.amount === plan.amount ? 'var(--accent)' : 'var(--bg-main)',
                                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                transform: selectedPlan.amount === plan.amount ? 'translateY(-2px)' : 'none',
                                boxShadow: selectedPlan.amount === plan.amount ? 'var(--shadow-main)' : 'none'
                            }}
                        >
                            <div style={{ fontSize: '20px', fontWeight: 950, color: selectedPlan.amount === plan.amount ? 'black' : 'var(--text-main)' }}>
                                ₹{plan.amount}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: selectedPlan.amount === plan.amount ? 'black' : 'var(--text-muted)', marginTop: '4px' }}>
                                {plan.credits} Credits
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div style={{
                        color: '#f87171',
                        fontSize: '13px',
                        marginBottom: '16px',
                        textAlign: 'center',
                        background: 'rgba(239,68,68,0.1)',
                        padding: '10px 14px',
                        border: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center',
                        fontWeight: 700
                    }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {success ? (
                    <div style={{
                        background: 'rgba(34,197,94,0.1)', color: '#4ade80',
                        padding: '14px', borderRadius: '8px', textAlign: 'center',
                        fontWeight: 950, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        <Check size={20} /> PAYMENT_VERIFIED! 💎
                    </div>
                ) : (
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="neo-btn"
                        style={{
                            width: '100%', padding: '14px',
                            background: 'var(--accent)',
                            color: 'black', border: 'var(--border-main)',
                            fontWeight: 950, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'PROCESSING...' : `PAY_₹${selectedPlan.amount}_SECURELY`}
                    </button>
                )}
            </div>
            <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default TopUpModal;
