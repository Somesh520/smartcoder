import React, { useRef } from 'react';
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

const CodeEditor = ({ code, onChange, language }) => {
    const editorRef = useRef(null);

    const monacoLang = LANGUAGE_MAP[language] || 'cpp';

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        // Custom dark theme matching LeetCode
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
                { token: 'identifier', foreground: 'e5e7eb' },
                { token: 'tag', foreground: 'ef4444' },
                { token: 'attribute.name', foreground: 'fb923c' },
                { token: 'attribute.value', foreground: '22c55e' },
            ],
            colors: {
                'editor.background': '#0d1117',
                'editor.foreground': '#e5e7eb',
                'editor.lineHighlightBackground': '#161b2240',
                'editor.selectionBackground': '#3b82f630',
                'editor.inactiveSelectionBackground': '#3b82f615',
                'editorLineNumber.foreground': '#4b5563',
                'editorLineNumber.activeForeground': '#3b82f6',
                'editorCursor.foreground': '#3b82f6',
                'editorIndentGuide.background': '#27272a',
                'editorIndentGuide.activeBackground': '#3b82f640',
                'editor.selectionHighlightBackground': '#3b82f620',
                'editorBracketMatch.background': '#3b82f630',
                'editorBracketMatch.border': '#3b82f680',
                'editorGutter.background': '#0d111790',
                'scrollbar.shadow': '#00000000',
                'scrollbarSlider.background': '#3b82f625',
                'scrollbarSlider.hoverBackground': '#3b82f640',
                'scrollbarSlider.activeBackground': '#3b82f660',
                'editorWidget.background': '#161b22',
                'editorWidget.border': '#27272a',
                'editorSuggestWidget.background': '#161b22',
                'editorSuggestWidget.border': '#27272a',
                'editorSuggestWidget.selectedBackground': '#3b82f625',
                'editorSuggestWidget.highlightForeground': '#3b82f6',
                'list.hoverBackground': '#1e293b',
                'input.background': '#0d1117',
                'input.border': '#27272a',
                'focusBorder': '#3b82f6',
                'minimap.background': '#0d1117',
            }
        });

        monaco.editor.setTheme('leetcode-dark');

        // Keyboard shortcuts
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

        // Focus the editor
        editor.focus();
    };

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
                        height: '100%', background: '#0d1117', color: '#6b7280',
                        fontFamily: "'Inter', sans-serif", fontSize: '14px'
                    }}>
                        Loading editor...
                    </div>
                }
                options={{
                    // Core
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

                    // Code lens & folding
                    folding: true,
                    foldingStrategy: 'indentation',
                    showFoldingControls: 'mouseover',

                    // Line numbers & minimap
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
                    emptySelectionClipboard: true,
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
