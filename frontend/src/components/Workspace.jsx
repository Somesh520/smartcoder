import React, { useState, useEffect, useRef } from 'react';
import { fetchProblemDetails, runCode, submitCode, pollResult, fetchAIAssist } from '../api';
import CodeEditor from './CodeEditor';
import Console from './Console';
import ModernSpinner from './ModernSpinner';
import { ArrowLeft, Play, Send, Trophy, Zap, Sparkles, X, Loader2, Lightbulb, Bug, Rocket, Code2 } from 'lucide-react';

import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import Markdown from 'react-markdown';

const DEFAULT_TEMPLATES = {
    'cpp': 'class Solution {\\npublic:\\n    // Write C++ code here\\n};',
    'java': 'class Solution {\\n    public void solve() {\\n        // Write Java code here\\n    }\\n}',
    'python': 'class Solution(object):\\n    def solve(self):\\n        # Write Python code here\\n        pass',
    'javascript': 'var solve = function() {\\n    // Write JS code here\\n};'
};

// Markdown to HTML converter with copy buttons on code blocks and protection against formatting collisions
// Custom CodeBlock Component for ReactMarkdown
const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : 'text';
    const code = String(children).replace(/\n$/, '');

    // Manage copy state locally
    const [copied, setCopied] = useState(false);

    if (!inline && match) {
        const handleCopy = () => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        const cleanLang = lang.trim().toLowerCase();
        const prismLangMap = {
            'c++': 'cpp', 'cpp': 'cpp',
            'js': 'javascript', 'javascript': 'javascript',
            'py': 'python', 'python': 'python',
            'java': 'java', 'c': 'c'
        };
        const activeLang = prismLangMap[cleanLang] || 'text';
        const grammar = Prism.languages[activeLang] || Prism.languages.clike || Prism.languages.text;

        // Highlight logic
        const highlighted = Prism.highlight(code, grammar, activeLang);

        return (
            <div className="ai-code-wrapper">
                <div className="ai-code-header">
                    <div className="ai-code-dots">
                        <span className="ai-dot ai-dot-red"></span>
                        <span className="ai-dot ai-dot-yellow"></span>
                        <span className="ai-dot ai-dot-green"></span>
                    </div>
                    <div className="ai-code-actions">
                        <span className="ai-code-lang">{activeLang}</span>
                        <button className="ai-copy-btn" onClick={handleCopy}>
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
                <pre style={{ margin: 0, padding: '16px', background: 'transparent' }}><code className={`language-${activeLang}`} dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
            </div>
        );
    }
    return <code className={className} {...props}>{children}</code>;
};

