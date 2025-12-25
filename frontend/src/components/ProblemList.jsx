import React, { useState, useEffect } from 'react';

const ProblemList = ({ problems, loading, onRefresh, onSelectProblem }) => {
    const [filtered, setFiltered] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setFiltered(problems.filter(p =>
            String(p.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(p.id).includes(searchTerm)
        ));
    }, [searchTerm, problems]);

    return (
        <div style={{ position: 'absolute', top: '50px', left: 0, width: '100%', height: 'calc(100vh - 50px)', background: 'var(--bg-body)', zIndex: 100, padding: '20px', overflowY: 'auto' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        style={{ flex: 1, background: '#262626', border: '1px solid #333', padding: '10px', color: 'white', borderRadius: '4px', outline: 'none' }}
                    />
                    <button onClick={onRefresh} className="btn-action" style={{ background: '#333', color: 'white' }}>Refresh</button>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <div className="spinner" style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
                        <div style={{ marginTop: '10px', fontSize: '14px', color: '#888' }}>Loading Problems...</div>
                    </div>
                )}

                {!loading && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', color: 'var(--text-secondary)', padding: '10px', borderBottom: '1px solid #333', fontWeight: 500 }}>Status</th>
                                <th style={{ textAlign: 'left', color: 'var(--text-secondary)', padding: '10px', borderBottom: '1px solid #333', fontWeight: 500 }}>Title</th>
                                <th style={{ textAlign: 'left', color: 'var(--text-secondary)', padding: '10px', borderBottom: '1px solid #333', fontWeight: 500 }}>Difficulty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice(0, 100).map(p => (
                                <tr key={p.id} onClick={() => onSelectProblem(p)} style={{ cursor: 'pointer', borderBottom: '1px solid #333' }}>
                                    <td style={{ padding: '12px 10px', color: '#2cbb5d' }}>➜</td>
                                    <td style={{ padding: '12px 10px', fontWeight: 500, color: '#eff1f6' }}>{p.id}. {p.title}</td>
                                    <td style={{ padding: '12px 10px' }}>
                                        <span className={`badge ${String(p.difficulty).toLowerCase()}`}>{p.difficulty}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProblemList;
