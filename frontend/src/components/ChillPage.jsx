
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageSquare, Coffee } from 'lucide-react';

const ChillPage = ({ socket, user }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        // Join the Chill Zone
        const username = user?.displayName || `Guest-${Math.floor(Math.random() * 1000)}`;
        socket.emit('join_chill_room', { username });

        // Listen for incoming messages
        const handleMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
        };

        socket.on('chill_message', handleMessage);

        // Initial Welcome Message (Local Only)
        setMessages([{
            id: 'welcome',
            type: 'system',
            text: 'Welcome to the Trollbox! Be nice (or funny).',
            timestamp: new Date().toISOString()
        }]);

        return () => {
            socket.off('chill_message', handleMessage);
            // Optional: leave room logic if needed
        };
    }, [socket, user]);

    const handleSend = () => {
        if (!inputValue.trim() || !socket) return;

        const username = user?.displayName || "Anonymous";

        // Optimistic UI Update (optional, but socket broadcasts back so maybe skip)
        // Actually, socketHandler relays to everyone including sender. So we wait for socket.

        socket.emit('send_chill_message', {
            username,
            text: inputValue,
            type: 'user'
        });

        setInputValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
            background: '#09090b', color: 'white', fontFamily: 'Inter, sans-serif'
        }}>

            {/* Header */}
            <div style={{
                padding: '20px', borderBottom: '1px solid #27272a',
                display: 'flex', alignItems: 'center', gap: '15px',
                background: '#18181b'
            }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <MessageSquare size={24} color="white" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Global Trollbox</h1>
                    <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>
                        <span style={{ color: '#4ade80' }}>●</span> Online
                    </span>
                </div>
                <div style={{ marginLeft: 'auto', opacity: 0.5 }}>
                    <Coffee size={24} />
                </div>
            </div>

            {/* Chat Area */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                alignSelf: msg.username === user?.displayName ? 'flex-end' : 'flex-start',
                                maxWidth: '70%',
                                display: 'flex', flexDirection: 'column',
                                alignItems: msg.username === user?.displayName ? 'flex-end' : 'flex-start'
                            }}
                        >
                            {msg.type === 'user' && msg.username !== user?.displayName && (
                                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '4px', marginLeft: '4px' }}>
                                    {msg.username}
                                </span>
                            )}

                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '16px',
                                borderTopLeftRadius: msg.username !== user?.displayName ? '4px' : '16px',
                                borderTopRightRadius: msg.username === user?.displayName ? '4px' : '16px',
                                background: msg.type === 'system' ? 'rgba(255, 255, 255, 0.1)' :
                                    msg.username === user?.displayName ? '#6366f1' : '#27272a',
                                color: msg.type === 'system' ? '#fdba74' : 'white',
                                border: msg.type === 'system' ? '1px dashed rgba(253, 186, 116, 0.3)' : 'none',
                                fontSize: msg.type === 'system' ? '0.9rem' : '1rem',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                width: msg.type === 'system' ? '100%' : 'auto',
                                textAlign: msg.type === 'system' ? 'center' : 'left'
                            }}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                padding: '20px', background: '#18181b', borderTop: '1px solid #27272a',
                display: 'flex', gap: '10px'
            }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    style={{
                        flex: 1, padding: '14px', borderRadius: '12px',
                        background: '#09090b', border: '1px solid #27272a',
                        color: 'white', fontSize: '1rem', outline: 'none'
                    }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        background: '#6366f1', border: 'none', borderRadius: '12px',
                        width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Send size={20} color="white" />
                </button>
            </div>

        </div>
    );
};

export default ChillPage;
