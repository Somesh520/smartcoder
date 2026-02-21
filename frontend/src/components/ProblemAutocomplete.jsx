import React, { useState, useEffect, useRef } from 'react';
import { Search, Lock, Check } from 'lucide-react';
import { searchProblems } from '../api';

const ProblemAutocomplete = ({ onSelect, initialValue = "" }) => {
    const [query, setQuery] = useState(initialValue);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            // Only fetch if open (user typing) vs just setting initial value
            if (!isOpen) return;

            setLoading(true);
            try {
                const data = await searchProblems(query);
                setResults(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Search failed", e);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    const handleSelect = (problem) => {
        setQuery(problem.title);
        onSelect(problem.slug); // Pass slug to parent
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <div style={{
                display: 'flex', alignItems: 'center',
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '0 12px', transition: 'all 0.2s',
                focusWithin: { borderColor: 'var(--accent-green)' }
            }}>
                <Search size={16} color="#71717a" />
                <input
                    placeholder="Search problem (e.g. 'Two Sum')"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        // If user clears, notify parent
                        if (e.target.value === "") onSelect("");
                    }}
                    onFocus={() => setIsOpen(true)}
                    style={{
                        width: '100%', padding: '14px 10px', background: 'transparent',
                        border: 'none', color: 'white', fontSize: '15px', outline: 'none',
                        fontWeight: 500
                    }}
                />
            </div>

            {/* DROPDOWN */}
            {isOpen && (results.length > 0 || loading) && (
                <div style={{
                    position: 'absolute', top: '110%', left: 0, right: 0,
                    background: '#18181b', border: '1px solid #3f3f46',
                    borderRadius: '12px', maxHeight: '250px', overflowY: 'auto',
                    zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    padding: '8px'
                }}>
                    {loading && <div style={{ padding: '10px', color: '#a1a1aa', fontSize: '13px', textAlign: 'center' }}>Searching...</div>}

                    {!loading && results.map(problem => (
                        <div
                            key={problem.id}
                            onClick={() => !problem.paid && handleSelect(problem)}
                            style={{
                                padding: '10px 12px', borderRadius: '8px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                cursor: problem.paid ? 'not-allowed' : 'pointer',
                                background: 'transparent',
                                transition: 'background 0.1s',
                                opacity: problem.paid ? 0.5 : 1
                            }}
                            onMouseEnter={e => !problem.paid && (e.currentTarget.style.background = '#27272a')}
                            onMouseLeave={e => !problem.paid && (e.currentTarget.style.background = 'transparent')}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>{problem.title}</span>
                                <span style={{ color: '#a1a1aa', fontSize: '11px', marginTop: '2px' }}>
                                    <span style={{
                                        color: problem.difficulty === 'Easy' ? '#22c55e' : (problem.difficulty === 'Medium' ? '#eab308' : '#ef4444')
                                    }}>
                                        {problem.difficulty}
                                    </span>
                                </span>
                            </div>
                            {problem.paid && <Lock size={14} color="#ef4444" />}
                        </div>
                    ))}

                    {!loading && results.length === 0 && query.length >= 2 && (
                        <div style={{ padding: '10px', color: '#a1a1aa', fontSize: '13px', textAlign: 'center' }}>No matches found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProblemAutocomplete;
