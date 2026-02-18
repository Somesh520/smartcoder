import React, { useRef, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { fetchAIAutocomplete } from '../api';

const LANGUAGE_MAP = {
    'cpp': 'cpp',
    'c': 'c',
    'java': 'java',
    'python': 'python',
    'python3': 'python',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'go': 'go',
    'rust': 'rust',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'csharp': 'csharp',
    'ruby': 'ruby',
    'scala': 'scala',
    'php': 'php'
};

const CodeEditor = ({ code, onChange, language }) => {
    const editorRef = useRef(null);
    const providerRef = useRef(null);
    const debounceRef = useRef(null);

    const monacoLang = LANGUAGE_MAP[language] || 'cpp';

    const handleEditorDidMount = useCallback((editor, monaco) => {
        editorRef.current = editor;

        // Custom dark theme
        monaco.editor.defineTheme('leetcode-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'a78bfa', fontStyle: 'bold' },
                { token: 'string', foreground: '22c55e' },
                { token: 'number', foreground: 'f59e0b' },
                { token: 'type', foreground: '60a5fa', fontStyle: 'bold' },
                { token: 'function', foreground: '60a5fa' },
                { token: 'variable', foreground: 'e5e7eb' },
                { token: 'operator', foreground: '3b82f6' },
                { token: 'delimiter', foreground: '9ca3af' },
                { token: 'constant', foreground: 'f59e0b' },
            ],
            colors: {
                'editor.background': '#0d1117',
                'editor.foreground': '#e5e7eb',
                'editor.lineHighlightBackground': '#161b2240',
                'editor.selectionBackground': '#3b82f630',
                'editorLineNumber.foreground': '#4b5563',
                'editorLineNumber.activeForeground': '#3b82f6',
                'editorCursor.foreground': '#3b82f6',
                'editorIndentGuide.background': '#27272a',
                'editorIndentGuide.activeBackground': '#3b82f640',
                'editorBracketMatch.background': '#3b82f630',
                'editorBracketMatch.border': '#3b82f680',
                'editorGutter.background': '#0d111790',
                'scrollbarSlider.background': '#3b82f625',
                'scrollbarSlider.hoverBackground': '#3b82f640',
                'editorWidget.background': '#161b22',
                'editorWidget.border': '#27272a',
                'editorSuggestWidget.background': '#161b22',
                'editorSuggestWidget.border': '#27272a',
                'editorSuggestWidget.selectedBackground': '#3b82f625',
                'editorSuggestWidget.highlightForeground': '#3b82f6',
                'editorGhostText.foreground': '#6b728080',
            }
        });

        monaco.editor.setTheme('leetcode-dark');

        // Register AI Inline Completion Provider
        if (providerRef.current) {
            providerRef.current.dispose();
        }

        providerRef.current = monaco.languages.registerInlineCompletionsProvider(monacoLang, {
            provideInlineCompletions: async (model, position, context, token) => {
                // Debounce: only trigger after user stops typing for 600ms
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                }

                return new Promise((resolve) => {
                    debounceRef.current = setTimeout(async () => {
                        if (token.isCancellationRequested) {
                            resolve({ items: [] });
                            return;
                        }

                        const code = model.getValue();
                        const cursorLine = position.lineNumber;
                        const cursorColumn = position.column;

                        // Don't trigger on very short code or empty lines
                        const currentLine = model.getLineContent(cursorLine).trim();
                        if (code.trim().length < 10 || currentLine.length < 2) {
                            resolve({ items: [] });
                            return;
                        }

                        try {
                            const result = await fetchAIAutocomplete({
                                code,
                                language: monacoLang,
                                cursorLine,
                                cursorColumn
                            });

                            if (token.isCancellationRequested || !result?.suggestion) {
                                resolve({ items: [] });
                                return;
                            }

                            const suggestion = result.suggestion;
                            if (!suggestion || suggestion.trim().length === 0) {
                                resolve({ items: [] });
                                return;
                            }

                            resolve({
                                items: [{
                                    insertText: suggestion,
                                    range: {
                                        startLineNumber: cursorLine,
                                        startColumn: cursorColumn,
                                        endLineNumber: cursorLine,
                                        endColumn: cursorColumn
                                    }
                                }]
                            });
                        } catch (err) {
                            console.error('AI suggestion error:', err);
                            resolve({ items: [] });
                        }
                    }, 600);
                });
            },
            freeInlineCompletions: () => { }
        });

        // Keyboard shortcut: format
        editor.addAction({
            id: 'format-code',
            label: 'Format Code',
            keybindings: [
                monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF
            ],
            run: (ed) => {
                ed.getAction('editor.action.formatDocument')?.run();
            }
        });

        editor.focus();
    }, [monacoLang]);

    const handleChange = (value) => {
        if (onChange) onChange(value || '');
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: '#0d1117',
            borderRadius: '0 0 8px 8px',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* AI badge */}
            <div style={{
                position: 'absolute', top: '8px', right: '12px', zIndex: 10,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '6px', padding: '3px 8px',
                fontSize: '10px', color: '#a78bfa', fontWeight: 700,
                letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px',
                pointerEvents: 'none'
            }}>
                <span style={{ fontSize: '12px' }}>✨</span> AI Autocomplete
            </div>

            <MonacoEditor
                height="100%"
                language={monacoLang}
                value={code}
                onChange={handleChange}
                onMount={handleEditorDidMount}
                loading={
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: '100%', background: '#0d1117', color: '#6b7280',
                        fontFamily: "'Inter', sans-serif", fontSize: '14px'
                    }}>
                        Loading editor...
                    </div>
                }
                options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
                    fontLigatures: true,
                    tabSize: 4,
                    insertSpaces: true,

                    // Auto-bracket & auto-close
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    autoClosingDelete: 'always',
                    autoSurround: 'languageDefined',

                    // Bracket highlighting
                    bracketPairColorization: { enabled: true },
                    guides: {
                        bracketPairs: true,
                        indentation: true,
                        highlightActiveIndentation: true,
                    },
                    matchBrackets: 'always',

                    // Auto-indentation
                    autoIndent: 'full',
                    formatOnPaste: true,
                    formatOnType: true,

                    // Suggestions & IntelliSense
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: true
                    },
                    acceptSuggestionOnEnter: 'on',
                    snippetSuggestions: 'inline',
                    wordBasedSuggestions: 'currentDocument',
                    parameterHints: { enabled: true },

                    // Inline suggestions (AI ghost text)
                    inlineSuggest: {
                        enabled: true,
                        mode: 'subwordSmart'
                    },

                    // Code folding
                    folding: true,
                    foldingStrategy: 'indentation',
                    showFoldingControls: 'mouseover',

                    // Line numbers
                    lineNumbers: 'on',
                    lineNumbersMinChars: 3,
                    glyphMargin: false,
                    minimap: { enabled: false },

                    // Scrolling
                    smoothScrolling: true,
                    scrollBeyondLastLine: false,
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto',
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                        useShadows: false
                    },

                    // UI
                    renderLineHighlight: 'line',
                    renderWhitespace: 'none',
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    cursorStyle: 'line',
                    cursorWidth: 2,
                    padding: { top: 16, bottom: 16 },
                    lineHeight: 22,
                    roundedSelection: true,
                    selectOnLineNumbers: true,
                    wordWrap: 'off',
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    overviewRulerBorder: false,
                    contextmenu: true,
                    mouseWheelZoom: true,

                    // Misc
                    links: true,
                    colorDecorators: true,
                    dragAndDrop: true,
                    find: {
                        addExtraSpaceOnTop: false,
                        autoFindInSelection: 'never',
                        seedSearchStringFromSelection: 'selection'
                    }
                }}
            />
        </div>
    );
};

export default CodeEditor;
