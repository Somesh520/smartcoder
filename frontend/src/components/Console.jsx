import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown } from 'lucide-react';

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
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="spinner"></div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>Running Code...</div>
                </div>
            );
        }

        // Input mode
        if (showInputSection) {
            return (
                <div className="input-section">
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Testcase (Stdin)</label>
                    <textarea
                        className="custom-input"
                        rows="4"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        style={{ width: '100%', background: '#333', border: '1px solid #444', color: '#eee', borderRadius: '4px', padding: '10px', fontFamily: 'monospace', resize: 'none', outline: 'none' }}
                    />
                </div>
            );
        }

        if (!result) return null;

        // ERROR
        if (result.run_success === false) {
            return (
                <div>
                    <div className="result-status status-error" style={{ color: 'var(--accent-red)', fontSize: '18px', fontWeight: 600, marginBottom: '15px' }}>Compile Error</div>
                    <pre style={{ color: '#ff8888', background: '#333', padding: '10px', borderRadius: '5px' }}>
                        {result.full_runtime_error || result.compile_error}
                    </pre>
                    <button onClick={() => setShowInputSection(true)} className="btn-action" style={{ marginTop: '10px', background: '#444', color: 'white' }}>Back to Input</button>
                </div>
            );
        }

        // SUBMISSION (Full Stats)
        const isRunCode = result.submission_id && String(result.submission_id).includes("runcode");
        if (!isRunCode && result.submission_id) {
            const isAcc = result.status_msg === 'Accepted';
            return (
                <div>
                    <div className={`result-status ${isAcc ? 'status-accepted' : 'status-error'}`} style={{ color: isAcc ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '18px', fontWeight: 600, marginBottom: '15px' }}>{result.status_msg}</div>
                    {isAcc ? (
                        <div className="stats-row" style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                            <div className="stat-pill" style={{ background: '#333', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', color: '#ccc' }}>Runtime: <span style={{ fontWeight: 'bold', color: 'white' }}>{result.status_runtime}</span></div>
                            <div className="stat-pill" style={{ background: '#333', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', color: '#ccc' }}>Memory: <span style={{ fontWeight: 'bold', color: 'white' }}>{result.status_memory}</span></div>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '10px', color: '#aaa' }}>{result.total_correct} / {result.total_testcases} testcases passed</div>
                    )}
                    <button onClick={() => setShowInputSection(true)} className="btn-action" style={{ marginTop: '15px', background: '#444', color: 'white' }}>Edit Testcase</button>
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
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', paddingBottom: '10px', overflowX: 'auto' }}>
                    {Array.from({ length: count }).map((_, i) => {
                        const isPass = compareRes[i] === '1';
                        return (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`tab-btn ${activeTab === i ? 'active' : ''}`}
                                style={{
                                    background: activeTab === i ? '#444' : '#333',
                                    borderColor: activeTab === i ? '#555' : 'transparent',
                                    color: activeTab === i ? 'white' : '#999',
                                    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                                    border: '1px solid'
                                }}
                            >
                                <span className={`dot ${isPass ? 'dot-green' : 'dot-red'}`} style={{ width: '6px', height: '6px', borderRadius: '50%', background: isPass ? 'var(--accent-green)' : 'var(--accent-red)' }}></span> Case {i + 1}
                            </button>
                        );
                    })}
                </div>

                <div className="case-content">
                    <div className="result-block" style={{ marginBottom: '15px' }}>
                        <span className="result-label" style={{ fontSize: '12px', color: '#888', marginBottom: '6px', display: 'block' }}>Input</span>
                        <div className="result-value" style={{ background: '#333', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '14px', color: '#e0e0e0', whiteSpace: 'pre-wrap', border: '1px solid #444' }}>{inputs[activeTab]}</div>
                    </div>
                    <div className="result-block" style={{ marginBottom: '15px' }}>
                        <span className="result-label" style={{ fontSize: '12px', color: '#888', marginBottom: '6px', display: 'block' }}>Output</span>
                        <div className="result-value" style={{ background: '#333', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '14px', color: '#e0e0e0', whiteSpace: 'pre-wrap', border: '1px solid #444' }}>{myOut[activeTab]}</div>
                    </div>
                    <div className="result-block" style={{ marginBottom: '15px' }}>
                        <span className="result-label" style={{ fontSize: '12px', color: '#888', marginBottom: '6px', display: 'block' }}>Expected</span>
                        <div className="result-value" style={{ background: '#333', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '14px', color: '#e0e0e0', whiteSpace: 'pre-wrap', border: '1px solid #444' }}>{expOut[activeTab]}</div>
                    </div>
                </div>

                <button onClick={() => setShowInputSection(true)} className="btn-action" style={{ marginTop: '15px', background: '#444', color: 'white' }}>Edit Testcase</button>
            </div>
        );
    };

    return (
        <div
            className={`console-drawer ${isOpen ? 'expanded' : ''}`}
            style={{
                height: isOpen ? '350px' : '40px',
                background: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column', transition: 'height 0.3s ease',
                overflow: 'hidden', position: 'absolute', bottom: 0, width: '100%', zIndex: 10
            }}
        >
            <div
                className="console-header"
                onClick={onToggle}
                style={{
                    height: '40px', minHeight: '40px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '0 15px', cursor: 'pointer',
                    background: '#2a2a2a', borderBottom: '1px solid var(--border-color)'
                }}
            >
                <div className="console-title" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Terminal size={16} /> Testcase / Result
                </div>
                {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>

            <div className="console-body" style={{ flex: 1, padding: '15px', overflowY: 'auto', background: 'var(--bg-panel)' }}>
                {getResultContent()}
            </div>
        </div>
    );
};

export default Console;
