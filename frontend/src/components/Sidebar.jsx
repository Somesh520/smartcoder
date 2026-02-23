import { getCurrentUser, logout, BASE_URL } from '../api';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Code2, Swords, TrendingUp, BookOpen, History, LogOut, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Book, Shield, Star, User, Zap, Sun, Moon } from 'lucide-react';
import ReviewModal from './ReviewModal';

const Sidebar = ({ onShowProblemList, onGoDetail, user, theme, toggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentView = location.pathname.includes('/competition') ? 'competition' :
        location.pathname.includes('/problems') ? 'list' : 'lobby';

    const isInBattle = currentView === 'competition';
    const [collapsed, setCollapsed] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const handleNav = (action) => {
        if (isInBattle) {
            alert("⚠️ You are in a battle! Use the 'Leave Room' button inside the sidebar to exit safely.");
            return;
        }

        if (!user?.loggedIn) {
            setShowLoginModal(true);
            return;
        }

        action();
    };

    const handleLogin = () => {
        const returnTo = encodeURIComponent(window.location.origin);
        window.location.href = `${BASE_URL}/auth/google?return_to=${returnTo}`;
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
                padding: '14px 16px',
                background: active ? 'var(--accent)' : 'transparent',
                border: active ? 'var(--border-main)' : '2px solid transparent',
                boxShadow: active ? 'var(--shadow-main)' : 'none',
                cursor: isInBattle ? 'not-allowed' : 'pointer',
                color: active ? '#000' : 'var(--text-main)',
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                transition: 'all 0.1s',
                marginBottom: '8px',
                opacity: isInBattle ? 0.5 : 1
            }}
            title={collapsed ? label : ''}
        >
            <Icon size={24} color={danger ? '#ef4444' : (active ? '#000' : 'currentColor')} strokeWidth={active ? 3 : 2} />
            {!collapsed && <span>{label}</span>}
        </button>
    );

    return (
        <>
            <aside style={{
                width: collapsed ? '80px' : '260px',
                height: '100vh',
                background: 'var(--sidebar-bg)',
                borderRight: 'var(--border-main)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
                transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                flexShrink: 0,
                zIndex: 50,
                overflow: 'visible'
            }}>
                {/* BRAND & TOGGLE */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '48px', paddingLeft: collapsed ? '4px' : '8px'
                }}>
                    <div
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            cursor: 'pointer'
                        }}
                        onClick={() => !isInBattle && handleNav(onGoDetail)}
                    >
                        <div style={{
                            width: '48px', height: '48px',
                            background: 'var(--accent)', border: 'var(--border-main)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: theme === 'light' ? '4px 4px 0px #000' : 'none',
                        }}>
                            <Code2 size={32} color="black" strokeWidth={3} />
                        </div>
                        {!collapsed && (
                            <span style={{ fontSize: '24px', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-1.5px', textTransform: 'uppercase' }}>
                                ALGODUEL
                            </span>
                        )}
                    </div>
                </div>

                {/* NAVIGATION */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="custom-scroll">
                    <div style={{
                        fontSize: '12px', fontWeight: 900, color: 'var(--text-muted)',
                        marginBottom: '16px', paddingLeft: '8px', textTransform: 'uppercase', letterSpacing: '1px',
                        display: collapsed ? 'none' : 'block'
                    }}>
                        MENU_BLOCK
                    </div>

                    <NavItem
                        icon={Swords}
                        label="Lobby"
                        active={!location.pathname.includes('/stats') && !location.pathname.includes('/problems') && !location.pathname.includes('/learn') && !location.pathname.includes('/history') && !location.pathname.includes('/docs') && !location.pathname.includes('/admin')}
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
                        onClick={() => handleNav(() => navigate('/app/docs'))}
                    />

                    <div style={{ height: '1px', background: 'var(--border-main)', margin: '16px 8px', opacity: 0.2 }} />

                    <NavItem
                        icon={Star}
                        label="Rate"
                        active={false}
                        onClick={() => setIsReviewModalOpen(true)}
                    />

                    {user?.loggedIn && user.email === 'someshtiwari532@gmail.com' && (
                        <NavItem
                            icon={Shield}
                            label="Admin"
                            active={location.pathname.includes('/admin')}
                            onClick={() => handleNav(() => navigate('/app/admin'))}
                            danger
                        />
                    )}
                </div>

                {/* THEME TOGGLE & USER PROFILE */}
                <div style={{ paddingTop: '16px', borderTop: 'var(--border-main)' }}>
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="neo-btn"
                        style={{
                            width: '100%',
                            marginBottom: '16px',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            background: theme === 'light' ? 'var(--accent)' : 'var(--bg-card)',
                            boxShadow: theme === 'light' ? 'var(--shadow-main)' : 'none',
                        }}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        {!collapsed && <span>{theme === 'light' ? 'DARK_MODE' : 'LIGHT_MODE'}</span>}
                    </button>

                    {user?.loggedIn ? (
                        <div className="neo-card" style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px', background: 'var(--bg-card)'
                        }}>
                            <img
                                src={user.photos}
                                alt={user.displayName}
                                style={{ width: '44px', height: '44px', border: 'var(--border-main)', boxShadow: 'var(--shadow-main)' }}
                            />
                            {!collapsed && (
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'uppercase' }}>
                                        {user.displayName}
                                    </div>
                                    <button
                                        onClick={logout}
                                        style={{
                                            background: 'transparent', border: 'none',
                                            padding: 0, color: '#ef4444', fontSize: '10px',
                                            cursor: 'pointer', fontWeight: 800, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase'
                                        }}
                                    >
                                        [ LOGOUT ]
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="neo-btn"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {!collapsed ? 'LOGIN' : <Code2 size={20} />}
                        </button>
                    )}
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        position: 'absolute', top: '50%', right: '-16px',
                        width: '32px', height: '32px', background: 'var(--accent)',
                        border: 'var(--border-main)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#000', cursor: 'pointer', zIndex: 60,
                        boxShadow: theme === 'light' ? '2px 2px 0px #000' : 'none',
                    }}
                >
                    {collapsed ? <ChevronRight size={18} strokeWidth={3} /> : <ChevronLeft size={18} strokeWidth={3} />}
                </button>
            </aside>

            {/* LOGIN POPUP MODAL */}
            {showLoginModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowLoginModal(false)}>

                    <div className="neo-card" style={{
                        padding: '48px',
                        width: '420px',
                        textAlign: 'center',
                        position: 'relative',
                        background: 'var(--bg-card)'
                    }} onClick={e => e.stopPropagation()}>

                        <div style={{ marginBottom: '32px' }}>
                            <div style={{
                                width: '64px', height: '64px', background: 'var(--accent)',
                                border: 'var(--border-main)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: theme === 'light' ? '4px 4px 0px #000' : 'none'
                            }}>
                                <Swords size={32} color="#000" strokeWidth={3} />
                            </div>
                            <h2 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: 950, textTransform: 'uppercase', color: 'var(--text-main)' }}>AUTH_REQUIRED</h2>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: '700', lineHeight: '1.5' }}>
                                YOU MUST SIGN IN TO ENTER THE ARENA, VIEW PROBLEMS, OR CHECK HISTORY.
                            </p>
                        </div>

                        <button
                            onClick={handleLogin}
                            className="neo-btn"
                            style={{ width: '100%', padding: '16px', fontSize: '18px', justifyContent: 'center' }}
                        >
                            LOGIN WITH GOOGLE
                        </button>

                        <button
                            onClick={() => setShowLoginModal(false)}
                            style={{
                                marginTop: '20px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '800',
                                textDecoration: 'underline'
                            }}
                        >
                            CANCEL
                        </button>
                    </div>
                </div>
            )}

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                userInfo={user || {}}
                onReviewSubmitted={() => {
                    alert("Thanks for your review! It's now live on the landing page.");
                }}
            />
        </>
    );
};

export default Sidebar;
