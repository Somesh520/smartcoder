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
                    background: 'rgba(2, 2, 2, 0.95)', backdropFilter: 'blur(12px)'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        style={{
                            background: '#0a0a0a',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '40px 32px',
                            maxWidth: '480px',
                            width: '90%',
                            textAlign: 'center',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute', top: '20px', right: '20px',
                                background: 'transparent', border: 'none', color: '#444',
                                cursor: 'pointer', transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#fff'}
                            onMouseLeave={(e) => e.target.style.color = '#444'}
                        >
                            <X size={20} />
                        </button>

                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: 'rgba(34, 197, 94, 0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px', border: '1px solid rgba(34, 197, 94, 0.2)'
                        }}>
                            <CheckCircle2 size={32} color="#22c55e" />
                        </div>

                        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                            Accepted
                        </h2>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px', fontWeight: 500 }}>
                            All test cases passed successfully.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ background: '#111', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '11px', color: '#666', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Runtime</div>
                                <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{stats.runtime || '0 ms'}</div>
                            </div>
                            <div style={{ background: '#111', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '11px', color: '#666', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Memory</div>
                                <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{stats.memory || '22.7 MB'}</div>
                            </div>
                        </div>

                        {stats.complexity && (
                            <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#666', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Time Complexity</div>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent)' }}>{stats.complexity.timeComplexity}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '10px', color: '#666', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Space Complexity</div>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{stats.complexity.spaceComplexity}</div>
                                    </div>
                                </div>

                                <div style={{ height: '180px', width: '100%', marginBottom: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <ComplexityChart
                                        data={stats.complexity.complexityData}
                                        complexity={stats.complexity.timeComplexity}
                                    />
                                </div>

                                <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.6', fontWeight: 500 }}>
                                    {stats.complexity.explanation}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            style={{
                                marginTop: '32px', width: '100%', background: '#fff', color: '#000',
                                border: 'none', padding: '14px', fontSize: '14px', fontWeight: 800,
                                cursor: 'pointer', transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                            Back to Workspace
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const ComplexityChart = ({ data, complexity }) => {
    // Generate comparison data points
    const generateComparisonData = () => {
        const points = [];
        const nValues = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];

        for (let i = 0; i < nValues.length; i++) {
            const n = nValues[i];
            points.push({
                n,
                o1: 10,
                ologn: Math.log2(n) * 10 + 10,
                on: n * 2 + 10,
                onlogn: n * Math.log2(n) * 0.5 + 10,
                on2: Math.pow(n, 2) * 0.05 + 10,
                // Match the actual user data to the chart's n values or just use user data points
                user: data && data[i] ? data[i].ops : null
            });
        }
        return points;
    };

    const chartData = generateComparisonData();

    // Determine which line to highlight
    const normalizedComplexity = complexity?.toLowerCase().replace(/\s/g, '') || '';
    const isO1 = normalizedComplexity.includes('(1)');
    const isOLogN = normalizedComplexity.includes('logn');
    const isON = normalizedComplexity.includes('(n)') && !normalizedComplexity.includes('logn') && !normalizedComplexity.includes('n^2');
    const isONLogN = normalizedComplexity.includes('nlogn');
    const isON2 = normalizedComplexity.includes('n^2');

    const commonLineProps = {
        type: "monotone",
        dot: false,
        strokeWidth: 1.5,
        animationDuration: 1500
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="n" hide />
                <YAxis hide domain={[0, 'auto']} />

                {/* Benchmark Lines */}
                <Line {...commonLineProps} dataKey="o1" stroke={isO1 ? "var(--accent)" : "rgba(255,255,255,0.1)"} strokeWidth={isO1 ? 3 : 1.5} />
                <Line {...commonLineProps} dataKey="ologn" stroke={isOLogN ? "var(--accent)" : "rgba(255,255,255,0.1)"} strokeWidth={isOLogN ? 3 : 1.5} />
                <Line {...commonLineProps} dataKey="on" stroke={isON ? "var(--accent)" : "rgba(255,255,255,0.1)"} strokeWidth={isON ? 3 : 1.5} />
                <Line {...commonLineProps} dataKey="onlogn" stroke={isONLogN ? "var(--accent)" : "rgba(255,255,255,0.1)"} strokeWidth={isONLogN ? 3 : 1.5} />
                <Line {...commonLineProps} dataKey="on2" stroke={isON2 ? "var(--accent)" : "rgba(255,255,255,0.1)"} strokeWidth={isON2 ? 3 : 1.5} />

                {/* User Data Point Indicator (Optional, LeetCode style uses the lines) */}

                <Tooltip
                    contentStyle={{
                        background: '#111',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '10px',
                        color: '#fff',
                        borderRadius: '0'
                    }}
                    labelStyle={{ display: 'none' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default SubmissionSuccess;
