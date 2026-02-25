import { getCurrentUser, logout, BASE_URL } from '../api';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Code2, Swords, TrendingUp, BookOpen, History, LogOut, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Book, Shield, Star, User, Zap, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewModal from './ReviewModal';

const Sidebar = ({ onShowProblemList, onGoDetail, user }) => {
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
                gap: collapsed ? '0' : '16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '12px 0' : '12px 20px',
                background: active ? 'rgba(34, 197, 110, 0.1)' : 'transparent',
                border: 'none',
                cursor: isInBattle ? 'not-allowed' : 'pointer',
                color: active ? 'var(--accent)' : 'rgba(255, 255, 255, 0.7)',
                fontSize: '13px',
                fontWeight: active ? 800 : 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                marginBottom: '4px',
                opacity: isInBattle ? 0.5 : 1,
                position: 'relative',
                overflow: 'hidden'
            }}
            title={collapsed ? label : ''}
            className="sidebar-nav-item"
        >
            {/* Active Indicator Bar */}
            {active && !collapsed && (
                <motion.div
                    layoutId="active-bar"
                    style={{
                        position: 'absolute',
                        left: 0,
                        width: '4px',
                        height: '24px',
                        background: 'var(--accent)',
                        borderRadius: '0 4px 4px 0',
                        boxShadow: '0 0 12px var(--accent)'
                    }}
                />
            )}

            {/* Active Background Pill (Collapsed) */}
            {active && collapsed && (
                <motion.div
                    layoutId="active-pill"
                    style={{
                        position: 'absolute',
                        inset: '6px 8px',
                        background: 'var(--accent)',
                        borderRadius: '12px',
                        zIndex: -1,
                    }}
                />
            )}

            <Icon
                size={collapsed ? 26 : 20}
                color={active ? (collapsed ? '#000' : 'var(--accent)') : (danger ? '#ef4444' : 'currentColor')}
                strokeWidth={active ? 2.5 : 2}
                style={{ transition: 'all 0.2s' }}
            />
            {!collapsed && <span>{label}</span>}
        </button>
    );

    return (
        <>
            <aside style={{
                width: collapsed ? '80px' : '260px',
                height: '100vh',
                background: '#0a0a0a',
                borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 0',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                flexShrink: 0,
                zIndex: 50,
            }}>
                {/* BRAND SECTION */}
                <div style={{
                    padding: collapsed ? '0' : '0 24px',
                    marginBottom: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: collapsed ? 'center' : 'flex-start',
                }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            cursor: 'pointer'
                        }}
                        onClick={() => !isInBattle && handleNav(onGoDetail)}
                    >
                        <div style={{
                            width: '42px',
                            height: '42px',
                            background: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '12px',
                            flexShrink: 0,
                            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.2)'
                        }}>
                            <Code2 size={26} color="black" strokeWidth={3} />
                        </div>
                        {!collapsed && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
                                    ALGO<span style={{ color: 'var(--accent)' }}>DUEL</span>
                                </span>
                                <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)', fontWeight: 800, marginTop: '2px', letterSpacing: '1px' }}>
                                    BETA v1.2.0
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* NAVIGATION */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 12px' }} className="custom-scroll">
                    {!collapsed && (
                        <div style={{
                            fontSize: '11px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.2)',
                            marginBottom: '12px', paddingLeft: '8px', textTransform: 'uppercase', letterSpacing: '1.5px'
                        }}>
                            Main Menu
                        </div>
                    )}

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

                    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', margin: '16px 8px' }} />

                    {!collapsed && (
                        <div style={{
                            fontSize: '11px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.2)',
                            marginBottom: '12px', paddingLeft: '8px', textTransform: 'uppercase', letterSpacing: '1.5px'
                        }}>
                            Support
                        </div>
                    )}

                    <NavItem
                        icon={Star}
                        label="Rate Platform"
                        active={false}
                        onClick={() => setIsReviewModalOpen(true)}
                    />

                    {user?.loggedIn && user.email === 'someshtiwari532@gmail.com' && (
                        <NavItem
                            icon={Shield}
                            label="Admin Hub"
                            active={location.pathname.includes('/admin')}
                            onClick={() => handleNav(() => navigate('/app/admin'))}
                            danger
                        />
                    )}
                </div>

                {/* USER PROFILE SECTION */}
                <div style={{ padding: '0 12px', marginTop: '16px' }}>
                    <div style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.03)',
                        justifyContent: collapsed ? 'center' : 'flex-start'
                    }}>
                        {user?.loggedIn ? (
                            <>
                                {user.photos ? (
                                    <img
                                        src={user.photos}
                                        alt={user.displayName}
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '10px',
                                            objectFit: 'cover',
                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '38px',
                                        height: '38px',
                                        background: 'var(--accent)',
                                        color: '#000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        fontWeight: 900,
                                        borderRadius: '10px'
                                    }}>
                                        {String(user.displayName?.[0] || 'U').toUpperCase()}
                                    </div>
                                )}
                                {!collapsed && (
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.displayName}
                                        </div>
                                        <button
                                            onClick={logout}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                padding: 0,
                                                color: 'rgba(255, 255, 255, 0.4)',
                                                fontSize: '10px',
                                                cursor: 'pointer',
                                                fontWeight: 800,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                marginTop: '2px'
                                            }}
                                        >
                                            Sign Out <LogOut size={10} />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={handleLogin}
                                style={{
                                    width: '100%',
                                    background: 'var(--accent)',
                                    color: '#000',
                                    border: 'none',
                                    padding: collapsed ? '10px 0' : '10px',
                                    borderRadius: '10px',
                                    fontSize: '12px',
                                    fontWeight: 900,
                                    cursor: 'pointer'
                                }}
                            >
                                {collapsed ? <User size={18} /> : 'LOGIN'}
                            </button>
                        )}
                    </div>
                </div>

                {/* SIDEBAR TOGGLE (STANDARD POSITION) */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        position: 'absolute',
                        right: '-14px',
                        top: '48px',
                        width: '28px',
                        height: '28px',
                        background: '#1a1a1a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 100,
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent)';
                        e.currentTarget.style.color = '#000';
                        e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1a1a1a';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                >
                    {collapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
                </button>
            </aside>

            {/* LOGIN POPUP MODAL */}
            {showLoginModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowLoginModal(false)}>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{
                            padding: '48px',
                            width: '420px',
                            textAlign: 'center',
                            background: '#121212',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '32px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{
                                width: '64px', height: '64px', background: 'var(--accent)',
                                borderRadius: '20px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 30px rgba(34, 197, 94, 0.3)'
                            }}>
                                <Swords size={32} color="#000" strokeWidth={2.5} />
                            </div>
                            <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: 900, color: '#fff' }}>Access Required</h2>
                            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, fontSize: '15px', lineHeight: '1.6' }}>
                                Sign in with Google to join the arena, view problem archives, and track your global performance.
                            </p>
                        </div>

                        <button
                            onClick={handleLogin}
                            style={{
                                width: '100%', padding: '16px', fontSize: '16px', fontWeight: 800,
                                background: 'var(--accent)', color: '#000', border: 'none',
                                borderRadius: '16px', cursor: 'pointer', transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Continue with Google
                        </button>

                        <button
                            onClick={() => setShowLoginModal(false)}
                            style={{
                                marginTop: '20px', background: 'transparent', border: 'none',
                                color: 'rgba(255, 255, 255, 0.3)', cursor: 'pointer', fontSize: '14px',
                                fontWeight: 700
                            }}
                        >
                            Dismiss
                        </button>
                    </motion.div>
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
