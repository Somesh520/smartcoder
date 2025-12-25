import React from 'react';
import { Code2, Swords } from 'lucide-react';

const Header = ({ onShowProblemList, onGoDetail, currentView }) => {
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
        <header style={{
            height: '60px',
            background: '#18181b',
            borderBottom: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            padding: '0 25px',
            justifyContent: 'space-between'
        }}>
            <div
                className="brand"
                style={{ fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', cursor: isInBattle ? 'not-allowed' : 'pointer', opacity: isInBattle ? 0.7 : 1 }}
                onClick={() => handleNav(onGoDetail)}
            >
                <Code2 size={24} color="#eab308" />
                <span>LeetCode <span style={{ color: '#a1a1aa', fontWeight: 400 }}>Battle</span></span>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
                <button
                    onClick={() => handleNav(onGoDetail)}
                    style={{
                        background: 'transparent',
                        border: '1px solid #3f3f46',
                        color: isInBattle ? '#52525b' : 'white',
                        cursor: isInBattle ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 500,
                        transition: 'background 0.2s'
                    }}
                >
                    <Swords size={16} color={isInBattle ? '#52525b' : '#4ade80'} />
                    Multiplayer Lobby
                </button>

                <button
                    onClick={() => handleNav(onShowProblemList)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: isInBattle ? '#52525b' : '#a1a1aa',
                        cursor: isInBattle ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        padding: '8px 16px',
                        fontWeight: 500
                    }}
                >
                    Problem List
                </button>
            </div>
        </header>
    );
};

export default Header;
