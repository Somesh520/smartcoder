import React, { useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism-dark.css'; // or any theme you prefer

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
        <div className="code-area" style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden', background: '#1e1e1e' }}>
            <style>{`
                /* Scrollbar Styling */
                .code-area textarea, .code-area pre {
                    outline: none !important;
                }
                /* Prism Overrides for Dark Theme Matching */
                code[class*="language-"], pre[class*="language-"] {
                    text-shadow: none !important;
                    font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace !important;
                    font-size: 14px !important;
                    line-height: 1.5 !important;
                }
                .token.operator { background: none !important; }
           `}</style>

            <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>
                <Editor
                    value={code}
                    onValueChange={onChange}
                    highlight={code => highlightCode(code)}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 14,
                        minHeight: '100%'
                    }}
                    textareaId="codeEditor"
                    className="prism-editor"
                />
            </div>
        </div>
    );
};

export default CodeEditor;
