import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Code2, ChevronRight, CheckCircle } from 'lucide-react';
import ModernSpinner from './ModernSpinner';

const ProblemList = ({ problems, solvedProblems, loading, onRefresh, onSelectProblem }) => {
    const [filtered, setFiltered] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [hoveredRow, setHoveredRow] = useState(null);

    useEffect(() => {
        setFiltered(problems.filter(p =>
            String(p.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(p.id).includes(searchTerm)
        ));
    }, [searchTerm, problems]);

    const getDifficultyColor = (diff) => {
        const d = String(diff).toLowerCase();
        if (d === 'easy') return { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', text: '#22c55e' };
        if (d === 'medium') return { bg: 'rgba(251, 191, 36, 0.15)', border: '#fbbf24', text: '#fbbf24' };
        if (d === 'hard') return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#ef4444' };
        return { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#3b82f6' };
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #0e0e14 100%)',
            padding: '30px',
            overflowY: 'auto'
        }}>
            {/* Ambient Background Effects */}
            <div style={{
                position: 'fixed',
                top: '20%',
                left: '10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
                zIndex: 0
            }}></div>
            <div style={{
                position: 'fixed',
                bottom: '20%',
                right: '10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
                zIndex: 0
            }}></div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header Section */}
                <div style={{
                    marginBottom: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
                        }}>
                            <Code2 size={24} color="#000" />
                        </div>
                        <div>
                            <h1 style={{
                                margin: 0,
                                fontSize: '28px',
                                fontWeight: 800,
                                background: 'linear-gradient(to right, #ffffff, #9ca3af)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.5px'
                            }}>
                                Problem Arena
                            </h1>
                            <p style={{
                                margin: 0,
                                fontSize: '13px',
                                color: '#6b7280',
                                fontWeight: 500,
                                letterSpacing: '0.5px'
                            }}>
                                {filtered.length} challenges available
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    marginBottom: '25px',
                    background: 'rgba(14, 14, 20, 0.6)',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{
                            position: 'absolute',
                            left: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#6b7280'
                        }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search problems by title or ID..."
                            style={{
                                width: '100%',
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                padding: '12px 15px 12px 45px',
                                color: 'white',
                                borderRadius: '8px',
                                outline: 'none',
                                fontSize: '14px',
                                transition: 'all 0.2s',
                                fontWeight: 500
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <button
                        onClick={onRefresh}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', marginTop: '80px' }}>
                        <ModernSpinner size={60} text="Loading Problems..." />
                    </div>
                )}

                {!loading && (
                    <div style={{
                        background: 'rgba(14, 14, 20, 0.4)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)'
                    }}>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1fr 140px 80px',
                            padding: '16px 20px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Status
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Title
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Difficulty
                            </div>
                            <div></div>
                        </div>

                        {/* Table Body */}
                        {filtered.map((p, index) => {
                            const diffColors = getDifficultyColor(p.difficulty);
                            const isHovered = hoveredRow === index;

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => onSelectProblem(p)}
                                    onMouseEnter={() => setHoveredRow(index)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '60px 1fr 140px 80px',
                                        padding: '18px 20px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                                        transition: 'all 0.2s',
                                        background: isHovered ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Hover Effect Border */}
                                    {isHovered && (
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: '3px',
                                            background: 'linear-gradient(to bottom, #3b82f6, #22c55e)',
                                            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                                        }}></div>
                                    )}

                                    {/* Status Icon */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: solvedProblems?.has(String(p.id)) ? '#22c55e' : '#3f3f46',
                                        justifyContent: 'center'
                                    }}>
                                        {solvedProblems?.has(String(p.id)) ? (
                                            <CheckCircle size={18} />
                                        ) : (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3f3f46' }}></div>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <span style={{
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            color: '#6b7280',
                                            minWidth: '35px'
                                        }}>
                                            #{p.id}
                                        </span>
                                        <span style={{
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            color: isHovered ? '#ffffff' : '#e5e7eb',
                                            transition: 'color 0.2s'
                                        }}>
                                            {p.title}
                                        </span>
                                    </div>

                                    {/* Difficulty Badge */}
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            background: diffColors.bg,
                                            color: diffColors.text,
                                            border: `1px solid ${diffColors.border}`,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {p.difficulty}
                                        </span>
                                    </div>

                                    {/* Arrow Icon */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        opacity: isHovered ? 1 : 0,
                                        transition: 'opacity 0.2s'
                                    }}>
                                        <ChevronRight size={20} color="#3b82f6" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}


            </div>
        </div>
    );
};

export default ProblemList;
