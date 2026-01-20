
import React from 'react';
import { motion } from 'framer-motion';
import { Snowbase, Coffee, Music, Gamepad2 } from 'lucide-react'; // Icons for chill vibe

const ChillPage = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            background: 'linear-gradient(135deg, #101010 0%, #1a1a1a 100%)',
            color: '#ffffff',
            fontFamily: 'Inter, sans-serif',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>

            {/* Background Ambience */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, rgba(64, 196, 255, 0.05) 0%, transparent 60%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ zIndex: 1, textAlign: 'center' }}
            >
                <div style={{
                    display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px'
                }}>
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                        <Coffee size={40} color="#60a5fa" />
                    </motion.div>
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                        <Music size={40} color="#a78bfa" />
                    </motion.div>
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <Gamepad2 size={40} color="#34d399" />
                    </motion.div>
                </div>

                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: 800,
                    background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #34d399)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '20px',
                    letterSpacing: '-2px'
                }}>
                    Chill Zone
                </h1>

                <p style={{
                    fontSize: '1.5rem',
                    color: '#9ca3af',
                    maxWidth: '600px',
                    lineHeight: 1.6
                }}>
                    Take a break from the grind. <br />
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>Exciting features coming very soon.</span>
                </p>

                <div style={{ marginTop: '50px' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '10px 20px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        color: '#6b7280',
                        backdropFilter: 'blur(5px)'
                    }}>
                        Relax • Mini-Games • Lo-Fi Beats
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default ChillPage;
