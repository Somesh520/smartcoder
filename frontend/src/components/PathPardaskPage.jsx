import React, { useState, useEffect } from 'react';
import { Zap, Star, ShieldCheck, Loader2 } from 'lucide-react';
import SEO from './SEO';
import { BASE_URL } from '../api';

const PathPardaskPage = ({ user }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (user?.email) {
                try {
                    const res = await fetch(`${BASE_URL}/api/tester/status?email=${user.email}`);
                    const data = await res.json();
                    if (data.success && data.isRegistered) {
                        setIsRegistered(true);
                    }
                } catch (e) {
                    console.error("Failed to check registration status", e);
                }
            }
        };
        checkStatus();
    }, [user?.email]);

    const handleRegister = async () => {
        if (!user?.loggedIn) {
            alert("Please login first to register as a tester.");
            return;
        }

        if (!user?.displayName || !user?.email) {
            alert("User profile information is still loading. Please wait a moment and try again.");
            return;
        }

        const registrationBody = {
            username: user.displayName || user.name || "Unknown User",
            email: user.email || ""
        };

        console.log("[Tester] Sending registration body:", registrationBody);

        setIsRegistering(true);
        try {
            const response = await fetch(`${BASE_URL}/api/tester/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(registrationBody)
            });

            const data = await response.json();
            if (data.success) {
                setIsRegistered(true);
            } else {
                console.error("[Tester] Registration failed with status:", response.status, data);
                alert(`Error: ${data.message || "Registration failed"}`);
            }
        } catch (error) {
            console.error("[Tester] Registration error:", error);
            alert("An error occurred during registration. Check console for details.");
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            background: '#08080a',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <SEO title="Path Pardask - AlgoDuel" description="Your ultimate coding companion is coming soon. Register as a tester today." />

            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '100px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'var(--accent)', fontSize: '14px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '40px', boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)' }}>
                    <Zap size={16} fill="var(--accent)" />
                    The Future of Guidance
                </div>

                {/* Unique Font Container */}
                <div style={{ marginBottom: '50px', animation: 'fadeInUp 0.8s ease-out' }}>
                    <h1 style={{
                        fontFamily: "'Cinzel', 'Playfair Display', serif",
                        fontSize: 'clamp(56px, 10vw, 100px)',
                        fontWeight: 900,
                        letterSpacing: '4px',
                        margin: 0,
                        background: 'linear-gradient(135deg, #fff 0%, var(--accent) 50%, #16a34a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 10px 40px rgba(34, 197, 94, 0.4)'
                    }}>
                        Path Pardask
                    </h1>
                    <div style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: 'var(--accent)',
                        letterSpacing: '12px',
                        textTransform: 'uppercase',
                        marginTop: '15px',
                        textShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
                    }}>
                        Coming Soon
                    </div>
                </div>

                <p style={{
                    fontSize: '20px',
                    color: '#a1a1aa',
                    maxWidth: '650px',
                    margin: '0 auto 40px',
                    lineHeight: 1.8,
                    animation: 'fadeInUp 1s ease-out 0.2s both'
                }}>
                    A guided algorithmic journey that adapts to your pace. From standard patterns to arcane optimizations, <strong style={{ color: '#fff' }}>Path Pardask</strong> illuminates the way.
                </p>

                {isRegistered ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        color: 'var(--accent)',
                        fontWeight: 800,
                        animation: 'fadeInUp 0.5s ease-out'
                    }}>
                        <ShieldCheck size={48} />
                        <span style={{ fontSize: '24px' }}>YOU'RE ON THE LIST!</span>
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px', fontWeight: 600 }}>We'll contact you at {user?.email} when we're ready.</p>
                    </div>
                ) : (
                    <button
                        onClick={handleRegister}
                        disabled={isRegistering}
                        style={{
                            padding: '16px 40px',
                            fontSize: '18px',
                            fontWeight: 900,
                            background: 'var(--accent)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
                            animation: 'fadeInUp 1s ease-out 0.4s both'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(34, 197, 94, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.3)';
                        }}
                    >
                        {isRegistering ? <Loader2 size={24} className="animate-spin" /> : <Star size={24} fill="currentColor" />}
                        REGISTER AS TESTER
                    </button>
                )}

                {/* Decorative Elements */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '60px', opacity: 0.6, animation: 'fadeInUp 1s ease-out 0.6s both' }}>
                    <span style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent))' }} />
                    <Star size={24} color="var(--accent)" fill="var(--accent)" />
                    <span style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
                </div>
            </div>

            {/* Dynamically Inject Google Font for Cinzel and animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
};

export default PathPardaskPage;
