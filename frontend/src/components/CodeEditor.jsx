import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism-tomorrow.css';

const CodeEditor = ({ code, onChange, language }) => {
    const highlightCode = (code) => {
        let grammar = languages.clike;
        if (language === 'python') grammar = languages.python;
        if (language === 'javascript') grammar = languages.javascript;
        if (language === 'java') grammar = languages.java;
        if (language === 'cpp' || language === 'c') grammar = languages.cpp;

        return highlight(code, grammar || languages.clike, language);
    };

    return (
        <div className="code-area" style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
            borderRadius: '0 0 8px 8px'
        }}>
            <style>{`
                /* Code Editor Styling */
                .code-area {
                    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace !important;
                }
                
                .code-area textarea, 
                .code-area pre {
                    outline: none !important;
                    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace !important;
                    font-size: 14px !important;
                    line-height: 1.6 !important;
                    letter-spacing: 0.3px;
                    padding-left: 60px !important;
                }

                /* Line Numbers using CSS Counter */
                .editor-wrapper {
                    position: relative;
                    counter-reset: line;
                }

                .editor-wrapper pre {
                    position: relative;
                }

                .editor-wrapper pre > code {
                    display: block;
                }

                .editor-wrapper pre::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 55px;
                    background: rgba(13, 17, 23, 0.8);
                    border-right: 2px solid rgba(59, 130, 246, 0.3);
                    pointer-events: none;
                }

                .editor-wrapper .token-line {
                    counter-increment: line;
                    position: relative;
                }

                .editor-wrapper .token-line::before {
                    content: counter(line);
                    position: absolute;
                    left: -60px;
                    width: 40px;
                    text-align: right;
                    color: #6b7280;
                    font-weight: 600;
                    font-size: 13px;
                    user-select: none;
                    padding-right: 12px;
                }

                /* Enhanced Prism Theme */
                code[class*="language-"],
                pre[class*="language-"] {
                    color: #e5e7eb !important;
                    background: transparent !important;
                    text-shadow: none !important;
                    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace !important;
                    font-size: 14px !important;
                    line-height: 1.6 !important;
                }

                /* Syntax Highlighting Colors */
                .token.comment,
                .token.prolog,
                .token.doctype,
                .token.cdata {
                    color: #6b7280 !important;
                    font-style: italic;
                }

                .token.punctuation {
                    color: #9ca3af !important;
                }

                .token.property,
                .token.tag,
                .token.boolean,
                .token.number,
                .token.constant,
                .token.symbol,
                .token.deleted {
                    color: #f59e0b !important;
                    font-weight: 500;
                }

                .token.selector,
                .token.attr-name,
                .token.string,
                .token.char,
                .token.builtin,
                .token.inserted {
                    color: #22c55e !important;
                }

                .token.operator,
                .token.entity,
                .token.url,
                .language-css .token.string,
                .style .token.string {
                    color: #3b82f6 !important;
                    background: none !important;
                }

                .token.atrule,
                .token.attr-value,
                .token.keyword {
                    color: #a78bfa !important;
                    font-weight: 600;
                }

                .token.function,
                .token.class-name {
                    color: #60a5fa !important;
                    font-weight: 600;
                }

                .token.regex,
                .token.important,
                .token.variable {
                    color: #fb923c !important;
                }

                /* Scrollbar Styling */
                .code-area ::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }

                .code-area ::-webkit-scrollbar-track {
                    background: rgba(14, 14, 20, 0.5);
                    border-radius: 5px;
                }

                .code-area ::-webkit-scrollbar-thumb {
                    background: rgba(59, 130, 246, 0.3);
                    border-radius: 5px;
                    border: 2px solid rgba(14, 14, 20, 0.5);
                }

                .code-area ::-webkit-scrollbar-thumb:hover {
                    background: rgba(59, 130, 246, 0.5);
                }

                /* Selection */
                .code-area ::selection {
                    background: rgba(59, 130, 246, 0.3);
                }
            `}</style>

            {/* Line Numbers Gutter */}
            <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '55px',
                background: 'rgba(13, 17, 23, 0.8)',
                borderRight: '2px solid rgba(59, 130, 246, 0.3)',
                padding: '15px 0',
                overflow: 'hidden',
                zIndex: 1,
                pointerEvents: 'none'
            }}>
                {code.split('\n').map((_, i) => (
                    <div
                        key={i}
                        style={{
                            height: '22.4px', // 14px font * 1.6 line-height
                            textAlign: 'right',
                            paddingRight: '12px',
                            color: '#6b7280',
                            fontSize: '13px',
                            fontWeight: 600,
                            userSelect: 'none',
                            fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace'
                        }}
                    >
                        {i + 1}
                    </div>
                ))}
            </div>

            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '15px',
                paddingLeft: '50px',
                background: 'rgba(13, 17, 23, 0.6)'
            }}>
                <Editor
                    value={code}
                    onValueChange={onChange}
                    highlight={code => highlightCode(code)}
                    padding={0}
                    style={{
                        fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                        fontSize: 14,
                        minHeight: '100%',
                        lineHeight: 1.6,
                        caretColor: '#3b82f6'
                    }}
                    textareaId="codeEditor"
                    className="prism-editor"
                    tabSize={4}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
