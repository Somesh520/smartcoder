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
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '24px',
                            padding: '40px',
                            maxWidth: '500px',
                            width: '90%',
                            textAlign: 'center',
                            boxShadow: '0 0 50px rgba(34, 197, 94, 0.2)',
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
                                background: 'transparent', border: 'none', color: '#64748b',
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
                            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                                Solution Accepted!
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                                You solved this problem properly.
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
                                style={{
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    color: '#fff', border: 'none', padding: '12px 24px',
                                    borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                                    cursor: 'pointer', flex: 1,
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                }}
                            >
                                Continue Coding
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
        whileHover={{ scale: 1.05 }}
        style={{
            background: color,
            border: `1px solid ${borderColor}`,
            padding: '20px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
        }}
    >
        <div style={{ opacity: 0.8 }}>{icon}</div>
        <div style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{value}</div>
    </motion.div>
);

export default SubmissionSuccess;
