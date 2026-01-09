import { getCurrentUser, logout } from '../api';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Code2, Swords } from 'lucide-react'; // Assuming icons are from lucide-react based on usage

const Header = ({ onShowProblemList, onGoDetail }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentView = location.pathname.includes('/competition') ? 'competition' :
        location.pathname.includes('/problems') ? 'list' : 'lobby';

    // Disable navigation if in competition
    const isInBattle = currentView === 'competition';

    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            getCurrentUser().then(setUser).catch(() => setUser(null));
        }
    }, []);

    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleNav = (action) => {
        if (isInBattle) {
            alert("⚠️ You are in a battle! Use the 'Leave Room' button inside the sidebar to exit safely.");
            return;
        }

        // Auth Check
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        action();
    };

    const handleLogin = () => {
        window.location.href = 'http://localhost:3000/auth/google';
    };

    return (
        <>
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

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={user.photos} alt={user.displayName} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.displayName}</span>
                            <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
                        </div>
                    ) : (
                        <button onClick={handleLogin} style={{ background: 'var(--accent-green)', color: 'black', border: 'none', padding: '6px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                            Login with Google
                        </button>
                    )}

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)', margin: '0 8px' }}></div>

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

                    <button
                        onClick={() => handleNav(() => navigate('/app/history'))} // Protected Navigation
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: isInBattle ? 'var(--text-muted)' : 'var(--text-secondary)',
                            cursor: isInBattle ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        History
                    </button>
                </div>
            </header>

            {/* LOGIN POPUP MODAL */}
            {showLoginModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowLoginModal(false)}>

                    <div style={{
                        background: 'rgba(20, 20, 20, 0.9)',
                        border: '1px solid var(--border-subtle)',
                        padding: '40px',
                        borderRadius: '20px',
                        width: '400px',
                        textAlign: 'center',
                        position: 'relative',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }} onClick={e => e.stopPropagation()}>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                width: '60px', height: '60px', background: 'rgba(74, 222, 128, 0.1)',
                                borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Swords size={32} color="#4ade80" />
                            </div>
                            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 800 }}>Authentication Required</h2>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                You must sign in to enter the arena, view problems, or check your battle history.
                            </p>
                        </div>

                        <button
                            onClick={handleLogin}
                            style={{
                                background: 'var(--accent-green)',
                                color: 'black',
                                border: 'none',
                                padding: '14px',
                                width: '100%',
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '16px',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
                            onMouseUp={e => e.target.style.transform = 'scale(1)'}
                        >
                            Login with Google
                        </button>

                        <button
                            onClick={() => setShowLoginModal(false)}
                            style={{
                                marginTop: '15px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Cancel
                        </button>

                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