const Workspace = ({ problem, roomId, onBack, onSubmissionSuccess }) => {
    const [details, setDetails] = useState(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("cpp");
    const [customInput, setCustomInput] = useState("");
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // AI Assistant State
    const [aiOpen, setAiOpen] = useState(false);
    const [aiMessage, setAiMessage] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [explainLanguage, setExplainLanguage] = useState('hinglish');
    const aiResponseRef = useRef(null);

    // Resizable Layout State
    const [leftWidth, setLeftWidth] = useState(40); // Initial 40% width for problem description

    // Resize Handler
    const startResizing = (mouseDownEvent) => {
        mouseDownEvent.preventDefault();
        const startX = mouseDownEvent.clientX;
        const startWidth = leftWidth;

        const onMouseMove = (mouseMoveEvent) => {
            const newWidth = startWidth + ((mouseMoveEvent.clientX - startX) / window.innerWidth) * 100;
            if (newWidth > 20 && newWidth < 80) {
                setLeftWidth(newWidth);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            document.body.style.cursor = 'default';
            // Enable pointer events on iframes/editors if needed
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.body.style.cursor = 'col-resize';
    };
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

    // AI Assistant Handler
    const handleAIAssist = async (quickAction) => {
        const msg = quickAction || aiMessage;
        if (!msg.trim() && !quickAction) return;

        setAiLoading(true);
        setAiResponse('');

        if (!details) {
            alert("Please wait for problem details to load.");
            return;
        }

        const result = await fetchAIAssist({
            code,
            language,
            problemTitle: details.title || problem.title || '',
            problemDescription: details.content || details.questionHtml || '',
            userMessage: msg,
            explainLanguage
        });

        setAiLoading(false);
        if (result?.response) {
            setAiResponse(result.response);
            setAiMessage('');
            setTimeout(() => {
                if (aiResponseRef.current) aiResponseRef.current.scrollTop = 0;
            }, 100);
        } else {
            setAiResponse('⚠️ AI service unavailable. Please try again.');
        }
    };

    const executeAction = async (type) => {
        const userSession = localStorage.getItem('user_session');
        const userCsrf = localStorage.getItem('user_csrf');

        if (!userSession || !userCsrf || userSession === "undefined") {
            alert(`⚠️ Not Logged In! Sync with Extension first.`);
            return;
        }

        if (!details) {
            alert("⚠️ Problem details are loading. Please wait.");
            return;
        }

        setConsoleOpen(true);
        setShowInputSection(false);
        setLoading(true);
        setResult(null);

        try {
            const fn = type === 'run' ? runCode : submitCode;
            const data = await fn({
                slug: details?.titleSlug || problem.slug,
                question_id: details?.questionId || problem.id,
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
                width: `${leftWidth}%`,
                flex: 'none',
                borderRight: '1px solid rgba(34, 197, 94, 0.2)',
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

            {/* DRAGGABLE RESIZER */}
            <div
                onMouseDown={startResizing}
                style={{
                    width: '6px',
                    margin: '0 2px',
                    cursor: 'col-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}
                className="resizer-handle"
            >
                <style>{`.resizer-handle:hover > div { background: #3b82f6; }`}</style>
                <div style={{
                    width: '2px',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    transition: 'background 0.2s',
                    borderRadius: '2px'
                }}></div>
            </div>

            {/* RIGHT PANEL - Code Editor */}
            <div style={{
                flex: 1,
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
                            disabled={!details || loading}
                            style={{
                                background: (!details || loading) ? '#374151' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: (!details || loading) ? '#9ca3af' : '#fff',
                                cursor: (!details || loading) ? 'not-allowed' : 'pointer',
                                border: '1px solid rgba(59, 130, 246, 0.5)',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                                boxShadow: (!details || loading) ? 'none' : '0 0 15px rgba(59, 130, 246, 0.3)'
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
                            disabled={!details || loading}
                            style={{
                                background: (!details || loading) ? '#374151' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: (!details || loading) ? '#9ca3af' : '#fff',
                                cursor: (!details || loading) ? 'not-allowed' : 'pointer',
                                border: '1px solid rgba(34, 197, 94, 0.5)',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                                boxShadow: (!details || loading) ? 'none' : '0 0 15px rgba(34, 197, 94, 0.3)'
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
                        {/* AI Star Button */}
                        <button
                            onClick={() => setAiOpen(!aiOpen)}
                            style={{
                                background: aiOpen
                                    ? 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)'
                                    : 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(124,58,237,0.15) 100%)',
                                color: aiOpen ? '#fff' : '#a78bfa',
                                border: '1px solid rgba(167,139,250,0.4)',
                                padding: '8px 14px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.3s',
                                boxShadow: aiOpen
                                    ? '0 0 20px rgba(167,139,250,0.5)'
                                    : '0 0 10px rgba(167,139,250,0.2)',
                                animation: !aiOpen ? 'ai-pulse 2s infinite' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 5px 25px rgba(167,139,250,0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = aiOpen
                                    ? '0 0 20px rgba(167,139,250,0.5)'
                                    : '0 0 10px rgba(167,139,250,0.2)';
                            }}
                        >
                            <Sparkles size={14} />
                            AI
                        </button>
                    </div>
                </div>

                {/* AI Pulse Animation */}
                <style>{`
                    @keyframes ai-pulse {
                        0%, 100% { box-shadow: 0 0 10px rgba(167,139,250,0.2); }
                        50% { box-shadow: 0 0 20px rgba(167,139,250,0.4), 0 0 40px rgba(167,139,250,0.1); }
                    }
                    .ai-response-content h1, .ai-response-content h2, .ai-response-content h3 {
                        color: #e5e7eb; font-weight: 700; margin: 16px 0 8px 0;
                    }
                    .ai-response-content h2 { font-size: 16px; color: #a78bfa; }
                    .ai-response-content h3 { font-size: 14px; color: #60a5fa; }
                    .ai-response-content p { margin: 8px 0; line-height: 1.6; }
                    .ai-response-content ul, .ai-response-content ol {
                        margin: 8px 0; padding-left: 20px;
                    }
                    .ai-response-content li { margin: 4px 0; }
                    .ai-response-content code {
                        background: rgba(99,102,241,0.15); color: #c4b5fd;
                        padding: 2px 6px; border-radius: 4px;
                        font-family: 'JetBrains Mono', monospace; font-size: 12px;
                    }
                    .ai-response-content pre {
                        background: #0d1117; 
                        border: 1px solid rgba(167,139,250,0.1);
                        width: 100%;
                        border-radius: 8px; 
                        padding: 16px; 
                        margin: 12px 0;
                        overflow-x: auto;
                        max-height: 450px;
                        overflow-y: auto;
                    }
                    .ai-response-content pre::-webkit-scrollbar { height: 6px; width: 6px; }
                    .ai-response-content pre::-webkit-scrollbar-track { background: #0d1117; }
                    .ai-response-content pre::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
                    .ai-response-content pre::-webkit-scrollbar-thumb:hover { background: #52525b; }
                    .ai-response-content pre code {
                        background: none; padding: 0; color: #e5e7eb;
                        font-size: 13px; line-height: 1.5;
                    }
                    .ai-response-content strong { color: #f9fafb; }
                    .ai-response-content em { color: #a78bfa; }
                    .ai-code-wrapper {
                        border: 1px solid rgba(167,139,250,0.1); 
                        border-radius: 12px;
                        margin: 16px 0; overflow: hidden;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
                        background: #0d1117;
                        transition: transform 0.2s;
                    }
                    .ai-code-wrapper:hover {
                        border-color: rgba(167,139,250,0.3);
                    }
                    .ai-code-header {
                        display: flex; justify-content: space-between; align-items: center;
                        padding: 10px 16px; background: #1c1c24;
                        border-bottom: 1px solid rgba(167,139,250,0.05);
                    }
                    .ai-code-dots { display: flex; gap: 6px; }
                    .ai-dot { width: 10px; height: 10px; border-radius: 50%; opacity: 0.8; transition: opacity 0.2s; }
                    .ai-code-wrapper:hover .ai-dot { opacity: 1; }
                    .ai-dot-red { background: #ff5f56; box-shadow: 0 0 8px rgba(255,95,86,0.4); }
                    .ai-dot-yellow { background: #ffbd2e; box-shadow: 0 0 8px rgba(255,189,46,0.4); }
                    .ai-dot-green { background: #27c93f; box-shadow: 0 0 8px rgba(39,201,63,0.4); }
                    
                    .ai-code-actions { display: flex; align-items: center; gap: 12px; }
                    
                    .ai-code-lang {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 11px; color: #9ca3af; font-weight: 700;
                        text-transform: uppercase; letter-spacing: 1px;
                    }
                    .ai-copy-btn {
                        background: rgba(255,255,255,0.05); color: #d1d5db;
                        border: 1px solid rgba(255,255,255,0.1); padding: 4px 10px;
                        border-radius: 6px; font-size: 11px; font-weight: 600;
                        cursor: pointer; transition: all 0.2s;
                    }
                    .ai-copy-btn:hover {
                        background: rgba(167,139,250,0.2); color: #fff; border-color: rgba(167,139,250,0.4);
                    }
                `}</style>

                {/* Code Editor Area + AI Panel */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', position: 'relative' }}>
                    {/* Editor */}
                    <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '40px' }}>
                        <CodeEditor code={code} onChange={handleCodeChange} language={language} />
                    </div>

                    {/* AI Panel - Overlay from right */}
                    {aiOpen && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '360px',
                            maxWidth: '90%',
                            zIndex: 100,
                            background: 'linear-gradient(180deg, #0f0f18 0%, #13131f 100%)',
                            borderLeft: '1px solid rgba(167,139,250,0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            animation: 'slideIn 0.25s ease-out',
                            boxShadow: '-8px 0 30px rgba(0,0,0,0.5), -2px 0 10px rgba(167,139,250,0.1)'
                        }}>
                            <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

                            {/* AI Panel Header */}
                            <div style={{
                                padding: '14px 16px',
                                borderBottom: '1px solid rgba(167,139,250,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(99,102,241,0.05) 100%)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Sparkles size={16} color="#a78bfa" />
                                    <span style={{ color: '#e5e7eb', fontWeight: 700, fontSize: '14px' }}>SmartCoder AI</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <select
                                        value={explainLanguage}
                                        onChange={(e) => setExplainLanguage(e.target.value)}
                                        style={{
                                            background: 'rgba(167,139,250,0.1)',
                                            color: '#a78bfa',
                                            border: '1px solid rgba(167,139,250,0.25)',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="english">English</option>
                                        <option value="hinglish">Hinglish</option>
                                        <option value="hindi">Hindi</option>
                                        <option value="bhojpuri">Bhojpuri</option>
                                    </select>
                                    <button
                                        onClick={() => setAiOpen(false)}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#9ca3af',
                                            width: '28px', height: '28px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9ca3af'; }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {[
                                    { label: 'Solve', icon: <Code2 size={12} />, msg: 'Solve this problem completely with the most optimal approach. Give me the full code.', color: '#22c55e' },
                                    { label: 'Hint', icon: <Lightbulb size={12} />, msg: 'Give me a hint for this problem. Don\'t give the full solution, just guide me on the approach.', color: '#f59e0b' },
                                    { label: 'Debug', icon: <Bug size={12} />, msg: 'My code has issues. Find the bugs and fix them. Explain what was wrong.', color: '#ef4444' },
                                    { label: 'Optimize', icon: <Rocket size={12} />, msg: 'Optimize my current solution for better time and space complexity.', color: '#3b82f6' },
                                ].map(action => (
                                    <button
                                        key={action.label}
                                        onClick={() => handleAIAssist(action.msg)}
                                        disabled={aiLoading}
                                        style={{
                                            background: `${action.color}15`,
                                            border: `1px solid ${action.color}40`,
                                            color: action.color,
                                            padding: '5px 10px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            cursor: aiLoading ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s',
                                            opacity: aiLoading ? 0.5 : 1
                                        }}
                                    >
                                        {action.icon}
                                        {action.label}
                                    </button>
                                ))}
                            </div>

                            {/* AI Response Area */}
                            <div ref={aiResponseRef} style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '16px',
                                fontSize: '13px',
                                color: '#d1d5db',
                                lineHeight: '1.6'
                            }}>
                                {aiLoading ? (
                                    <div style={{
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        height: '200px', gap: '12px'
                                    }}>
                                        <Loader2 size={28} color="#a78bfa" style={{ animation: 'spin 1s linear infinite' }} />
                                        <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: '13px' }}>Thinking...</span>
                                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                    </div>
                                ) : aiResponse ? (
                                    <div className="ai-response-content">
                                        <Markdown
                                            components={{
                                                pre: ({ children }) => <>{children}</>,
                                                code: CodeBlock
                                            }}
                                        >
                                            {aiResponse}
                                        </Markdown>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        height: '100%', gap: '16px', opacity: 0.6
                                    }}>
                                        <Sparkles size={40} color="#a78bfa" style={{ opacity: 0.4 }} />
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: 700, color: '#a78bfa', marginBottom: '4px' }}>SmartCoder AI</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Click a quick action or type below</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* AI Input */}
                            <div style={{
                                padding: '12px 16px',
                                borderTop: '1px solid rgba(167,139,250,0.15)',
                                display: 'flex',
                                gap: '8px'
                            }}>
                                <input
                                    type="text"
                                    value={aiMessage}
                                    onChange={(e) => setAiMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !aiLoading && handleAIAssist()}
                                    placeholder="Ask AI anything..."
                                    disabled={aiLoading}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(167,139,250,0.2)',
                                        color: '#e5e7eb',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.5)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
                                />
                                <button
                                    onClick={() => handleAIAssist()}
                                    disabled={aiLoading || !aiMessage.trim()}
                                    style={{
                                        background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                                        border: 'none',
                                        color: '#fff',
                                        width: '40px', height: '40px',
                                        borderRadius: '8px',
                                        cursor: (aiLoading || !aiMessage.trim()) ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: (aiLoading || !aiMessage.trim()) ? 0.5 : 1,
                                        transition: 'all 0.2s',
                                        flexShrink: 0
                                    }}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    )}
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
