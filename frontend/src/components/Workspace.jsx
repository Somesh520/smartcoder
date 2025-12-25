import React, { useState, useEffect } from 'react';
import { fetchProblemDetails, runCode, submitCode, pollResult } from '../api';
import CodeEditor from './CodeEditor';
import Console from './Console';
import { Play, Send } from 'lucide-react';

const DEFAULT_TEMPLATES = {
    'cpp': 'class Solution {\npublic:\n    // Write C++ code here\n};',
    'java': 'class Solution {\n    public void solve() {\n        // Write Java code here\n    }\n}',
    'python': 'class Solution(object):\n    def solve(self):\n        # Write Python code here\n        pass',
    'javascript': 'var solve = function() {\n    // Write JS code here\n};'
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

                // PERSISTENCE KEY
                const storageKey = roomId ? `code_${roomId}_${problem.id}` : null;
                const savedCode = storageKey ? localStorage.getItem(storageKey) : null;

                if (savedCode) {
                    // Restore Saved Code
                    console.log("📂 Restored code from cache");
                    // Assuming saved code implies we also saved language? For now just detecting or default.
                    // Ideally we save { code, lang }. But simpler for now:
                    // If we restore code, we should probably stick to default lang or saved lang.
                    // For simplicity, let's just restore code and let user switch lang if needed (or store lang too later).
                    // Actually, let's store language too.
                    const savedLang = localStorage.getItem(`${storageKey}_lang`);

                    if (savedLang) setLanguage(savedLang);
                    setCode(savedCode);

                } else if (snippets.length > 0) {
                    // Default Load
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
    }, [problem.id, roomId]); // Re-run if problem or room changes

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        // SAVE TO STORAGE
        if (roomId) {
            localStorage.setItem(`code_${roomId}_${problem.id}`, newCode);
        }
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);

        // When switching lang, do we want to load snippet? 
        // Yes, usually resets code.
        const snip = availableSnippets.find(s => s.langSlug === newLang);
        const resetCode = snip ? snip.code : DEFAULT_TEMPLATES[newLang] || "";
        setCode(resetCode);

        if (roomId) {
            localStorage.setItem(`code_${roomId}_${problem.id}_lang`, newLang);
            localStorage.setItem(`code_${roomId}_${problem.id}`, resetCode); // Reset saved code on lang switch
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

            // Poll
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

                        // Notify Parent (Competition) ONLY if Submitted & Accepted
                        if (type === 'submit' && res.status_msg === 'Accepted' && onSubmissionSuccess) {
                            onSubmissionSuccess(res);
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
        <div className="workspace" style={{ display: 'flex', height: 'calc(100vh - 50px)' }}>
            {/* LEFT PANEL */}
            <div className="left-panel" style={{ flex: 1, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)', minWidth: '300px' }}>
                <div className="panel-header" style={{ padding: '10px 15px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    <span style={{ cursor: 'pointer', color: 'var(--accent-yellow)', marginRight: '10px' }} onClick={onBack}>← Back</span>
                    {problem.id}. {problem.title}
                </div>
                <div className="problem-content" style={{ padding: '20px', overflowY: 'auto', flex: 1, lineHeight: '1.6', fontSize: '14px' }}>
                    {details ? <div dangerouslySetInnerHTML={{ __html: details.content || details.questionHtml }} /> : "Loading..."}
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel" style={{ flex: 1.5, display: 'flex', flexDirection: 'column', background: 'var(--bg-editor)', position: 'relative' }}>
                <div className="editor-toolbar" style={{ height: '40px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', background: 'var(--bg-panel)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Language:</span>
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            className="lang-select"
                            style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', fontSize: '13px', cursor: 'pointer', outline: 'none', padding: '5px' }}
                        >
                            {availableSnippets.length > 0 ? (
                                availableSnippets.map(s => <option key={s.langSlug} value={s.langSlug}>{s.lang}</option>)
                            ) : <option value="cpp">C++</option>}
                        </select>
                    </div>
                    <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => executeAction('run')} className="btn-action btn-run" style={{ background: '#333', color: '#fff' }}>
                            <Play size={14} /> Run
                        </button>
                        <button onClick={() => executeAction('submit')} className="btn-action btn-submit" style={{ background: 'var(--accent-green)', color: '#fff' }}>
                            <Send size={14} /> Submit
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '40px' }}>
                    <CodeEditor code={code} onChange={handleCodeChange} language={language} />
                </div>

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
