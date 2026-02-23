import React, { useRef, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';

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

const CodeEditor = ({ code, onChange, language, theme }) => {
    const editorRef = useRef(null);

    const monacoLang = LANGUAGE_MAP[language] || 'cpp';

    const handleEditorDidMount = useCallback((editor, monaco) => {
        editorRef.current = editor;

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
            }
        });

        monaco.editor.defineTheme('leetcode-light', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '707070', fontStyle: 'italic' },
                { token: 'keyword', foreground: '0000ff', fontStyle: 'bold' },
                { token: 'string', foreground: '008000' },
                { token: 'number', foreground: '000000', fontStyle: 'bold' },
                { token: 'type', foreground: '2b91af' },
                { token: 'function', foreground: '000000', fontStyle: 'bold' },
                { token: 'variable', foreground: '000000' },
                { token: 'operator', foreground: '000000', fontStyle: 'bold' },
            ],
            colors: {
                'editor.background': '#ffffff',
                'editor.foreground': '#000000',
                'editor.lineHighlightBackground': '#f0f0f0',
                'editor.selectionBackground': '#add6ff',
                'editorLineNumber.foreground': '#888888',
                'editorLineNumber.activeForeground': '#000000',
                'editorCursor.foreground': '#000000',
                'editorIndentGuide.background': '#d3d3d3',
                'editorIndentGuide.activeBackground': '#939393',
                'editorGutter.background': '#ffffff',
            }
        });

        monaco.editor.setTheme(theme === 'dark' ? 'leetcode-dark' : 'leetcode-light');

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
    }, [monacoLang, theme]);

    const handleChange = (value) => {
        if (onChange) onChange(value || '');
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: '#0d1117',
            borderRadius: '0 0 8px 8px',
            overflow: 'hidden'
        }}>
            <MonacoEditor
                height="100%"
                language={monacoLang}
                value={code}
                onChange={handleChange}
                onMount={handleEditorDidMount}
                loading={
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: '100%',
                        background: 'var(--bg-main)',
                        color: 'var(--text-muted)',
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
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    autoClosingDelete: 'always',
                    autoSurround: 'languageDefined',
                    bracketPairColorization: { enabled: true },
                    guides: {
                        bracketPairs: true,
                        indentation: true,
                        highlightActiveIndentation: true,
                    },
                    matchBrackets: 'always',
                    autoIndent: 'full',
                    formatOnPaste: true,
                    formatOnType: true,
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
                    folding: true,
                    foldingStrategy: 'indentation',
                    showFoldingControls: 'mouseover',
                    lineNumbers: 'on',
                    lineNumbersMinChars: 3,
                    glyphMargin: false,
                    minimap: { enabled: false },
                    smoothScrolling: true,
                    scrollBeyondLastLine: false,
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto',
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                        useShadows: false
                    },
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
