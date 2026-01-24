import React, { useState, useEffect, useRef } from 'react';
import { chatWithAssistant } from '../api';
import { Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-dark.css';
import styles from './AssistantPage.module.css';
const AssistantPage = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your academic assistant. specialized in helping you schedule your time, manage notes, and study efficiently. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const data = await chatWithAssistant(userMsg, {
                // We could pass context here if we wanted, e.g. "current view", "recent notes"
                timestamp: new Date().toISOString()
            });

            setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I had trouble connecting to the server." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            display: 'flex',
                            gap: '12px'
                        }}
                    >
                        {msg.role === 'assistant' && (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Bot color="black" size={20} />
                            </div>
                        )}

                        <div style={{
                            background: msg.role === 'user'
                                ? 'linear-gradient(135deg, #3f3f46 0%, #27272a 100%)'
                                : 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: msg.role === 'assistant' ? 'blur(10px)' : 'none',
                            border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                            padding: '16px',
                            borderRadius: '16px',
                            borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                            borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                            lineHeight: '1.6',
                            color: 'white',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            maxWidth: '100%'
                        }}>
                            {msg.role === 'user' ? (
                                msg.text
                            ) : (
                                <div className={styles.markdownContent}>
                                    <ReactMarkdown
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <pre className={className} style={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
                                                        <code dangerouslySetInnerHTML={{
                                                            __html: highlight(String(children).replace(/\n$/, ''), languages[match[1]] || languages.clike || languages.js, match[1])
                                                        }} />
                                                    </pre>
                                                ) : (
                                                    <code className={className} {...props} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#52525b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                                <User color="white" size={20} />
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="animate-pulse" style={{ alignSelf: 'flex-start', marginLeft: '50px', color: '#a1a1aa', fontStyle: 'italic', display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%' }}></div>
                        <div style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%', opacity: 0.6 }}></div>
                        <div style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%', opacity: 0.3 }}></div>
                        <span style={{ marginLeft: '8px' }}>Thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '20px' }}>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', background: '#18181b', padding: '10px', borderRadius: '16px', border: '1px solid #333' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about your schedule, notes, or study plan..."
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none', padding: '0 10px' }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: loading ? '#333' : 'var(--accent-green)',
                            color: 'black',
                            border: 'none',
                            borderRadius: '12px',
                            width: '44px', height: '44px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AssistantPage;
