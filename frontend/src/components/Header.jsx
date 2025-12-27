import React from 'react';
import { useLocation } from 'react-router-dom';
import { Code2, Swords } from 'lucide-react';

const Header = ({ onShowProblemList, onGoDetail }) => {
    const location = useLocation();
    const currentView = location.pathname.includes('/competition') ? 'competition' :
        location.pathname.includes('/problems') ? 'list' : 'lobby';

    // Disable navigation if in competition
    const isInBattle = currentView === 'competition';

    const handleNav = (action) => {
        if (isInBattle) {
            alert("⚠️ You are in a battle! Use the 'Leave Room' button inside the sidebar to exit safely.");
            return;
        }
        action();
    };

    return (
        <header className="glass-panel" style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 30px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: '1px solid var(--border-subtle)'
        }}>
            <div
                className="brand"
                style={{ fontWeight: 800, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', cursor: isInBattle ? 'not-allowed' : 'pointer', opacity: isInBattle ? 0.7 : 1 }}
                onClick={() => handleNav(onGoDetail)}
            >
                <div style={{ width: '28px', height: '28px', background: 'var(--accent-green)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px var(--accent-green-glow)' }}>
                    <Code2 size={16} color="black" />
                </div>
                <span>AlgoDuel</span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={() => handleNav(onGoDetail)}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        color: isInBattle ? 'var(--text-muted)' : 'var(--text-secondary)',
                        cursor: isInBattle ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    <Swords size={14} color={isInBattle ? '#52525b' : '#4ade80'} />
                    Lobby
                </button>

                <button
                    onClick={() => handleNav(onShowProblemList)}
                    style={{
                        background: currentView === 'list' ? 'var(--bg-hover)' : 'transparent',
                        border: 'none',
                        color: isInBattle ? 'var(--text-muted)' : (currentView === 'list' ? 'white' : 'var(--text-secondary)'),
                        cursor: isInBattle ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    Problems
                </button>
            </div>
        </header>
    );
};

export default Header;
