import React, { useState, useEffect, useRef } from 'react';
import { fetchProblemDetails, runCode, submitCode, pollResult, fetchAIAssist, fetchComplexity, BASE_URL } from '../api';
import CodeEditor from './CodeEditor';
import Console from './Console';
import ModernSpinner from './ModernSpinner';
import { ArrowLeft, Play, Send, Trophy, Zap, Sparkles, X, Loader2, Lightbulb, Bug, Rocket, Code2, Maximize2, Minimize2, Timer, User } from 'lucide-react';
import SubmissionSuccess from './SubmissionSuccess';

import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import Markdown from 'react-markdown';
import TopUpModal from './TopUpModal';

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
                <pre style={{ margin: 0, padding: '20px', background: 'transparent', overflow: 'auto' }}>
                    <code
                        className={`language-${activeLang}`}
                        style={{ color: 'var(--text-main)', fontSize: '13px', lineHeight: '1.6', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                </pre>
            </div>
        );
    }
    return <code className={className} {...props}>{children}</code>;
};

const Workspace = ({ problem, roomId, onBack, onSubmissionSuccess, theme, user }) => {
    const [details, setDetails] = useState(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("cpp");
    const [customInput, setCustomInput] = useState("");
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // AI Assistant State
    const [aiOpen, setAiOpen] = useState(false);
    const [isAiExpanded, setIsAiExpanded] = useState(false);
    const [aiChatHistory, setAiChatHistory] = useState([
        { role: 'assistant', content: 'Hello! I am SmartCoder AI. How can I help you with your code today? 🚀' }
    ]);
    const [aiMessage, setAiMessage] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [explainLanguage, setExplainLanguage] = useState('english');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const aiResponseRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (aiResponseRef.current) {
            aiResponseRef.current.scrollTop = aiResponseRef.current.scrollHeight;
        }
    }, [aiChatHistory, aiLoading]);

    // Typewriter Effect Component
    const TypewriterEffect = ({ text, onComplete }) => {
        const [displayedText, setDisplayedText] = useState('');
        const indexRef = useRef(0);

        useEffect(() => {
            indexRef.current = 0;
            setDisplayedText('');
            let timeoutId;

            const typeNextChar = () => {
                if (indexRef.current < text.length) {
                    const char = text.charAt(indexRef.current);
                    setDisplayedText((prev) => prev + char);
                    indexRef.current++;

                    // Auto-scroll during typing
                    if (aiResponseRef.current) aiResponseRef.current.scrollTop = aiResponseRef.current.scrollHeight;

                    // Compute a dynamic delay to simulate real AI streaming
                    let delay = 5 + Math.random() * 15; // Base fluid speed (5-20ms)

                    if (['.', '!', '?'].includes(char)) {
                        delay += 100 + Math.random() * 100; // Pause at sentences
                    } else if ([',', ';', ':'].includes(char)) {
                        delay += 50 + Math.random() * 50;   // Slight pause at clauses
                    } else if (char === ' ') {
                        delay += Math.random() * 20;        // Micro-pause between words
                    }

                    timeoutId = setTimeout(typeNextChar, delay);
                } else {
                    if (onComplete) onComplete();
                }
            };

            timeoutId = setTimeout(typeNextChar, 10);

            return () => clearTimeout(timeoutId);
        }, [text]);

        return (
            <div className="ai-response-content">
                <Markdown
                    components={{
                        pre: ({ children }) => <>{children}</>,
                        code: CodeBlock
                    }}
                >
                    {displayedText + ' ▋'}
                </Markdown>
            </div>
        );
    };

    // Credit System
    const [credits, setCredits] = useState(5);
    const [showTopUpModal, setShowTopUpModal] = useState(false);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return;
                const res = await fetch(`${BASE_URL}/api/ai/credits`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCredits(data.credits);
                }
            } catch (e) { console.error("Failed to fetch credits", e); }
        };
        if (aiOpen) fetchCredits();
    }, [aiOpen]);

    // Resizable Layout State
    const [leftWidth, setLeftWidth] = useState(50); // Initial 50% width for a balanced layout

    // Resize Handler
    const startResizing = (mouseDownEvent) => {
        mouseDownEvent.preventDefault();
        const startX = mouseDownEvent.clientX;
        const startWidth = leftWidth;

        const onMouseMove = (mouseMoveEvent) => {
            const newWidth = startWidth + ((mouseMoveEvent.clientX - startX) / window.innerWidth) * 100;
            if (newWidth >= 20 && newWidth <= 65) { // Capped at 65% to prevent squeezing right pane
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

        // 1. Add User Message
        const userMsg = { role: 'user', content: msg };
        setAiChatHistory(prev => [...prev, userMsg]);
        setAiMessage('');
        setAiLoading(true);

        if (!details) {
            alert("Please wait for problem details to load.");
            setAiLoading(false);
            return;
        }

        try {
            // 2. Prepare History for API (Exclude initial greeting if needed, or keep it)
            // Filter out internal system messages if any
            const apiHistory = aiChatHistory.filter(m => m.role === 'user' || m.role === 'assistant');

            const result = await fetchAIAssist({
                code,
                language,
                problemTitle: details.title || problem.title || '',
                problemDescription: details.content || details.questionHtml || '',
                userMessage: msg,
                explainLanguage,
                history: apiHistory // Pass full history
            });

            setAiLoading(false);

            if (result && (result.status === 402 || (result.error && result.error.includes("Insufficient credits")))) {
                setCredits(0);
                setShowTopUpModal(true);
                setAiChatHistory(prev => [...prev, { role: 'assistant', content: "⚠️ **Insufficient Credits**. Please top-up to continue!" }]);
                return;
            }

            if (result?.response) {
                if (result.credits !== undefined) setCredits(result.credits);
                // 3. Add AI Response (It will be rendered with Typewriter)
                setAiChatHistory(prev => [...prev, { role: 'assistant', content: result.response, isNew: true }]);
            } else {
                setAiChatHistory(prev => [...prev, { role: 'assistant', content: '⚠️ AI service unavailable. Please try again.' }]);
            }
        } catch (e) {
            console.error(e);
            setAiLoading(false);
            setAiChatHistory(prev => [...prev, { role: 'assistant', content: '❌ Error connecting to AI.' }]);
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

                        // Previous comment cleanup
                        // Handle "Accepted" for both RUN and SUBMIT
                        if (res.status_msg === 'Accepted') {
                            if (type === 'submit') {
                                setShowSuccessModal(true);
                                if (onSubmissionSuccess) {
                                    onSubmissionSuccess(res);
                                }
                            }

                            // AI Complexity Analysis (Trigger for both Run & Submit)
                            try {
                                const complexity = await fetchComplexity({
                                    code,
                                    language,
                                    problemTitle: details.title || problem.title || ''
                                });
                                if (complexity) {
                                    setResult(prev => ({ ...prev, complexity }));
                                }
                            } catch (err) {
                                console.error("Complexity analysis failed", err);
                            }
                        }
                    }
                } catch (e) {
                    clearInterval(interval);
                    setLoading(false);
                    setResult({ run_success: false, compile_error: e.message || "Execution failed" });
                }
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
            width: '100%',
            background: 'var(--bg-main)',
            position: 'relative',
            overflow: 'hidden'
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
            <div className="neo-card" style={{
                width: `${leftWidth}%`,
                minWidth: '20%',
                maxWidth: '65%',
                flex: 'none',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-card)',
                overflow: 'hidden',
                borderRadius: '0'
            }}>
                {/* Problem Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: 'var(--border-main)',
                    background: 'var(--bg-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <button
                        onClick={onBack}
                        className="neo-btn"
                        style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                        }}
                    >
                        <ArrowLeft size={14} />
                        BACK
                    </button>
                    <Trophy size={18} color="#fbbf24" />
                    <span style={{
                        color: '#22c55e',
                        fontWeight: 700,
                        fontSize: '14px'
                    }}>#{problem.id}</span>
                    <span style={{
                        color: 'var(--text-main)',
                        fontWeight: 950,
                        fontSize: '16px',
                        textTransform: 'uppercase'
                    }}>{problem.title}</span>
                </div>

                {/* Problem Content */}
                <div style={{
                    padding: '24px',
                    overflowY: 'auto',
                    flex: 1,
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: 'var(--text-main)',
                    background: 'var(--bg-card)'
                }}>
                    <style>{`
                        /* Problem Description Styling */
                        .problem-content p {
                            margin: 0 0 16px 0;
                            color: var(--text-main);
                            line-height: 1.7;
                            font-weight: 600;
                        }
                        
                        .problem-content strong {
                            color: var(--text-main);
                            font-weight: 950;
                        }
                        
                        .problem-content em {
                            color: var(--accent);
                            font-style: italic;
                            font-weight: 800;
                        }
                        
                        .problem-content code {
                            background: var(--bg-main);
                            color: var(--accent);
                            padding: 2px 8px;
                            border: var(--border-main);
                            border-radius: 0;
                            font-family: 'JetBrains Mono', monospace;
                            font-size: 14px;
                            font-weight: 800;
                        }
                        
                        .problem-content pre {
                            background: var(--bg-main);
                            border: var(--border-main);
                            padding: 20px;
                            border-radius: 0;
                            overflow-x: auto;
                            margin: 20px 0;
                            box-shadow: var(--shadow-main);
                            position: relative;
                        }

                        .problem-content pre::before {
                            content: 'EXAMPLE';
                            position: absolute;
                            top: 0;
                            right: 0;
                            background: var(--text-main);
                            color: var(--bg-card);
                            padding: 2px 8px;
                            font-size: 10px;
                            font-weight: 900;
                        }
                        
                        .problem-content pre code {
                            background: none;
                            border: none;
                            padding: 0;
                            color: var(--text-main);
                            font-size: 13px;
                            font-weight: 700;
                            line-height: 1.5;
                        }
                        
                        .problem-content ul, .problem-content ol {
                            margin: 16px 0;
                            padding-left: 24px;
                            color: var(--text-main);
                        }
                        
                        .problem-content li {
                            margin: 8px 0;
                            color: var(--text-main);
                            font-weight: 600;
                        }
                        
                        .problem-content h1, .problem-content h2, .problem-content h3 {
                            color: var(--text-main);
                            font-weight: 950;
                            margin: 32px 0 16px 0;
                            line-height: 1.2;
                            text-transform: uppercase;
                        }
                        
                        .problem-content h1 {
                            font-size: 24px;
                            border-bottom: var(--border-main);
                            padding-bottom: 8px;
                        }
                        
                        .problem-content h2 {
                            font-size: 20px;
                            color: var(--accent);
                        }
                        
                        .problem-content h3 {
                            font-size: 18px;
                        }
                        
                        .problem-content img {
                            max-width: 100%;
                            border: var(--border-main);
                            margin: 20px 0;
                            box-shadow: var(--shadow-main);
                        }
                        
                        .problem-content blockquote {
                            border-left: 4px solid var(--accent);
                            background: var(--bg-main);
                            padding: 16px 20px;
                            margin: 20px 0;
                            color: var(--text-main);
                            font-weight: 700;
                        }
                        
                        .problem-content table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                            border: var(--border-main);
                        }
                        
                        .problem-content th {
                            background: var(--accent);
                            color: #000;
                            padding: 12px;
                            text-align: left;
                            font-weight: 950;
                            border: var(--border-main);
                        }
                        
                        .problem-content td {
                            padding: 12px;
                            border: var(--border-main);
                            color: var(--text-main);
                            font-weight: 600;
                        }
                        
                        .problem-content tr:nth-child(even) {
                            background: var(--bg-main);
                        }

                        /* Example block semantic labels */
                        .problem-content p strong {
                            display: inline-block;
                            margin-top: 8px;
                            color: var(--accent);
                            text-transform: uppercase;
                            font-size: 13px;
                            letter-spacing: 1px;
                        }

                        .problem-content p:has(strong) {
                            margin-bottom: 20px;
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
                    background: 'var(--text-main)',
                    opacity: 0.2,
                    borderRadius: '2px'
                }}></div>
            </div>

            {/* RIGHT PANEL - Code Editor */}
            <div style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-main)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Editor Toolbar */}
                <div className="editor-toolbar" style={{
                    height: '50px',
                    borderBottom: 'var(--border-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 15px',
                    background: 'var(--bg-card)',
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    <style>{`.editor-toolbar::-webkit-scrollbar { display: none; }`}</style>
                    {/* Language Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap size={16} color="#3b82f6" />
                        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>Language:</span>
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            style={{
                                background: 'var(--bg-main)',
                                color: 'var(--text-main)',
                                border: 'var(--border-main)',
                                fontSize: '13px',
                                cursor: 'pointer',
                                outline: 'none',
                                padding: '6px 12px',
                                borderRadius: '0',
                                fontWeight: 900,
                            }}
                        >
                            {availableSnippets.length > 0 ? (
                                availableSnippets.map(s => <option key={s.langSlug} value={s.langSlug} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>{s.lang}</option>)
                            ) : <option value="cpp">C++</option>}
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => executeAction('run')}
                            disabled={!details || loading}
                            className="neo-btn"
                            style={{
                                background: (!details || loading) ? 'var(--bg-main)' : 'var(--accent)',
                                color: (!details || loading) ? 'var(--text-muted)' : 'black',
                                padding: '8px 16px',
                                fontSize: '13px',
                            }}
                        >
                            <Play size={14} /> RUN
                        </button>
                        <button
                            onClick={() => executeAction('submit')}
                            disabled={!details || loading}
                            className="neo-btn"
                            style={{
                                background: (!details || loading) ? 'var(--bg-main)' : '#22c55e',
                                color: (!details || loading) ? 'var(--text-muted)' : 'white',
                                padding: '8px 16px',
                                fontSize: '13px',
                            }}
                        >
                            <Send size={14} /> SUBMIT
                        </button>
                        {/* AI Star Button */}
                        <button
                            onClick={() => setAiOpen(!aiOpen)}
                            className="neo-btn"
                            style={{
                                background: aiOpen ? 'var(--accent)' : 'var(--bg-card)',
                                color: aiOpen ? '#000' : 'var(--text-main)',
                                padding: '8px 16px',
                                fontSize: '13px',
                                border: 'var(--border-main)',
                                boxShadow: aiOpen ? '0 0 20px rgba(167,139,250,0.4)' : 'var(--shadow-main)',
                                position: 'relative',
                                overflow: 'visible'
                            }}
                        >
                            <Sparkles size={14} style={{ color: aiOpen ? '#000' : '#a78bfa' }} />
                            AI
                            {!aiOpen && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    width: '8px',
                                    height: '8px',
                                    background: '#a78bfa',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 10px #a78bfa'
                                }}></span>
                            )}
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
                        color: var(--text-main); font-weight: 950; margin: 16px 0 8px 0; text-transform: uppercase;
                    }
                    .ai-response-content h2 { font-size: 16px; color: var(--accent); }
                    .ai-response-content h3 { font-size: 14px; }
                    .ai-response-content p { margin: 8px 0; line-height: 1.6; font-weight: 600; color: var(--text-main); }
                    .ai-response-content ul, .ai-response-content ol {
                        margin: 8px 0; padding-left: 20px; color: var(--text-main);
                    }
                    .ai-response-content li { margin: 4px 0; font-weight: 600; }
                    .ai-response-content code {
                        background: var(--bg-main); color: var(--accent);
                        padding: 2px 6px; border: var(--border-main);
                        font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 800;
                    }
                    .ai-response-content pre {
                        background: var(--bg-main); 
                        border: var(--border-main);
                        width: 100%;
                        padding: 16px; 
                        margin: 12px 0;
                        overflow-x: auto;
                        max-height: 450px;
                        overflow-y: auto;
                        box-shadow: var(--shadow-main);
                    }
                    .ai-response-content pre::-webkit-scrollbar { height: 6px; width: 6px; }
                    .ai-response-content pre::-webkit-scrollbar-track { background: var(--bg-main); }
                    .ai-response-content pre::-webkit-scrollbar-thumb { background: var(--text-main); }
                    .ai-response-content pre code {
                        background: none; padding: 0; color: var(--text-main);
                        font-size: 13px; line-height: 1.5; font-weight: 700; border: none;
                    }
                    .ai-response-content strong { color: var(--text-main); font-weight: 950; }
                    .ai-response-content em { color: var(--accent); font-weight: 800; }
                    .ai-code-wrapper {
                        border: var(--border-main); 
                        margin: 16px 0; overflow: hidden;
                        box-shadow: var(--shadow-main);
                        background: var(--bg-main);
                        transition: transform 0.2s;
                    }
                    .ai-code-wrapper:hover {
                        border-color: rgba(167,139,250,0.3);
                    }
                    .ai-code-header {
                        display: flex; justify-content: space-between; align-items: center;
                        padding: 10px 16px; background: var(--bg-card);
                        border-bottom: var(--border-main);
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
                        background: var(--bg-main); color: var(--text-main);
                        border: var(--border-main); padding: 4px 12px;
                        font-size: 11px; font-weight: 900;
                        cursor: pointer; transition: all 0.2s;
                        text-transform: uppercase;
                    }
                    .ai-copy-btn:hover {
                        background: var(--accent); color: #000;
                    }
                `}</style>

                {/* Code Editor Area + AI Panel */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', position: 'relative' }}>
                    {/* Editor */}
                    <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '40px' }}>
                        <CodeEditor code={code} onChange={handleCodeChange} language={language} theme={theme} />
                    </div>


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
                    theme={theme}
                />
            </div>


            {/* Backdrop Overlay when Expanded */}
            {
                aiOpen && isAiExpanded && (
                    <div
                        onClick={() => setIsAiExpanded(false)}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 90,
                            transition: 'opacity 0.3s ease',
                            opacity: 1
                        }}
                    />
                )
            }

            {/* AI Panel - Moved to Root to prevent clipping */}
            {
                aiOpen && (
                    <div style={{
                        position: 'absolute',
                        top: isAiExpanded ? '10%' : 0,
                        right: isAiExpanded ? 'auto' : 0,
                        left: isAiExpanded ? '50%' : 'auto',
                        bottom: isAiExpanded ? '10%' : 0,
                        transform: isAiExpanded ? 'translateX(-50%)' : 'none',
                        width: isAiExpanded ? '70%' : '420px',
                        maxWidth: isAiExpanded ? '1100px' : '95%',
                        height: isAiExpanded ? '85vh' : 'auto',
                        zIndex: 100,
                        background: 'var(--bg-card)',
                        backdropFilter: 'blur(20px)',
                        border: isAiExpanded ? 'var(--border-main)' : 'none',
                        borderLeft: 'var(--border-main)',
                        borderRadius: '0',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: isAiExpanded ? 'floatIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: 'var(--shadow-main)'
                    }}>
                        <style>{`
                        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                        @keyframes floatIn { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
                    `}</style>

                        {/* Header (Same as before) */}
                        <div style={{
                            padding: '16px 20px', borderBottom: 'var(--border-main)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'var(--bg-main)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={16} color="var(--accent)" />
                                <span style={{ color: 'var(--text-main)', fontWeight: 950, fontSize: '14px', textTransform: 'uppercase' }}>SMARTCODER_AI</span>
                                <div style={{ padding: '2px 8px', borderRadius: '0', background: 'var(--bg-card)', border: 'var(--border-main)', fontSize: '11px', fontWeight: 900, color: credits > 0 ? '#22c55e' : '#ef4444', marginLeft: '8px' }}>
                                    {credits} CREDITS
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', background: 'var(--bg-card)',
                                    border: 'var(--border-main)', padding: '2px 8px',
                                    boxShadow: 'none',
                                    transition: 'all 0.3s'
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="2" y1="12" x2="22" y2="12"></line>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                    </svg>
                                    <select
                                        value={explainLanguage}
                                        onChange={(e) => setExplainLanguage(e.target.value)}
                                        style={{
                                            background: 'transparent',
                                            color: 'var(--text-main)',
                                            border: 'none',
                                            padding: '4px 0',
                                            fontSize: '11px',
                                            fontWeight: 950,
                                            textTransform: 'uppercase',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            appearance: 'none',
                                            paddingRight: '12px'
                                        }}
                                    >
                                        <option value="english" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>English</option>
                                        <option value="hinglish" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Hinglish</option>
                                        <option value="hindi" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Hindi</option>
                                        <option value="bhojpuri" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Bhojpuri</option>
                                        <option value="marathi" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Marathi</option>
                                        <option value="bengali" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Bengali</option>
                                        <option value="tamil" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Tamil</option>
                                        <option value="telugu" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Telugu</option>
                                        <option value="gujarati" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Gujarati</option>
                                        <option value="kannada" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Kannada</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setIsAiExpanded(!isAiExpanded)}
                                    style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', marginRight: '8px' }}
                                    title={isAiExpanded ? "Collapse" : "Expand"}
                                >
                                    {isAiExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                                <button onClick={() => setAiOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={16} /></button>
                            </div>
                        </div>

                        {/* Quick Actions Restored */}
                        <div style={{ padding: '16px 20px', display: 'flex', gap: '10px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            {[
                                { label: 'Solve', icon: <Code2 size={12} />, msg: 'Solve this problem completely with the most optimal approach. Give me the full code.', color: '#22c55e' },
                                { label: 'Hint', icon: <Lightbulb size={12} />, msg: 'Give me a hint for this problem. Explain the logic or approach, but DO NOT write the full code solution. Let me try to implement it.', color: '#f59e0b' },
                                { label: 'Debug', icon: <Bug size={12} />, msg: 'My code has issues. Find the bugs and explain what is wrong. DO NOT give me the full corrected code, just help me fix it myself.', color: '#ef4444' },
                                { label: 'Optimize', icon: <Rocket size={12} />, msg: 'Optimize my current solution for better time and space complexity.', color: '#3b82f6' },
                                { label: 'Complexity', icon: <Timer size={12} />, msg: 'Analyze the Time and Space Complexity of my code. Provide the Big O notation for both and explain the reasoning briefly.', color: '#d946ef' },
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

                        {/* Chat History Area */}
                        <div ref={aiResponseRef} style={{
                            flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px'
                        }}>
                            {aiChatHistory.map((msg, idx) => (
                                <div key={idx} style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    gap: '8px',
                                    maxWidth: '90%'
                                }}>
                                    {msg.role === 'user' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)' }}>{user?.displayName || 'YOU'}</span>
                                            {user?.photos && (
                                                <img src={user.photos} alt="user" style={{ width: '20px', height: '20px', border: 'var(--border-main)' }} />
                                            )}
                                        </div>
                                    )}
                                    <div style={{
                                        background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-main)',
                                        border: 'var(--border-main)',
                                        color: msg.role === 'user' ? '#000' : 'var(--text-main)',
                                        padding: '16px 20px',
                                        borderRadius: '0',
                                        boxShadow: 'var(--shadow-main)',
                                        fontSize: '14px', lineHeight: '1.7',
                                        position: 'relative',
                                        width: '100%'
                                    }}>
                                        {msg.role === 'user' ? (
                                            <div>{msg.content}</div>
                                        ) : (
                                            // verifying availability of actionType
                                            // If executeAction is defined as: const executeAction = async (actionType) => { ... }
                                            // Then actionType is available in the scope.
                                            // However, the lint error says it is not defined.
                                            // Let me re-read the full file or at least the beginning of the component to see where I added the state. *latest* assistant message to apply animation
                                            (msg.isNew && idx === aiChatHistory.length - 1) ? (
                                                <TypewriterEffect text={msg.content} onComplete={() => {
                                                    // Mark as not new after animation
                                                    const updated = [...aiChatHistory];
                                                    updated[idx].isNew = false;
                                                }} />
                                            ) : (
                                                <div className="ai-response-content">
                                                    <Markdown components={{ pre: ({ children }) => <>{children}</>, code: CodeBlock }}>
                                                        {msg.content}
                                                    </Markdown>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}

                            {aiLoading && (
                                <div style={{ alignSelf: 'flex-start', background: 'var(--bg-main)', border: 'var(--border-main)', padding: '14px 20px', borderRadius: '0', boxShadow: 'var(--shadow-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Loader2 size={18} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
                                    <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 950 }}>THINKING...</span>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '20px', background: 'var(--bg-main)', borderTop: 'var(--border-main)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="text"
                                    value={aiMessage}
                                    onChange={(e) => setAiMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !aiLoading && handleAIAssist()}
                                    placeholder="ASK_SMARTCODER..."
                                    disabled={aiLoading}
                                    style={{ width: '100%', background: 'var(--bg-card)', border: 'var(--border-main)', color: 'var(--text-main)', padding: '14px 50px 14px 20px', borderRadius: '0', outline: 'none', fontSize: '14px', fontWeight: 700, transition: 'all 0.2s', boxShadow: 'inset var(--shadow-main)' }}
                                />
                                <button onClick={() => handleAIAssist()} disabled={aiLoading || !aiMessage.trim()} className="neo-btn" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: (aiLoading || !aiMessage.trim()) ? 'var(--bg-main)' : 'var(--accent)', color: (aiLoading || !aiMessage.trim()) ? 'var(--text-muted)' : '#000', border: 'var(--border-main)', width: '32px', height: '32px', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (aiLoading || !aiMessage.trim()) ? 'not-allowed' : 'pointer', boxShadow: 'none' }}>
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modals */}
            <SubmissionSuccess
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                stats={{
                    runtime: result?.status_runtime,
                    memory: result?.status_memory,
                    complexity: result?.complexity
                }}
            />

            <TopUpModal
                isOpen={showTopUpModal}
                onClose={() => setShowTopUpModal(false)}
            />
        </div>
    );
};

export default Workspace;
