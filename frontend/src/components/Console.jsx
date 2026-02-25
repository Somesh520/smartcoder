import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronUp, ChevronDown, CheckCircle2, XCircle, Loader2, Maximize2, Minimize2, Copy, GripHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Console = ({
    isOpen,
    onToggle,
    result,
    isLoading,
    customInput,
    setCustomInput,
    showInputSection,
    setShowInputSection,
    theme
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [height, setHeight] = useState(350);
    const [isResizing, setIsResizing] = useState(false);
    const consoleRef = useRef(null);

    // Resizing Logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const newHeight = window.innerHeight - e.clientY;
            if (newHeight > 100 && newHeight < window.innerHeight - 100) {
                setHeight(newHeight);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'row-resize';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Animation Variants
    const contentVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    const tabVariants = {
        inactive: { color: 'var(--text-muted)', scale: 1 },
        active: { color: 'var(--text-main)', scale: 1.05 }
    };

    const getResultContent = () => {
        if (isLoading) {
            return (
                <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px'
                }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
                            filter: 'blur(10px)', animation: 'pulse-glow 2s infinite'
                        }}></div>
                        <Loader2 size={48} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', position: 'relative', zIndex: 1 }} />
                    </div>
                    <div style={{
                        fontSize: '14px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <span className="typing-dots">EXECUTING_CODE</span>
                    </div>
                    <style>{`
                        @keyframes pulse-glow { 0%, 100% { opacity: 0.5; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
                        .typing-dots::after { content: '...'; animation: typing 1.5s infinite steps(4); display: inline-block; width: 0; overflow: hidden; vertical-align: bottom; }
                        @keyframes typing { to { width: 1.25em; } }
                    `}</style>
                </div>
            );
        }

        if (showInputSection) {
            return (
                <motion.div
                    key="input"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="input-section"
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 950, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            INPUT_STDIN
                        </label>
                    </div>

                    <textarea
                        className="custom-input neo-input"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter input here..."
                        style={{
                            flex: 1,
                            background: 'var(--bg-main)',
                            border: 'var(--border-main)',
                            color: 'var(--text-main)',
                            padding: '16px',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '14px',
                            resize: 'none',
                            outline: 'none',
                            lineHeight: '1.6',
                            transition: 'all 0.2s'
                        }}
                    />
                    <style>{`
                        .neo-input:focus {
                            border-color: var(--accent) !important;
                            box-shadow: var(--shadow-main);
                        }
                    `}</style>
                </motion.div>
            );
        }

        if (!result) {
            return (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', flexDirection: 'column', gap: '10px' }}>
                    <Terminal size={40} opacity={0.3} />
                    <span style={{ fontSize: '14px' }}>Ready to execute code...</span>
                </div>
            );
        }

        // ERROR
        if (result.run_success === false) {
            return (
                <motion.div key="error" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        color: '#f87171', fontSize: '16px', fontWeight: 700, marginBottom: '16px',
                        padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        <XCircle size={20} />
                        <span>Compilation Error</span>
                    </div>
                    <pre style={{
                        color: 'var(--accent-red)', background: 'var(--bg-main)', padding: '16px',
                        fontSize: '13px', lineHeight: '1.6',
                        border: 'var(--border-main)', overflowX: 'auto',
                        fontFamily: "'JetBrains Mono', monospace"
                    }}>
                        {result.full_runtime_error || result.compile_error}
                    </pre>
                    <button
                        onClick={() => setShowInputSection(true)}
                        className="action-btn"
                        style={{ marginTop: '16px' }}
                    >
                        Edit Input
                    </button>
                    <style>{`
                        .action-btn {
                            background: var(--accent);
                            color: black; border: var(--border-main); padding: 8px 16px; 
                            font-size: 13px; font-weight: 800; cursor: pointer;
                            transition: transform 0.2s, box-shadow 0.2s;
                        }
                        .action-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-main); }
                    `}</style>
                </motion.div>
            );
        }

        // RESULT TABS
        const count = result.total_testcases || (result.code_answer || []).length;
        const compareRes = result.compare_result || "";
        const inputs = result.input_formatted || [];
        const myOut = result.code_answer || [];
        const expOut = result.expected_code_answer || [];

        // Handle "Accepted" vs "Wrong Answer" Banner
        const isRunCode = result.submission_id && String(result.submission_id).includes("runcode");
        const isAccepted = result.status_msg === 'Accepted';

        return (
            <motion.div key="result" variants={contentVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Status Banner (Only for Submit) */}
                {!isRunCode && result.status_msg && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '16px 24px', marginBottom: '20px', borderRadius: '12px',
                            background: isAccepted ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            border: isAccepted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                            boxShadow: isAccepted ? '0 10px 30px rgba(34, 197, 94, 0.15), inset 0 0 20px rgba(34, 197, 94, 0.05)' : '0 10px 30px rgba(239, 68, 68, 0.15), inset 0 0 20px rgba(239, 68, 68, 0.05)',
                            position: 'relative', overflow: 'hidden'
                        }}>
                        {/* Shimmer Effect */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                            style={{
                                position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                transform: 'skewX(-20deg)', pointerEvents: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isAccepted ? <CheckCircle2 size={24} color="#22c55e" /> : <XCircle size={24} color="#ef4444" />}
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: isAccepted ? '#22c55e' : '#ef4444' }}>
                                    {result.status_msg}
                                </h3>
                                {!isAccepted && <span style={{ fontSize: '13px', color: '#9ca3af' }}>{result.total_correct}/{result.total_testcases} testcases passed</span>}
                            </div>
                        </div>
                        {isAccepted && (
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <div className="stat-pill">⏱️ {result.status_runtime || 'N/A'}</div>
                                <div className="stat-pill">💾 {result.status_memory || 'N/A'}</div>
                                {result.complexity && (
                                    <>
                                        <div className="stat-pill" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                                            ⌛ {result.complexity.timeComplexity}
                                        </div>
                                        <div className="stat-pill" style={{ color: 'var(--text-main)', borderColor: 'var(--text-main)' }}>
                                            📦 {result.complexity.spaceComplexity}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        <style>{`
                            .stat-pill {
                                background: rgba(0,0,0,0.3); padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);
                                font-size: 13px; color: var(--text-main); font-weight: 800;
                                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                            }
                        `}</style>
                    </motion.div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {Array.from({ length: count }).map((_, i) => {
                        const isPass = compareRes[i] === '1';
                        // If runcode, we might not have pass/fail for specific cases easily unless parsed
                        // Assuming compareRes is simplified "11100" string
                        const statusColor = isPass ? '#22c55e' : '#ef4444';

                        return (
                            <div
                                key={i}
                                onClick={() => setActiveTab(i)}
                                style={{
                                    position: 'relative',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    background: activeTab === i ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 900, color: activeTab === i ? 'var(--text-main)' : 'var(--text-muted)' }}>

                                    <span style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: statusColor, boxShadow: `0 0 8px ${statusColor}80`
                                    }}></span>
                                    Case {i + 1}
                                </div>
                                {activeTab === i && (
                                    <motion.div
                                        layoutId="activeTab"
                                        style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
                                            background: 'var(--accent)', borderRadius: '0'
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Case Details */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <IOBlock label="Input" content={inputs[activeTab]} />
                    <IOBlock label="Your Output" content={myOut[activeTab]} highlight={compareRes[activeTab] === '0' ? 'red' : 'green'} />
                    <IOBlock label="Expected Output" content={expOut[activeTab]} />
                </div>
            </motion.div>
        );
    };

    return (
        <motion.div
            initial={false}
            animate={{ height: isOpen ? height : 45 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
                position: 'absolute', bottom: 0, width: '100%',
                maxHeight: 'calc(100% - 50px)',
                background: 'var(--bg-card)',
                borderTop: 'var(--border-main)',
                display: 'flex', flexDirection: 'column',
                zIndex: 50,
                boxShadow: 'var(--shadow-main)'
            }}
        >
            {/* Header / Resize Handle */}
            <div
                onMouseDown={(e) => { e.stopPropagation(); setIsResizing(true); }}
                style={{
                    height: '6px', width: '100%', cursor: 'row-resize',
                    position: 'absolute', top: 0, left: 0, zIndex: 60,
                    background: 'transparent'
                }}
            />

            <div
                className="console-header"
                onClick={onToggle}
                style={{
                    height: '45px', minHeight: '45px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 20px', cursor: 'pointer',
                    background: 'var(--bg-main)',
                    borderBottom: 'var(--border-main)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Terminal size={16} color="var(--accent)" />
                    <span style={{ fontSize: '13px', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '0.5px' }}>CONSOLE</span>
                    {result && !isLoading && (
                        <span style={{
                            fontSize: '11px', padding: '2px 8px',
                            background: result.run_success !== false ? 'var(--accent-green)' : 'var(--accent-red)',
                            color: result.run_success !== false ? 'black' : 'white',
                            border: 'var(--border-main)',
                            fontWeight: 900, textTransform: 'uppercase'
                        }}>
                            {result.status_msg || (result.run_success !== false ? 'SUCCESS' : 'ERROR')}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="resize-hint" style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.4 }}>
                        <GripHorizontal size={14} />
                    </div>
                    {isOpen ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronUp size={18} color="var(--text-muted)" />}
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflow: 'hidden', padding: '20px', position: 'relative' }}>
                <AnimatePresence mode="wait">
                    {getResultContent()}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// Helper Component for IO Blocks
const IOBlock = ({ label, content, highlight }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
        </span>
        <div style={{
            background: 'var(--bg-main)',
            padding: '12px 16px',
            borderRadius: '0',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            color: highlight === 'red' ? 'var(--accent-red)' : highlight === 'green' ? 'var(--accent-green)' : 'var(--text-main)',
            border: 'var(--border-main)',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            boxShadow: 'var(--shadow-main)'
        }}>
            {content || <span style={{ opacity: 0.3, fontStyle: 'italic' }}>Empty</span>}
        </div>
    </div>
);

export default Console;
