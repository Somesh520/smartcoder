import { getCurrentUser, logout, BASE_URL } from '../api';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Code2, Swords, TrendingUp, BookOpen, History, LogOut, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Book } from 'lucide-react';

const Sidebar = ({ onShowProblemList, onGoDetail }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentView = location.pathname.includes('/competition') ? 'competition' :
        location.pathname.includes('/problems') ? 'list' : 'lobby';

    // Disable navigation if in competition
    const isInBattle = currentView === 'competition';

    const [user, setUser] = useState(null);
    const [collapsed, setCollapsed] = useState(false);

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
        window.location.href = `${BASE_URL}/auth/google`;
    };

    const NavItem = ({ icon: Icon, label, active, onClick, danger = false }) => (
        <button
            onClick={onClick}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? '0' : '12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: '12px 16px',
                background: active ? 'var(--bg-hover)' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                cursor: isInBattle ? 'not-allowed' : 'pointer',
                color: danger ? '#ef4444' : (active ? 'white' : 'var(--text-secondary)'),
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s',
                marginBottom: '4px',
                opacity: isInBattle ? 0.5 : 1
            }}
            title={collapsed ? label : ''}
        >
            <Icon size={20} color={danger ? '#ef4444' : (active ? '#fff' : 'currentColor')} />
            {!collapsed && <span>{label}</span>}
        </button>
    );

    return (
        <>
            <aside style={{
                width: collapsed ? '80px' : '260px',
                height: '100vh',
                background: '#09090b', // Darker background for sidebar
                borderRight: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                flexShrink: 0,
                zIndex: 50,
                overflow: 'visible' // Ensure toggle button isn't clipped
            }}>
                {/* BRAND & TOGGLE */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '40px', paddingLeft: collapsed ? '4px' : '8px'
                }}>
                    <div
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            cursor: 'pointer'
                        }}
                        onClick={() => !InBattle && handleNav(onGoDetail)}
                    >
                        <div style={{
                            width: '36px', height: '36px',
                            background: 'var(--accent-green)', borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 0 15px rgba(74, 222, 128, 0.3)',
                            transition: 'all 0.3s'
                        }}>
                            <Code2 size={20} color="black" strokeWidth={2.5} />
                        </div>
                        {!collapsed && (
                            <span style={{ fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px', whiteSpace: 'nowrap', opacity: 1, transition: 'opacity 0.2s' }}>
                                AlgoDuel
                            </span>
                        )}
                    </div>

                    {/* Header Toggle (Visible only when expanded for cleaner look, or always?) */}
                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            style={{
                                background: 'transparent', border: 'none', color: '#52525b',
                                cursor: 'pointer', padding: '4px', display: 'flex'
                            }}
                        >
                            <PanelLeftClose size={20} />
                        </button>
                    )}
                </div>

                {/* NAVIGATION */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '11px', fontWeight: 700, color: '#52525b',
                        marginBottom: '10px', paddingLeft: '16px', textTransform: 'uppercase', letterSpacing: '1px',
                        display: collapsed ? 'none' : 'block'
                    }}>
                        Menu
                    </div>

                    <NavItem
                        icon={Swords}
                        label="Lobby"
                        active={!location.pathname.includes('/stats') && !location.pathname.includes('/problems') && !location.pathname.includes('/learn') && !location.pathname.includes('/history')}
                        onClick={() => handleNav(onGoDetail)}
                    />
                    <NavItem
                        icon={TrendingUp}
                        label="Stats"
                        active={location.pathname.includes('/stats')}
                        onClick={() => handleNav(() => navigate('/app/stats'))}
                    />
                    <NavItem
                        icon={Code2}
                        label="Problems"
                        active={currentView === 'list'}
                        onClick={() => handleNav(onShowProblemList)}
                    />
                    <NavItem
                        icon={BookOpen}
                        label="Learn"
                        active={location.pathname.includes('/learn')}
                        onClick={() => handleNav(() => navigate('/app/learn'))}
                    />
                    <NavItem
                        icon={History}
                        label="History"
                        active={location.pathname.includes('/history')}
                        onClick={() => handleNav(() => navigate('/app/history'))}
                    />
                    <NavItem
                        icon={Book}
                        label="Docs"
                        active={location.pathname.includes('/docs')}
                        onClick={() => window.open('/docs', '_blank')}
                    />
                </div>

                {/* USER PROFILE / LOGOUT */}
                <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
                    {user ? (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px', borderRadius: '12px', background: 'var(--bg-subtle)'
                        }}>
                            <img
                                src={user.photos}
                                alt={user.displayName}
                                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #27272a' }}
                            />
                            {!collapsed && (
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user.displayName}
                                    </div>
                                    <button
                                        onClick={logout}
                                        style={{
                                            background: 'transparent', border: 'none',
                                            padding: 0, color: '#ef4444', fontSize: '12px',
                                            cursor: 'pointer', fontWeight: 500, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        <LogOut size={12} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            style={{
                                width: '100%', background: 'var(--accent-green)',
                                color: 'black', border: 'none', padding: '12px',
                                borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            {!collapsed ? 'Login with Google' : <Code2 size={20} />}
                        </button>
                    )}
                </div>

                {/* Collapse Toggle (Sidebar Edge) */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="sidebar-toggle"
                    style={{
                        position: 'absolute', top: '50%', right: '-12px',
                        width: '24px', height: '24px', background: '#18181b',
                        border: '1px solid var(--border-subtle)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#a1a1aa', cursor: 'pointer', zIndex: 60,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = '#71717a';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = '#a1a1aa';
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside>


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

export default Sidebar;
