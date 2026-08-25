import React, { useState } from 'react';
import { X, Check, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { BASE_URL, getAuthHeaders } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const TopUpModal = ({ isOpen, onClose, onSuccess, user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState({ amount: 30, credits: 30, label: 'Pro', glow: '#2cbb5d' });

    const plans = [
        { amount: 10, credits: 10, label: 'Starter', glow: '#60a5fa', desc: 'Quick top-up' },
        { amount: 30, credits: 30, label: 'Pro', glow: '#2cbb5d', desc: 'Most picked', popular: true },
        { amount: 50, credits: 50, label: 'Ultra', glow: '#f59e0b', desc: 'Heavy usage' }
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
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'radial-gradient(circle at 80% 15%, rgba(44,187,93,0.16), transparent 40%), rgba(0,0,0,0.82)',
                        zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(9px)',
                        padding: '16px'
                    }}
                >
                    <motion.div
                        className="neo-card"
                        initial={{ y: 26, opacity: 0, scale: 0.96 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 18, opacity: 0, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                        style={{
                            background: 'linear-gradient(165deg, rgba(24,24,27,0.98), rgba(13,14,17,0.98))',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            width: 'min(560px, 100%)',
                            padding: '26px',
                            boxShadow: '0 20px 55px rgba(0,0,0,0.5)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-70px',
                            right: '-70px',
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(44,187,93,0.23), transparent 70%)',
                            pointerEvents: 'none'
                        }} />

                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute', top: '12px', right: '12px',
                                width: '34px', height: '34px',
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
                            <motion.div
                                animate={{ y: [0, -3, 0] }}
                                transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                                style={{
                                    width: '54px', height: '54px', background: 'var(--accent)',
                                    borderRadius: '14px', border: '1px solid rgba(44,187,93,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#000', margin: '0 auto 14px', boxShadow: '0 10px 25px rgba(44,187,93,0.35)'
                                }}
                            >
                                <CreditCard size={24} />
                            </motion.div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.4px' }}>
                                Upgrade AI Credits
                            </h2>
                            <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>
                                Instant top-up via Razorpay. Pick a plan and continue coding.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '18px' }}>
                            {plans.map((plan, idx) => {
                                const active = selectedPlan.amount === plan.amount;
                                return (
                                    <motion.button
                                        key={plan.amount}
                                        type="button"
                                        onClick={() => setSelectedPlan(plan)}
                                        initial={{ y: 12, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.05 * idx }}
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            position: 'relative',
                                            padding: '14px 10px',
                                            borderRadius: '14px',
                                            border: active ? `1px solid ${plan.glow}` : '1px solid rgba(255,255,255,0.1)',
                                            background: active
                                                ? `linear-gradient(170deg, ${plan.glow}22, rgba(24,24,27,0.95))`
                                                : 'rgba(255,255,255,0.02)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            boxShadow: active ? `0 10px 24px ${plan.glow}33` : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {plan.popular && (
                                            <span style={{
                                                position: 'absolute', top: '-9px', right: '10px',
                                                fontSize: '10px', fontWeight: 800,
                                                color: '#000', background: 'var(--accent)',
                                                borderRadius: '999px', padding: '3px 8px'
                                            }}>
                                                Popular
                                            </span>
                                        )}
                                        <div style={{ fontSize: '12px', color: active ? '#fff' : 'var(--text-muted)', fontWeight: 800 }}>{plan.label}</div>
                                        <div style={{ marginTop: '2px', fontSize: '24px', fontWeight: 900, color: active ? '#fff' : 'var(--text-main)' }}>₹{plan.amount}</div>
                                        <div style={{ marginTop: '4px', fontSize: '12px', color: active ? '#d1fae5' : 'var(--text-muted)', fontWeight: 700 }}>{plan.credits} Credits</div>
                                        <div style={{ marginTop: '8px', fontSize: '10px', color: active ? '#d9ffe8' : '#8f96a3', fontWeight: 700 }}>{plan.desc}</div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div style={{
                            marginBottom: '14px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(44,187,93,0.24)',
                            background: 'rgba(44,187,93,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px',
                            color: '#d1fae5',
                            fontWeight: 700
                        }}>
                            <span>Selected Plan</span>
                            <span>{selectedPlan.credits} credits for ₹{selectedPlan.amount}</span>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    color: '#fca5a5',
                                    fontSize: '13px',
                                    marginBottom: '14px',
                                    textAlign: 'center',
                                    background: 'rgba(239,68,68,0.12)',
                                    padding: '10px 14px',
                                    border: '1px solid rgba(239,68,68,0.28)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    borderRadius: '10px'
                                }}
                            >
                                <AlertCircle size={16} /> {error}
                            </motion.div>
                        )}

                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    background: 'rgba(34,197,94,0.15)', color: '#86efac',
                                    padding: '14px', borderRadius: '12px', textAlign: 'center',
                                    fontWeight: 900, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    border: '1px solid rgba(34,197,94,0.35)'
                                }}
                            >
                                <Check size={20} /> Payment Verified
                            </motion.div>
                        ) : (
                            <motion.button
                                whileHover={loading ? {} : { y: -1 }}
                                whileTap={loading ? {} : { scale: 0.99 }}
                                onClick={handlePayment}
                                disabled={loading}
                                className="neo-btn"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'linear-gradient(135deg, #2cbb5d, #22c55e)',
                                    color: '#000',
                                    border: '1px solid rgba(44,187,93,0.5)',
                                    borderRadius: '12px',
                                    fontWeight: 900,
                                    fontSize: '14px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: loading ? 0.7 : 1,
                                    boxShadow: '0 10px 26px rgba(44,187,93,0.35)'
                                }}
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                {loading ? 'Processing Payment...' : `Pay ₹${selectedPlan.amount} Securely`}
                            </motion.button>
                        )}
                    </motion.div>

                    <style>{`
                        .animate-spin { animation: spin 1s linear infinite; }
                        @keyframes spin { to { transform: rotate(360deg); } }
                        @media (max-width: 560px) {
                            .neo-card { padding: 20px !important; }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TopUpModal;
