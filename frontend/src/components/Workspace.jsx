import React, { useState, useEffect } from 'react';
import { fetchProblemDetails, runCode, submitCode, pollResult } from '../api';
import CodeEditor from './CodeEditor';
import Console from './Console';
import ModernSpinner from './ModernSpinner';
import { Play, Send, Trophy, Zap, ArrowLeft } from 'lucide-react';

const DEFAULT_TEMPLATES = {
    'cpp': 'class Solution {\\npublic:\\n    // Write C++ code here\\n};',
    'java': 'class Solution {\\n    public void solve() {\\n        // Write Java code here\\n    }\\n}',
    'python': 'class Solution(object):\\n    def solve(self):\\n        # Write Python code here\\n        pass',
    'javascript': 'var solve = function() {\\n    // Write JS code here\\n};'
};

const Workspace = ({ problem, roomId, onBack, onSubmissionSuccess }) => {
    const [details, setDetails] = useState(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("cpp");
    const [customInput, setCustomInput] = useState("");
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showInputSection, setShowInputSection] = useState(true);
    const [availableSnippets, setAvailableSnippets] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchProblemDetails(problem.id);
                setDetails(data);
                const snippets = data.codeSnippets || [];
                setAvailableSnippets(snippets);

                const storageKey = roomId ? `code_${roomId}_${problem.id}` : null;
                const savedCode = storageKey ? localStorage.getItem(storageKey) : null;

                if (savedCode) {
                    const savedLang = localStorage.getItem(`${storageKey}_lang`);
                    if (savedLang) setLanguage(savedLang);
                    setCode(savedCode);
                } else if (snippets.length > 0) {
                    const hasCpp = snippets.some(s => s.langSlug === 'cpp');
                    const defaultLang = hasCpp ? 'cpp' : snippets[0].langSlug;
                    setLanguage(defaultLang);
                    const snip = snippets.find(s => s.langSlug === defaultLang);
                    setCode(snip ? snip.code : DEFAULT_TEMPLATES[defaultLang] || "");
                } else {
                    setCode(DEFAULT_TEMPLATES['cpp']);
                }

                if (data.exampleTestcases) {
                    setCustomInput(data.exampleTestcases);
                }
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [problem.id, roomId]);

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        if (roomId) {
            localStorage.setItem(`code_${roomId}_${problem.id}`, newCode);
        }
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        const snip = availableSnippets.find(s => s.langSlug === newLang);
        const resetCode = snip ? snip.code : DEFAULT_TEMPLATES[newLang] || "";
        setCode(resetCode);

        if (roomId) {
            localStorage.setItem(`code_${roomId}_${problem.id}_lang`, newLang);
            localStorage.setItem(`code_${roomId}_${problem.id}`, resetCode);
        }
    };

    const executeAction = async (type) => {
        const userSession = localStorage.getItem('user_session');
        const userCsrf = localStorage.getItem('user_csrf');

        if (!userSession || !userCsrf || userSession === "undefined") {
            alert(`⚠️ Not Logged In! Sync with Extension first.`);
            return;
        }

        setConsoleOpen(true);
        setShowInputSection(false);
        setLoading(true);
        setResult(null);

        try {
            const fn = type === 'run' ? runCode : submitCode;
            const data = await fn({
                slug: problem.slug,
                question_id: problem.id,
                lang: language,
                typed_code: code,
                data_input: customInput,
                auth_session: userSession,
                auth_csrf: userCsrf
            });

            if (data.error) throw new Error(data.error);
            const id = data.interpret_id || data.submission_id;

            let attempts = 0;
            const interval = setInterval(async () => {
                attempts++;
                if (attempts > 20) {
                    clearInterval(interval);
                    setLoading(false);
                    setResult({ run_success: false, compile_error: "Timeout: Server took too long." });
                    return;
                }
                try {
                    const res = await pollResult(id, problem.slug, userSession, userCsrf);
                    if (res.state === 'SUCCESS') {
                        clearInterval(interval);
                        setLoading(false);
                        setResult(res);

                        if (type === 'submit' && onSubmissionSuccess) {
                            // Check for standard "Accepted"
                            if (res.status_msg === 'Accepted') {
                                console.log("✅ Submission Accepted! Reporting success...");
                                onSubmissionSuccess(res);
                            } else {
                                console.log("ℹ️ Submission Result:", res.status_msg);
                            }
                        }
                    }
                } catch (e) { console.error(e); }
            }, 1000);

        } catch (e) {
            setLoading(false);
            setResult({ run_success: false, compile_error: e.message });
        }
    };

    return (
        <div className="workspace" style={{
            display: 'flex',
            height: 'calc(100vh - 50px)',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
            position: 'relative'
        }}>
            {/* Ambient Glow Effects */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '20%',
                right: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none'
            }}></div>

            {/* LEFT PANEL - Problem Description */}
            <div style={{
                flex: 1,
                borderRight: '1px solid rgba(34, 197, 94, 0.2)',
                display: 'flex',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(14, 14, 20, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
            }}>
                {/* Problem Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            color: '#22c55e',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(34, 197, 94, 0.25)';
                            e.target.style.transform = 'translateX(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(34, 197, 94, 0.15)';
                            e.target.style.transform = 'translateX(0)';
                        }}
                    >
                        <ArrowLeft size={14} />
                        Back
                    </button>
                    <Trophy size={18} color="#fbbf24" />
                    <span style={{
                        color: '#22c55e',
                        fontWeight: 700,
                        fontSize: '14px'
                    }}>#{problem.id}</span>
                    <span style={{
                        color: '#e5e7eb',
                        fontWeight: 600,
                        fontSize: '16px'
                    }}>{problem.title}</span>
                </div>

                {/* Problem Content */}
                <div style={{
                    padding: '24px',
                    overflowY: 'auto',
                    flex: 1,
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: '#d1d5db'
                }}>
                    <style>{`
                        /* Problem Description Styling */
                        .problem-content p {
                            margin: 0 0 16px 0;
                            color: #d1d5db;
                            line-height: 1.7;
                        }
                        
                        .problem-content strong {
                            color: #ffffff;
                            font-weight: 700;
                        }
                        
                        .problem-content em {
                            color: #22c55e;
                            font-style: italic;
                        }
                        
                        .problem-content code {
                            background: rgba(59, 130, 246, 0.15);
                            color: #60a5fa;
                            padding: 2px 8px;
                            border-radius: 4px;
                            font-family: 'JetBrains Mono', 'Fira Code', monospace;
                            font-size: 14px;
                            border: 1px solid rgba(59, 130, 246, 0.2);
                        }
                        
                        .problem-content pre {
                            background: rgba(0, 0, 0, 0.4);
                            border: 1px solid rgba(59, 130, 246, 0.2);
                            border-left: 3px solid #3b82f6;
                            padding: 16px;
                            border-radius: 8px;
                            overflow-x: auto;
                            margin: 16px 0;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                        }
                        
                        .problem-content pre code {
                            background: none;
                            border: none;
                            padding: 0;
                            color: #e5e7eb;
                            font-size: 13px;
                        }
                        
                        .problem-content ul, .problem-content ol {
                            margin: 16px 0;
                            padding-left: 24px;
                        }
                        
                        .problem-content li {
                            margin: 8px 0;
                            color: #d1d5db;
                        }
                        
                        .problem-content h1, .problem-content h2, .problem-content h3 {
                            color: #ffffff;
                            font-weight: 700;
                            margin: 24px 0 12px 0;
                            line-height: 1.3;
                        }
                        
                        .problem-content h1 {
                            font-size: 24px;
                            border-bottom: 2px solid rgba(34, 197, 94, 0.3);
                            padding-bottom: 8px;
                        }
                        
                        .problem-content h2 {
                            font-size: 20px;
                            color: #22c55e;
                        }
                        
                        .problem-content h3 {
                            font-size: 18px;
                            color: #3b82f6;
                        }
                        
                        .problem-content img {
                            max-width: 100%;
                            border-radius: 8px;
                            margin: 16px 0;
                            border: 1px solid rgba(255, 255, 255, 0.1);
                        }
                        
                        .problem-content blockquote {
                            border-left: 3px solid #fbbf24;
                            background: rgba(251, 191, 36, 0.1);
                            padding: 12px 16px;
                            margin: 16px 0;
                            border-radius: 4px;
                            color: #fbbf24;
                        }
                        
                        .problem-content table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 16px 0;
                        }
                        
                        .problem-content th {
                            background: rgba(34, 197, 94, 0.15);
                            color: #22c55e;
                            padding: 12px;
                            text-align: left;
                            font-weight: 700;
                            border: 1px solid rgba(34, 197, 94, 0.2);
                        }
                        
                        .problem-content td {
                            padding: 12px;
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            color: #d1d5db;
                        }
                        
                        .problem-content tr:hover {
                            background: rgba(59, 130, 246, 0.05);
                        }
                    `}</style>
                    {details ? (
                        <div className="problem-content" dangerouslySetInnerHTML={{
                            __html: (details.content || details.questionHtml || "").replace(/src="\//g, 'src="https://leetcode.com/')
                        }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                            <ModernSpinner size={40} text="Loading details..." />
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL - Code Editor */}
            <div style={{
                flex: 1.5,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(14, 14, 20, 0.8)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Editor Toolbar */}
                <div style={{
                    height: '50px',
                    borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 15px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                }}>
                    {/* Language Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap size={16} color="#3b82f6" />
                        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>Language:</span>
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: '#fff',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                fontSize: '13px',
                                cursor: 'pointer',
                                outline: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
                            }}
                        >
                            {availableSnippets.length > 0 ? (
                                availableSnippets.map(s => <option key={s.langSlug} value={s.langSlug}>{s.lang}</option>)
                            ) : <option value="cpp">C++</option>}
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => executeAction('run')}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: '#fff',
                                border: '1px solid rgba(59, 130, 246, 0.5)',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                                boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 5px 20px rgba(59, 130, 246, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.3)';
                            }}
                        >
                            <Play size={14} /> Run
                        </button>
                        <button
                            onClick={() => executeAction('submit')}
                            style={{
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: '#fff',
                                border: '1px solid rgba(34, 197, 94, 0.5)',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                                boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 5px 20px rgba(34, 197, 94, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.3)';
                            }}
                        >
                            <Send size={14} /> Submit
                        </button>
                    </div>
                </div>

                {/* Code Editor Area */}
                <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '40px' }}>
                    <CodeEditor code={code} onChange={handleCodeChange} language={language} />
                </div>

                {/* Console */}
                <Console
                    isOpen={consoleOpen}
                    onToggle={() => setConsoleOpen(!consoleOpen)}
                    result={result}
                    isLoading={loading}
                    customInput={customInput}
                    setCustomInput={setCustomInput}
                    showInputSection={showInputSection}
                    setShowInputSection={setShowInputSection}
                />
            </div>
        </div>
    );
};

export default Workspace;
