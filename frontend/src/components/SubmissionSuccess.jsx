import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, Trophy, Zap, X } from 'lucide-react';

const SubmissionSuccess = ({ isOpen, onClose, stats }) => {
    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#22c55e', '#3b82f6', '#f59e0b']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#22c55e', '#3b82f6', '#f59e0b']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        style={{
                            background: 'var(--bg-card)',
                            border: 'var(--border-main)',
                            borderRadius: '0',
                            padding: '40px',
                            maxWidth: '500px',
                            width: '90%',
                            textAlign: 'center',
                            boxShadow: 'var(--shadow-main)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Background Glow */}
                        <div style={{
                            position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                            background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
                            animation: 'spin 10s linear infinite', pointerEvents: 'none'
                        }}></div>

                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute', top: '16px', right: '16px',
                                background: 'transparent', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={24} />
                        </button>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ marginBottom: '24px' }}
                        >
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'rgba(34, 197, 94, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px', border: '2px solid rgba(34, 197, 94, 0.3)'
                            }}>
                                <Trophy size={40} color="#22c55e" />
                            </div>
                            <h2 style={{ fontSize: '28px', fontWeight: 950, color: 'var(--text-main)', margin: '0 0 8px', textTransform: 'uppercase' }}>
                                SOLUTION_ACCEPTED
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0, fontWeight: 700 }}>
                                Problem solved successfully.
                            </p>
                        </motion.div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                            <StatCard
                                label="Runtime"
                                value={stats.runtime || 'N/A'}
                                icon={<Zap size={18} color="#3b82f6" />}
                                color="rgba(59, 130, 246, 0.1)"
                                borderColor="rgba(59, 130, 246, 0.3)"
                            />
                            <StatCard
                                label="Memory"
                                value={stats.memory || 'N/A'}
                                icon={<CheckCircle2 size={18} color="#22c55e" />}
                                color="rgba(34, 197, 94, 0.1)"
                                borderColor="rgba(34, 197, 94, 0.3)"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={onClose}
                                className="neo-btn"
                                style={{
                                    background: 'var(--accent-green)',
                                    color: 'black', border: 'var(--border-main)', padding: '12px 24px',
                                    fontSize: '15px', fontWeight: 950,
                                    cursor: 'pointer', flex: 1,
                                }}
                            >
                                CONTINUE_CODING
                            </button>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const StatCard = ({ label, value, icon, color, borderColor }) => (
    <motion.div
        whileHover={{ scale: 1.05, translateY: -5 }}
        style={{
            background: 'var(--bg-main)',
            border: 'var(--border-main)',
            padding: '20px',
            borderRadius: '0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-main)'
        }}
    >
        <div style={{ opacity: 1 }}>{icon}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 950, letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: 950, color: 'var(--text-main)' }}>{value}</div>
    </motion.div>
);

export default SubmissionSuccess;
