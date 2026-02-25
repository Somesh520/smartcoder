import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, Trophy, Zap, X, Sparkles } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const SubmissionSuccess = ({ isOpen, onClose, stats }) => {
    useEffect(() => {
        if (isOpen) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#a78bfa', '#22c55e', '#3b82f6'] });
                confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#a78bfa', '#22c55e', '#3b82f6'] });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.92)', backdropFilter: 'blur(20px)'
                }}>
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        style={{
                            background: '#050505',
                            border: '1px solid rgba(255,255,255,0.06)',
                            padding: '48px 40px',
                            maxWidth: '520px',
                            width: '95%',
                            textAlign: 'center',
                            position: 'relative',
                            boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.9)',
                            borderRadius: '16px'
                        }}
                    >
                        {/* Decorative Top Line */}
                        <div style={{
                            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                            width: '40%', height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                            opacity: 0.4
                        }} />

                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute', top: '24px', right: '24px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                color: '#444', borderRadius: '50%', width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#444'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        >
                            <X size={16} />
                        </button>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                            style={{
                                width: '80px', height: '80px', borderRadius: '28px',
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.02))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 24px', border: '1px solid rgba(34, 197, 94, 0.2)',
                                boxShadow: '0 0 30px rgba(34, 197, 94, 0.1)'
                            }}
                        >
                            <Trophy size={40} color="#22c55e" />
                        </motion.div>

                        <h2 style={{ fontSize: '32px', fontWeight: 950, color: '#fff', margin: '0 0 8px', letterSpacing: '-1.5px' }}>
                            Accepted
                        </h2>
                        <p style={{ color: '#666', fontSize: '15px', marginBottom: '32px', fontWeight: 600 }}>
                            All test cases passed successfully.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
                            <ResultCard
                                label="Runtime"
                                value={stats.runtime || '0 ms'}
                                icon={<Zap size={14} color="#3b82f6" />}
                                sub="Faster than 96.5%"
                            />
                            <ResultCard
                                label="Memory"
                                value={stats.memory || '22.9 MB'}
                                icon={<Sparkles size={14} color="#a78bfa" />}
                                sub="Less than 89.2%"
                            />
                        </div>

                        {stats.complexity && (
                            <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#555', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Time Efficiency</div>
                                        <div style={{ fontSize: '24px', fontWeight: 950, color: 'var(--accent)' }}>{stats.complexity.timeComplexity}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '10px', color: '#555', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Space Efficiency</div>
                                        <div style={{ fontSize: '24px', fontWeight: 950, color: '#fff' }}>{stats.complexity.spaceComplexity}</div>
                                    </div>
                                </div>

                                <div style={{
                                    height: '220px', width: '100%', marginBottom: '24px',
                                    background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)',
                                    borderRadius: '12px', overflow: 'hidden', padding: '20px'
                                }}>
                                    <ComplexityChart
                                        complexity={stats.complexity.timeComplexity}
                                    />
                                </div>

                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.7', fontWeight: 500, margin: 0 }}>
                                    {stats.complexity.explanation}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            style={{
                                marginTop: '40px', width: '100%',
                                background: '#fff', color: '#000',
                                border: 'none', padding: '16px', borderRadius: '12px',
                                fontSize: '15px', fontWeight: 950, letterSpacing: '0.5px',
                                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: '0 10px 40px rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(-3px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(255, 255, 255, 0.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(255, 255, 255, 0.1)'; }}
                        >
                            Back to Workspace
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const ResultCard = ({ label, value, icon, sub }) => (
    <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
        padding: '24px 20px', borderRadius: '16px', textAlign: 'left',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'default'
    }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px', borderRadius: '8px' }}>{icon}</div>
            <span style={{ fontSize: '11px', color: '#555', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</span>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 950, color: '#fff', marginBottom: '4px' }}>{value}</div>
        <div style={{ fontSize: '11px', color: '#444', fontWeight: 700 }}>{sub}</div>
    </div>
);

const ComplexityChart = ({ complexity }) => {
    const nValues = [1, 2, 4, 8, 16, 32, 64, 128, 256, 384, 512];
    const chartData = nValues.map(n => ({
        n,
        o1: 20,
        ologn: Math.log2(n) * 10 + 20,
        on: n * 0.4 + 20,
        onlogn: n * Math.log2(n) * 0.08 + 20,
        on2: Math.pow(n, 2) * 0.0018 + 20,
    }));

    const normalizedComplex = complexity?.toLowerCase().replace(/\s/g, '') || '';
    const highlight = normalizedComplex.includes('(1)') ? 'o1' :
        normalizedComplex.includes('logn') ? 'ologn' :
            (normalizedComplex.includes('(n)') && !normalizedComplex.includes('logn')) ? 'on' :
                normalizedComplex.includes('nlogn') ? 'onlogn' :
                    normalizedComplex.includes('n^2') ? 'on2' : 'on';

    const getStroke = (key) => highlight === key ? 'var(--accent)' : 'rgba(255,255,255,0.06)';
    const getStrokeWidth = (key) => highlight === key ? 3.5 : 1.5;
    const getOpacity = (key) => highlight === key ? 1 : 0.4;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="n" hide />
                    <YAxis hide domain={[0, 100]} />

                    <Line type="monotone" dataKey="o1" stroke={getStroke('o1')} strokeWidth={getStrokeWidth('o1')} strokeOpacity={getOpacity('o1')} dot={false} animationDuration={1000} />
                    <Line type="monotone" dataKey="ologn" stroke={getStroke('ologn')} strokeWidth={getStrokeWidth('ologn')} strokeOpacity={getOpacity('ologn')} dot={false} animationDuration={1200} />
                    <Line type="monotone" dataKey="on" stroke={getStroke('on')} strokeWidth={getStrokeWidth('on')} strokeOpacity={getOpacity('on')} dot={false} animationDuration={1400} />
                    <Line type="monotone" dataKey="onlogn" stroke={getStroke('onlogn')} strokeWidth={getStrokeWidth('onlogn')} strokeOpacity={getOpacity('onlogn')} dot={false} animationDuration={1600} />
                    <Line type="monotone" dataKey="on2" stroke={getStroke('on2')} strokeWidth={getStrokeWidth('on2')} strokeOpacity={getOpacity('on2')} dot={false} animationDuration={1800} />
                </LineChart>
            </ResponsiveContainer>

            {/* Legend / Labels */}
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '50px', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', fontSize: '9px', fontWeight: 950, color: '#333', textAlign: 'right', paddingRight: '5px' }}>
                <span style={{ color: highlight === 'on2' ? 'var(--accent)' : '#333', transform: 'translateY(-18px)' }}>O(n²)</span>
                <span style={{ color: highlight === 'onlogn' ? 'var(--accent)' : '#333', transform: 'translateY(-8px)' }}>O(n log n)</span>
                <span style={{ color: highlight === 'on' ? 'var(--accent)' : '#333', transform: 'translateY(2px)' }}>O(n)</span>
                <span style={{ color: highlight === 'ologn' ? 'var(--accent)' : '#333', transform: 'translateY(12px)' }}>O(log n)</span>
                <span style={{ color: highlight === 'o1' ? 'var(--accent)' : '#333', transform: 'translateY(22px)' }}>O(1)</span>
            </div>
        </div>
    );
};

export default SubmissionSuccess;
