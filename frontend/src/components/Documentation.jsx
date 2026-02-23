import React, { useState } from 'react';
import { Book, Code, Server, Route, Layers, Zap, ChevronDown, ChevronRight, Shield, Filter, Database, Cpu } from 'lucide-react';

const Documentation = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const tabs = [
        { id: 'overview', label: 'OVERVIEW', icon: Book },
        { id: 'frontend', label: 'FRONTEND', icon: Code },
        { id: 'backend', label: 'BACKEND', icon: Server },
        { id: 'routes', label: 'ROUTES', icon: Route },
        { id: 'architecture', label: 'SYSTEM', icon: Layers },
    ];

    return (
        <div className="dot-bg" style={{
            minHeight: '100vh',
            color: '#000',
            padding: '120px 24px 80px',
            fontFamily: "'Inter', sans-serif",
            position: 'relative'
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '64px', position: 'relative' }}>
                    <div style={{ display: 'inline-block', background: 'var(--neo-yellow)', border: 'var(--neo-border)', padding: '4px 12px', marginBottom: '16px', fontWeight: '900' }}>
                        SMARTCODER v1.2.0
                    </div>
                    <h1 style={{
                        fontSize: '72px',
                        fontWeight: '950',
                        lineHeight: '0.9',
                        marginBottom: '24px',
                        textTransform: 'uppercase',
                        letterSpacing: '-2px'
                    }}>
                        DOCS <span style={{ background: 'var(--neo-yellow)', padding: '0 12px', border: 'var(--neo-border)', boxShadow: '6px 6px 0px #000' }}>EXCHANGE</span>
                    </h1>
                    <p style={{ fontSize: '20px', fontWeight: '700', color: '#333', maxWidth: '600px', textTransform: 'uppercase' }}>
                        Share your path. Steal their knowledge. Modern engineering reference.
                    </p>
                </div>

                {/* Status Bar */}
                <div className="neo-card" style={{ padding: '12px 24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', color: '#22c55e' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'monospace' }}>
                        [ AUTH_MODE: SOCIAL_FORKING ]
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'monospace', textAlign: 'right' }}>
                        NET_CONNECT: ESTABLISHED<br />
                        DRIVES_READY: 5
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '32px',
                    overflowX: 'auto',
                    paddingBottom: '12px'
                }}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="neo-btn"
                                style={{
                                    background: isActive ? 'var(--neo-yellow)' : '#fff',
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Icon size={20} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="neo-card" style={{
                    padding: '60px',
                    minHeight: '600px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {activeTab === 'overview' && <OverviewContent />}
                    {activeTab === 'frontend' && <FrontendContent expandedSections={expandedSections} toggleSection={toggleSection} />}
                    {activeTab === 'backend' && <BackendContent expandedSections={expandedSections} toggleSection={toggleSection} />}
                    {activeTab === 'routes' && <RoutesContent />}
                    {activeTab === 'architecture' && <ArchitectureContent />}
                </div>
            </div>
        </div>
    );
};

const SectionHeader = ({ title, isExpanded, onToggle }) => (
    <div
        onClick={onToggle}
        className="neo-card"
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 28px',
            background: isExpanded ? 'var(--neo-yellow)' : '#fff',
            cursor: 'pointer',
            marginBottom: isExpanded ? '20px' : '12px',
            boxShadow: isExpanded ? '6px 6px 0px #000' : 'var(--neo-shadow)'
        }}
    >
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>{title}</h3>
        {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
    </div>
);

const TechItem = ({ name, version, purpose }) => (
    <div className="neo-card" style={{
        padding: '24px',
        marginBottom: '16px',
        background: '#fff'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ background: '#000', color: '#fff', padding: '4px 12px', fontWeight: '900', fontSize: '14px' }}>
                {name.toUpperCase()}
            </div>
            {version && <span style={{ fontWeight: '800', fontSize: '14px' }}>v{version}</span>}
        </div>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#444', lineHeight: '1.5' }}>{purpose}</p>
    </div>
);

const OverviewContent = () => (
    <div>
        <h2 style={{ fontSize: '48px', fontWeight: '950', marginBottom: '32px', textTransform: 'uppercase' }}>Project Overview</h2>

        <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '20px', lineHeight: '1.6', fontWeight: '700' }}>
                SmartCoder is a <span style={{ background: 'var(--neo-yellow)' }}>high-performance real-time competitive programming platform</span>. Engage in 1v1 battle duels, solve curated challenges, and sync stats within a brutalist aesthetic.
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
            <div className="neo-card" style={{ padding: '32px', background: '#fff' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '24px', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Zap size={24} /> CORE_FEATURES
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                        'Real-time Code Sync', 'Live 1v1 Duels', 'Smart Discovery', 'Admin CommandCenter', 'LeetCode Synergy', 'Multi-Engine Execution'
                    ].map(feature => (
                        <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--neo-yellow)', border: '2px solid #000' }}></div>
                            {feature.toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="neo-card" style={{ padding: '24px', background: 'var(--neo-yellow)' }}>
                    <h4 style={{ marginBottom: '12px', fontWeight: '900' }}>SYSTEM HEALTH</h4>
                    <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>
                        POWERED BY NODE.JS 20 LTS & MONGODB ATLAS.
                    </p>
                </div>
                <div className="neo-card" style={{ padding: '24px', background: '#000', color: '#fff' }}>
                    <h4 style={{ marginBottom: '12px', fontWeight: '900' }}>GLOBAL EXECUTION</h4>
                    <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>
                        INTEGRATED WITH JUDGE0 CLUSTER.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const FrontendContent = ({ expandedSections, toggleSection }) => (
    <div>
        <h2 style={{ fontSize: '48px', fontWeight: '950', marginBottom: '32px', textTransform: 'uppercase' }}>Frontend Engine</h2>

        <SectionHeader title="Core Ecosystem" isExpanded={expandedSections.frontendCore} onToggle={() => toggleSection('frontendCore')} />
        {expandedSections.frontendCore && (
            <div style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <TechItem name="React" version="19.2.0" purpose="Modern UI library with Concurrent Mode for fluid user interactions." />
                <TechItem name="Vite" version="7.2.4" purpose="Next-gen build tool providing instantaneous Hot Module Replacement." />
                <TechItem name="Framer Motion" version="12.27.2" purpose="Production-ready animation engine for premium transitions." />
            </div>
        )}

        <SectionHeader title="Workspace & Editor" isExpanded={expandedSections.frontendEditor} onToggle={() => toggleSection('frontendEditor')} />
        {expandedSections.frontendEditor && (
            <div style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <TechItem name="Monaco Editor" version="4.7.0" purpose="The core of the battle workspace, providing VS Code-level editing." />
                <TechItem name="Prismjs" version="1.30.0" purpose="Lightweight syntax highlighting for diverse language support." />
                <TechItem name="React Markdown" version="10.1.0" purpose="Rendering complex LeetCode problem descriptions securely." />
            </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="neo-btn" style={{ margin: '0 auto' }}>VIEW FULL TECH STACK</button>
        </div>
    </div>
);

const BackendContent = ({ expandedSections, toggleSection }) => (
    <div>
        <h2 style={{ fontSize: '48px', fontWeight: '950', marginBottom: '32px', textTransform: 'uppercase' }}>Backend Infra</h2>

        <SectionHeader title="Server Core" isExpanded={expandedSections.backendCore} onToggle={() => toggleSection('backendCore')} />
        {expandedSections.backendCore && (
            <div style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <TechItem name="Node.js" version="20.19.6" purpose="The foundation of the real-time non-blocking architecture." />
                <TechItem name="Express" version="5.2.1" purpose="High-performance web framework for the API layer." />
                <TechItem name="Socket.io" version="4.8.3" purpose="Broadcast engine for multi-user synchronization." />
            </div>
        )}

        <SectionHeader title="Security Layer" isExpanded={expandedSections.backendAuth} onToggle={() => toggleSection('backendAuth')} />
        {expandedSections.backendAuth && (
            <div style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <TechItem name="JWT" version="9.0.3" purpose="Encrypted tokens for stateless session management." />
                <TechItem name="Passport.js" version="0.7.0" purpose="Authenticator for Google and GitHub OAuth flows." />
                <TechItem name="Helmet" version="8.1.0" purpose="Directly hardens Express against web vulnerabilities." />
            </div>
        )}
    </div>
);

const RoutesContent = () => (
    <div>
        <h2 style={{ fontSize: '48px', fontWeight: '950', marginBottom: '32px', textTransform: 'uppercase' }}>Page Registry</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <RouteItem path="/" component="LANDING" type="PUBLIC" description="The gateway to the arena: features, aesthetics, and onboarding." />
            <RouteItem path="/app" component="DASHBOARD" type="SECURE" description="Main problem discovery hub with advanced filtering." />
            <RouteItem path="/app/battle/:roomId" component="ARENA" type="SECURE" description="The real-time workspace for 1v1 competitive coding." />
            <RouteItem path="/app/admin" component="COMMAND" type="ADMIN" description="The core moderation hub for stats and user management." />
        </div>
    </div>
);

const RouteItem = ({ path, component, type, description }) => (
    <div className="neo-card" style={{
        padding: '24px',
        background: '#fff'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <code style={{ background: 'var(--neo-yellow)', padding: '2px 8px', border: '2px solid #000', fontSize: '14px', fontWeight: '900' }}>{path}</code>
            <span className="neo-badge" style={{
                background: type === 'ADMIN' ? '#ef4444' : type === 'SECURE' ? '#3b82f6' : '#22c55e',
            }}>
                {type}
            </span>
        </div>
        <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '8px', opacity: 0.6 }}>COMPONENT: {component}</div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', lineHeight: '1.4' }}>{description}</p>
    </div>
);

const ArchitectureContent = () => (
    <div>
        <h2 style={{ fontSize: '48px', fontWeight: '950', marginBottom: '32px', textTransform: 'uppercase' }}>System Integrity</h2>

        <div style={{ display: 'grid', gap: '24px' }}>
            {[
                { icon: Shield, title: 'Multi-Layer Moderation', text: 'SmartCoder uses an integrated moderation hub called the Command Center. Admins manage user credits and monitor activity logs. Protected by JWT.' },
                { icon: Filter, title: 'Intelligent Discovery', text: 'Global filtering engine. Hides paid content for free users. Multi-field indexing (Slug, Title, ID) for fast retrieval.' },
                { icon: Cpu, title: 'Real-time Sync Engine', text: 'Socket.IO 4.x powered. Isolated namespaces per room. Debounced sync maintains performance.' }
            ].map(item => (
                <div key={item.title} className="neo-card" style={{ padding: '32px', background: '#fff' }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <item.icon size={28} /> {item.title}
                    </h3>
                    <p style={{ fontSize: '16px', fontWeight: '700', lineHeight: '1.6', color: '#333' }}>
                        {item.text}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

export default Documentation;
