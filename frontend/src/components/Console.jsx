import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const Console = ({
    isOpen,
    onToggle,
    result,
    isLoading,
    customInput,
    setCustomInput,
    showInputSection,
    setShowInputSection
}) => {
    const [activeTab, setActiveTab] = useState(0);

    const getResultContent = () => {
        if (isLoading) {
            return (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <Loader2 size={40} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                    <div style={{
                        fontSize: '14px',
                        color: '#9ca3af',
                        fontWeight: 600,
                        letterSpacing: '1px'
                    }}>EXECUTING CODE...</div>
                </div>
            );
        }

        // Input mode
        if (showInputSection) {
            return (
                <div className="input-section">
                    <label style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#9ca3af',
                        marginBottom: '8px',
                        fontWeight: 600,
                        letterSpacing: '0.5px'
                    }}>TESTCASE INPUT</label>
                    <textarea
                        className="custom-input"
                        rows="6"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter your test input here..."
                        style={{
                            width: '100%',
                            background: 'rgba(14, 14, 20, 0.8)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#e5e7eb',
                            borderRadius: '8px',
                            padding: '12px',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            resize: 'vertical',
                            outline: 'none',
                            boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)',
                            transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                            e.target.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.3)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                            e.target.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.1)';
                        }}
                    />
                </div>
            );
        }

        if (!result) return null;

        // ERROR
        if (result.run_success === false) {
            return (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#ef4444',
                        fontSize: '18px',
                        fontWeight: 700,
                        marginBottom: '20px',
                        padding: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                        <XCircle size={24} />
                        COMPILATION ERROR
                    </div>
                    <pre style={{
                        color: '#fca5a5',
                        background: 'rgba(14, 14, 20, 0.8)',
                        padding: '15px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        overflowX: 'auto'
                    }}>
                        {result.full_runtime_error || result.compile_error}
                    </pre>
                    <button
                        onClick={() => setShowInputSection(true)}
                        style={{
                            marginTop: '15px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#fff',
                            border: '1px solid rgba(59, 130, 246, 0.5)',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 5px 15px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
                        }}
                    >
                        Back to Input
                    </button>
                </div>
            );
        }

        // SUBMISSION (Full Stats)
        const isRunCode = result.submission_id && String(result.submission_id).includes("runcode");
        if (!isRunCode && result.submission_id) {
            const isAcc = result.status_msg === 'Accepted';
            return (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: isAcc ? '#22c55e' : '#ef4444',
                        fontSize: '20px',
                        fontWeight: 700,
                        marginBottom: '20px',
                        padding: '15px',
                        background: isAcc ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px',
                        border: `1px solid ${isAcc ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        boxShadow: `0 0 20px ${isAcc ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                        {isAcc ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
                        {result.status_msg}
                    </div>
                    {isAcc ? (
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: '#9ca3af',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                boxShadow: '0 0 10px rgba(34, 197, 94, 0.1)'
                            }}>
                                Runtime: <span style={{ fontWeight: 'bold', color: '#22c55e', fontSize: '14px' }}>{result.status_runtime}</span>
                            </div>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: '#9ca3af',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)'
                            }}>
                                Memory: <span style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '14px' }}>{result.status_memory}</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            marginBottom: '15px',
                            color: '#9ca3af',
                            fontSize: '14px',
                            padding: '10px',
                            background: 'rgba(239, 68, 68, 0.05)',
                            borderRadius: '6px'
                        }}>
                            {result.total_correct} / {result.total_testcases} testcases passed
                        </div>
                    )}
                    <button
                        onClick={() => setShowInputSection(true)}
                        style={{
                            marginTop: '10px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#fff',
                            border: '1px solid rgba(59, 130, 246, 0.5)',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 5px 15px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
                        }}
                    >
                        Edit Testcase
                    </button>
                </div>
            );
        }

        // RUN CODE (Tabs)
        const count = result.total_testcases || (result.code_answer || []).length;
        const compareRes = result.compare_result || "";
        const inputs = result.input_formatted || [];
        const myOut = result.code_answer || [];
        const expOut = result.expected_code_answer || [];

        return (
            <div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', paddingBottom: '10px', overflowX: 'auto' }}>
                    {Array.from({ length: count }).map((_, i) => {
                        const isPass = compareRes[i] === '1';
                        const isActive = activeTab === i;
                        return (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                style={{
                                    background: isActive
                                        ? (isPass ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)')
                                        : 'rgba(14, 14, 20, 0.6)',
                                    border: `1px solid ${isActive ? (isPass ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)') : 'rgba(75, 85, 99, 0.3)'}`,
                                    color: isActive ? '#fff' : '#9ca3af',
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                    boxShadow: isActive ? `0 0 15px ${isPass ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` : 'none',
                                    minWidth: '100px'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.target.style.background = 'rgba(14, 14, 20, 0.8)';
                                        e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.target.style.background = 'rgba(14, 14, 20, 0.6)';
                                        e.target.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                                    }
                                }}
                            >
                                {isPass ? <CheckCircle2 size={16} color="#22c55e" /> : <XCircle size={16} color="#ef4444" />}
                                Case {i + 1}
                            </button>
                        );
                    })}
                </div>

                <div className="case-content">
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            marginBottom: '8px',
                            display: 'block',
                            fontWeight: 700,
                            letterSpacing: '1px'
                        }}>INPUT</span>
                        <div style={{
                            background: 'rgba(14, 14, 20, 0.8)',
                            padding: '12px',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            color: '#e5e7eb',
                            whiteSpace: 'pre-wrap',
                            border: '1px solid rgba(75, 85, 99, 0.3)',
                            lineHeight: '1.6'
                        }}>{inputs[activeTab]}</div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            marginBottom: '8px',
                            display: 'block',
                            fontWeight: 700,
                            letterSpacing: '1px'
                        }}>YOUR OUTPUT</span>
                        <div style={{
                            background: 'rgba(14, 14, 20, 0.8)',
                            padding: '12px',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            color: '#e5e7eb',
                            whiteSpace: 'pre-wrap',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)',
                            lineHeight: '1.6'
                        }}>{myOut[activeTab]}</div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            marginBottom: '8px',
                            display: 'block',
                            fontWeight: 700,
                            letterSpacing: '1px'
                        }}>EXPECTED OUTPUT</span>
                        <div style={{
                            background: 'rgba(14, 14, 20, 0.8)',
                            padding: '12px',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            color: '#e5e7eb',
                            whiteSpace: 'pre-wrap',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            boxShadow: '0 0 10px rgba(34, 197, 94, 0.1)',
                            lineHeight: '1.6'
                        }}>{expOut[activeTab]}</div>
                    </div>
                </div>

                <button
                    onClick={() => setShowInputSection(true)}
                    style={{
                        marginTop: '10px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: '#fff',
                        border: '1px solid rgba(59, 130, 246, 0.5)',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 5px 15px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
                    }}
                >
                    Edit Testcase
                </button>
            </div>
        );
    };

    return (
        <div
            className={`console-drawer ${isOpen ? 'expanded' : ''}`}
            style={{
                height: isOpen ? '350px' : '45px',
                background: 'linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(14, 14, 20, 0.95) 100%)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(34, 197, 94, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'height 0.3s ease',
                overflow: 'hidden',
                position: 'absolute',
                bottom: 0,
                width: '100%',
                zIndex: 10,
                boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.3)'
            }}
        >
            <div
                className="console-header"
                onClick={onToggle}
                style={{
                    height: '45px',
                    minHeight: '45px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 15px',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)';
                }}
            >
                <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    letterSpacing: '0.5px'
                }}>
                    <Terminal size={18} color="#22c55e" />
                    CONSOLE OUTPUT
                </div>
                {isOpen ? <ChevronDown size={18} color="#22c55e" /> : <ChevronUp size={18} color="#22c55e" />}
            </div>

            <div style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto',
                background: 'transparent'
            }}>
                {getResultContent()}
            </div>
        </div>
    );
};

export default Console;
