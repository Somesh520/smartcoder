import React, { useState } from 'react';
import { dsaPatterns } from '../data/dsaPatterns';
import SEO from './SEO';
import { ArrowLeft, ExternalLink, Code, Layers, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LearnPage = () => {
    const navigate = useNavigate();
    const [selectedPattern, setSelectedPattern] = useState(null);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #09090b, #000000)',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            padding: '40px 20px',
            paddingTop: '100px' // Space for fixed header
        }}>
            <SEO
                title={selectedPattern ? `${selectedPattern.name} - AlgoDuel Learn` : "Master DSA Patterns - AlgoDuel"}
                description="A curated collection of the most critical coding patterns (Sliding Window, Two Pointers, DP) to ace your technical interviews."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* HEADER SECTION */}
                <div style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '56px', fontWeight: 900,
                        background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        marginBottom: '16px', letterSpacing: '-2px'
                    }}>
                        Master DSA Patterns
                    </h1>
                    <p style={{ fontSize: '18px', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>
                        A curated collection of the most critical coding patterns to ace your technical interviews.
                    </p>
                </div>

                {/* PATTERN GRID / DETAIL VIEW */}
                {!selectedPattern ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '24px'
                    }}>
                        {dsaPatterns.map((pattern, index) => (
                            <div
                                key={pattern.id}
                                onClick={() => setSelectedPattern(pattern)}
                                style={{
                                    background: 'rgba(24, 24, 27, 0.6)',
                                    borderRadius: '24px',
                                    padding: '30px',
                                    border: '1px solid #27272a',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    group: 'hover',
                                    display: 'flex', flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '220px'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.borderColor = '#3f3f46';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = '#27272a';
                                }}
                            >
                                <div>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: 'rgba(255, 255, 255, 0.05)', marginBottom: '20px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        <Layers size={20} color="#a1a1aa" />
                                    </div>
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px', lineHeight: 1.2 }}>
                                        {pattern.name.split('. ')[1] || pattern.name}
                                    </h3>
                                    <p style={{ fontSize: '15px', color: '#71717a', lineHeight: 1.6 }}>
                                        {pattern.description}
                                    </p>
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                    paddingTop: '20px'
                                }}>
                                    <span style={{ fontSize: '13px', color: '#52525b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FileText size={14} />
                                        {pattern.questions.length} Questions
                                    </span>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'white', color: 'black',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transform: 'rotate(-45deg)', transition: 'transform 0.3s'
                                    }}>
                                        <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // DETAIL VIEW
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <button
                            onClick={() => setSelectedPattern(null)}
                            style={{
                                background: 'transparent',
                                border: '1px solid #27272a',
                                color: '#a1a1aa',
                                padding: '10px 20px',
                                borderRadius: '100px',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                marginBottom: '40px',
                                fontSize: '14px', fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.target.style.background = '#27272a'; e.target.style.color = 'white'; }}
                            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#a1a1aa'; }}
                        >
                            <ArrowLeft size={16} /> Back to Patterns
                        </button>

                        <div style={{
                            background: '#18181b', borderRadius: '32px',
                            border: '1px solid #27272a', overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '60px',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0) 100%)',
                                borderBottom: '1px solid #27272a'
                            }}>
                                <h2 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px' }}>
                                    {selectedPattern.name}
                                </h2>
                                <p style={{ fontSize: '18px', color: '#a1a1aa', maxWidth: '700px' }}>
                                    {selectedPattern.description}
                                </p>
                            </div>

                            <div style={{ padding: '40px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                    {selectedPattern.questions.map((q, i) => {
                                        const isLeetCode = q.link.includes('leetcode.com/problems/');
                                        const getSlug = (url) => {
                                            const match = url.match(/\/problems\/([^/]+)/);
                                            return match ? match[1] : null;
                                        };

                                        return (
                                            <div
                                                key={i}
                                                onClick={(e) => {
                                                    if (isLeetCode) {
                                                        e.preventDefault();
                                                        const slug = getSlug(q.link);
                                                        if (slug) navigate(`/app/workspace/${slug}`, { state: { from: 'learn' } });
                                                    } else {
                                                        window.open(q.link, '_blank');
                                                    }
                                                }}
                                                style={{
                                                    textDecoration: 'none',
                                                    background: 'rgba(255, 255, 255, 0.02)',
                                                    border: '1px solid #27272a',
                                                    padding: '20px',
                                                    borderRadius: '16px',
                                                    display: 'flex', flexDirection: 'column', gap: '12px',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.borderColor = '#3f3f46';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.borderColor = '#27272a';
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <span style={{
                                                        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                                        color: q.difficulty === 'Easy' ? '#4ade80' : (q.difficulty === 'Medium' ? '#facc15' : '#f87171'),
                                                        background: q.difficulty === 'Easy' ? 'rgba(74, 222, 128, 0.1)' : (q.difficulty === 'Medium' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(248, 113, 113, 0.1)'),
                                                        padding: '4px 10px', borderRadius: '100px'
                                                    }}>
                                                        {q.difficulty}
                                                    </span>
                                                    <ExternalLink size={14} color="#52525b" />
                                                </div>

                                                <div style={{ fontSize: '16px', fontWeight: 600, color: 'white', lineHeight: 1.4 }}>
                                                    {q.name}
                                                </div>

                                                <div style={{ fontSize: '13px', color: '#71717a', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Code size={12} />
                                                    {q.platform}
                                                    {isLeetCode && <span style={{ fontSize: '10px', background: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto' }}>SOLVE NOW</span>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
            </div>
        </div>
    );
};

export default LearnPage;
