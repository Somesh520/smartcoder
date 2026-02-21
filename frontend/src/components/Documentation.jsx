import React, { useState } from 'react';
import { Book, Code, Server, Route, Layers, Zap, ChevronDown, ChevronRight, Shield, Filter, Database, Cpu } from 'lucide-react';

const Documentation = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Book },
        { id: 'frontend', label: 'Frontend', icon: Code },
        { id: 'backend', label: 'Backend', icon: Server },
        { id: 'routes', label: 'Routes', icon: Route },
        { id: 'architecture', label: 'Architecture', icon: Layers },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#020202',
            color: '#e4e4e7',
            padding: '100px 20px 60px',
            fontFamily: "'Inter', sans-serif",
            position: 'relative'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '900',
                        marginBottom: '16px',
                        background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-1px'
                    }}>
                        SmartCoder Documentation
                    </h1>
                    <p style={{ fontSize: '18px', color: '#71717a', maxWidth: '600px', margin: '0 auto' }}>
                        Technical reference for the ultimate real-time competitive programming arena.
                    </p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '40px',
                    borderBottom: '1px solid #27272a',
                    overflowX: 'auto',
                    paddingBottom: '2px'
                }}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '14px 28px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: isActive ? '3px solid #a78bfa' : '3px solid transparent',
                                    color: isActive ? '#f4f4f5' : '#a1a1aa',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    whiteSpace: 'nowrap',
                                    opacity: isActive ? 1 : 0.8
                                }}
                            >
                                <Icon size={20} color={isActive ? '#a78bfa' : '#a1a1aa'} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div style={{
                    background: 'rgba(9, 9, 11, 0.8)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(167, 139, 250, 0.2)',
                    borderRadius: '24px',
                    padding: '48px',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.5), inset 0 0 40px rgba(167, 139, 250, 0.02)',
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

const SectionHeader = ({ title, isExpanded, onToggle, accentColor = '#a78bfa' }) => (
    <div
        onClick={onToggle}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            background: isExpanded ? 'rgba(167, 139, 250, 0.08)' : 'rgba(24, 24, 27, 0.4)',
            border: `1px solid ${isExpanded ? accentColor : 'rgba(167, 139, 250, 0.15)'}`,
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: isExpanded ? '16px' : '12px',
            transition: 'all 0.3s ease',
            opacity: 1
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '16px', borderRadius: '2px', background: accentColor }}></div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: isExpanded ? '#f4f4f5' : '#a1a1aa' }}>{title}</h3>
        </div>
        {isExpanded ? <ChevronDown size={22} color={accentColor} /> : <ChevronRight size={22} color="rgba(167, 139, 250, 0.4)" />}
    </div>
);

const TechItem = ({ name, version, purpose, color = '#a78bfa' }) => (
    <div style={{
        padding: '16px 20px',
        background: 'rgba(167, 139, 250, 0.02)',
        border: '1px solid rgba(167, 139, 250, 0.1)',
        borderLeft: `4px solid ${color}`,
        marginBottom: '10px',
        borderRadius: '10px',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(4px)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <code style={{
                color: color,
                fontSize: '15px',
                fontWeight: '800',
                fontFamily: 'monospace',
                background: `${color}10`,
                padding: '2px 8px',
                borderRadius: '4px'
            }}>
                {name}
            </code>
            {version && <span style={{ color: '#71717a', fontSize: '13px', fontWeight: 600 }}>v{version}</span>}
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#a1a1aa', lineHeight: '1.5' }}>{purpose}</p>
    </div>
);

const OverviewContent = () => (
    <div>
        <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '28px', color: '#f4f4f5', letterSpacing: '-0.5px' }}>Project Overview</h2>

        <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '22px', color: '#a78bfa', marginBottom: '16px', fontWeight: '800' }}>What is SmartCoder?</h3>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#a1a1aa' }}>
                SmartCoder is a <strong>high-performance real-time competitive programming platform</strong>. It enables developers to engage in 1v1 battle duels, solve curated LeetCode challenges, and sync their global statistics within a premium "Cyberpunk" aesthetic.
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
            <div style={{ background: 'rgba(167, 139, 250, 0.03)', padding: '28px', borderRadius: '16px', border: '1px solid rgba(167, 139, 250, 0.1)' }}>
                <h3 style={{ fontSize: '20px', color: '#a78bfa', marginBottom: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={20} /> Core Features
                </h3>
                <ul style={{ fontSize: '15px', lineHeight: '2.2', color: '#a1a1aa', paddingLeft: '20px', margin: 0 }}>
                    <li><strong>Real-time Code Sync</strong> - Monaco-powered editing</li>
                    <li><strong>Live 1v1 Duels</strong> - WebSocket matchmaking</li>
                    <li><strong>Smart Discovery</strong> - Difficulty & Topic filtering</li>
                    <li><strong>Admin Command Center</strong> - Live platform metrics</li>
                    <li><strong>LeetCode Synergy</strong> - Profile & Stats integration</li>
                    <li><strong>Multi-Engine</strong> - Support for multiple languages</li>
                </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '24px', background: 'rgba(24, 24, 27, 0.6)', border: '1px solid rgba(167, 139, 250, 0.15)', borderRadius: '16px' }}>
                    <h4 style={{ color: '#f4f4f5', marginBottom: '12px', fontWeight: '800' }}>Platform Health</h4>
                    <p style={{ fontSize: '14px', color: '#a1a1aa', margin: 0 }}>
                        Powered by Node.js 20 LTS and MongoDB Atlas for maximum uptime and scalability.
                    </p>
                </div>
                <div style={{ padding: '24px', background: 'rgba(24, 24, 27, 0.6)', border: '1px solid rgba(167, 139, 250, 0.15)', borderRadius: '16px' }}>
                    <h4 style={{ color: '#f4f4f5', marginBottom: '12px', fontWeight: '800' }}>Global Reach</h4>
                    <p style={{ fontSize: '14px', color: '#a1a1aa', margin: 0 }}>
                        Integrated with Judge0 for high-speed, secure remote code execution.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const FrontendContent = ({ expandedSections, toggleSection }) => (
    <div>
        <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '28px', color: '#f4f4f5' }}>Frontend Engine</h2>

        <SectionHeader title="Core Ecosystem" isExpanded={expandedSections.frontendCore} onToggle={() => toggleSection('frontendCore')} />
        {expandedSections.frontendCore && (
            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                <TechItem name="React" version="19.2.0" purpose="Modern UI library with Concurrent Mode for fluid user interactions." />
                <TechItem name="Vite" version="7.2.4" purpose="Next-gen build tool providing instantaneous Hot Module Replacement." />
                <TechItem name="Framer Motion" version="12.27.2" purpose="Production-ready animation engine for premium transitions." />
            </div>
        )}

        <SectionHeader title="Workspace & Editor" isExpanded={expandedSections.frontendEditor} onToggle={() => toggleSection('frontendEditor')} />
        {expandedSections.frontendEditor && (
            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                <TechItem name="Monaco Editor" version="4.7.0" purpose="The core of the battle workspace, providing VS Code-level editing." />
                <TechItem name="Prismjs" version="1.30.0" purpose="Lightweight syntax highlighting for diverse language support." />
                <TechItem name="React Markdown" version="10.1.0" purpose="Rendering complex LeetCode problem descriptions securely." />
                <TechItem name="Code Editor" version="0.14.1" purpose="Simple fallback editor for low-bandwidth environments." />
            </div>
        )}

        <SectionHeader title="Real-time & Network" isExpanded={expandedSections.frontendData} onToggle={() => toggleSection('frontendData')} />
        {expandedSections.frontendData && (
            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                <TechItem name="Socket.io-client" version="4.8.3" purpose="Handles low-latency battle state and lobby notifications." />
                <TechItem name="Axios" version="1.13.2" purpose="Enterprise-grade HTTP client for authenticated API requests." />
                <TechItem name="React Router" version="7.11.0" purpose="Client-side routing with deep-link support for battle rooms." />
            </div>
        )}

        <SectionHeader title="Graphics & Effects" isExpanded={expandedSections.frontendUI} onToggle={() => toggleSection('frontendUI')} />
        {expandedSections.frontendUI && (
            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                <TechItem name="Three.js" version="0.182.0" purpose="The base 3D engine for premium visual effects." />
                <TechItem name="@react-three/fiber" version="9.4.2" purpose="React bridge for high-performance 3D rendering." />
                <TechItem name="Post-Processing" version="3.0.4" purpose="Bloom, Glitch, and CRT effects for the Cyberpunk UI." />
                <TechItem name="Lucide Icons" version="0.562.0" purpose="Consistent and scalable vector iconography." />
                <TechItem name="Canvas Confetti" version="1.9.4" purpose="Optimized celebration particles for victory states." />
                <TechItem name="React Helmet" version="2.0.5" purpose="Dynamic SEO and metadata management per route." />
            </div>
        )}
    </div>
);

const BackendContent = ({ expandedSections, toggleSection }) => (
    <div>
        <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '28px', color: '#f4f4f5' }}>Backend Infrastructure</h2>

        <SectionHeader title="Server Core" isExpanded={expandedSections.backendCore} onToggle={() => toggleSection('backendCore')} />
        {expandedSections.backendCore && (
            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                <TechItem name="Node.js" version="20.19.6" purpose="The foundation of the real-time non-blocking architecture." />
                <TechItem name="Express" version="5.2.1" purpose="High-performance web framework for the API layer." />
                <TechItem name="Socket.io" version="4.8.3" purpose="Broadcast engine for multi-user synchronization." />
                <TechItem name="Compression" version="1.8.1" purpose="Gzip optimization for faster JSON payload delivery." />
                <TechItem name="CORS" version="2.8.5" purpose="Secure Cross-Origin Resource Sharing for the frontend." />
            </div>
        )}

        <SectionHeader title="Database & Persistence" isExpanded={expandedSections.backendDB} onToggle={() => toggleSection('backendDB')} />
        {expandedSections.backendDB && (
            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                <TechItem name="MongoDB Atlas" version="Cloud" purpose="Primary persistent storage for users, matches, and logs." />
                <TechItem name="Mongoose" version="9.1.2" purpose="Dynamic ODM with field-level schema validation. " />
                <TechItem name="Redis" version="5.10.0" purpose="Flash-memory storage for session caching and lobby states." />
                <TechItem name="Connect Redis" version="9.0.0" purpose="External session store for high-availability deployments." />
            </div>
        )}

        <SectionHeader title="Security Layer" isExpanded={expandedSections.backendAuth} onToggle={() => toggleSection('backendAuth')} />
        {expandedSections.backendAuth && (
            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                <TechItem name="JWT" version="9.0.3" purpose="Encrypted tokens for stateless session management." />
                <TechItem name="Passport.js" version="0.7.0" purpose="Authenticator for Google and GitHub OAuth flows." />
                <TechItem name="Helmet" version="8.1.0" purpose="Directly hardens Express against well-known web vulnerabilities." />
                <TechItem name="Rate Limit" version="8.2.1" purpose="DDoS protection at the API endpoint level." />
                <TechItem name="Dotenv" version="17.2.3" purpose="Zero-dependency secret management for production keys." />
            </div>
        )}

        <SectionHeader title="Intelligence & Execution" isExpanded={expandedSections.backendAI} onToggle={() => toggleSection('backendAI')} />
        {expandedSections.backendAI && (
            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                <TechItem name="Google GenAI" version="0.24.1" purpose="Powers the intelligent hint system and code reviews." />
                <TechItem name="Groq SDK" version="0.37.0" purpose="Ultra-fast LPU inference for real-time AI agents." />
                <TechItem name="LangChain" version="1.2.13" purpose="Orchestration for complex LLM reasoning chains." />
                <TechItem name="Judge0 API" version="External" purpose="The sandboxed remote code execution engine." />
                <TechItem name="LeetCode SDK" version="2.0.1" purpose="Native query bridge for LeetCode profile syncing." />
            </div>
        )}
    </div>
);

const RoutesContent = () => (
    <div>
        <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '28px', color: '#f4f4f5' }}>Page Registry</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            <RouteItem path="/" component="Landing" type="Public" description="The gateway to the arena: features, aesthetics, and onboarding." />
            <RouteItem path="/app" component="Dashboard" type="Secure" description="Main problem discovery hub with advanced filtering." />
            <RouteItem path="/app/battle/:roomId" component="Arena" type="Secure" description="The real-time workspace for 1v1 competitive coding." />
            <RouteItem path="/app/lobby/:roomId" component="Lobby" type="Secure" description="Matchmaking zone for setting up competitive parameters." />
            <RouteItem path="/app/admin" component="CommandCenter" type="Admin" description="The core moderation hub for stats and user management." />
            <RouteItem path="/app/learn" component="Learn" type="Public" description="AI-powered hints and algorithmic tutorials." />
            <RouteItem path="/app/history" component="Logs" type="Secure" description="Complete archive of all past battles and Elo changes." />
            <RouteItem path="/app/profile" component="Profile" type="Secure" description="Personal performance metrics and tier status." />
        </div>
    </div>
);

const RouteItem = ({ path, component, type, description }) => (
    <div style={{
        padding: '24px',
        background: 'rgba(24, 24, 27, 0.6)',
        border: '1px solid rgba(167, 139, 250, 0.15)',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        cursor: 'default'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <code style={{ color: '#a78bfa', fontSize: '15px', fontWeight: '800' }}>{path}</code>
            <span style={{
                fontSize: '11px',
                background: type === 'Admin' ? '#ef4444' : type === 'Secure' ? '#3b82f6' : '#22c55e',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: '900'
            }}>
                {type}
            </span>
        </div>
        <div style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>Component: <span style={{ color: '#e4e4e7' }}>{component}</span></div>
        <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa', lineHeight: '1.6' }}>{description}</p>
    </div>
);

const ArchitectureContent = () => (
    <div>
        <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '28px', color: '#f4f4f5' }}>System Integrity</h2>

        <div style={{ display: 'grid', gap: '32px' }}>
            <div style={{ background: 'rgba(24, 24, 27, 0.6)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(167, 139, 250, 0.15)' }}>
                <h3 style={{ fontSize: '20px', color: '#a78bfa', marginBottom: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shield size={22} /> Multi-Layer Moderation
                </h3>
                <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: '1.8' }}>
                    SmartCoder uses an **integrated moderation hub** called the Command Center. Admins can manage user credits, toggle premium status, and monitor live activity logs. All administrative routes are protected by JWT verification and server-side role checks.
                </p>
            </div>

            <div style={{ background: 'rgba(24, 24, 27, 0.6)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(167, 139, 250, 0.15)' }}>
                <h3 style={{ fontSize: '20px', color: '#a78bfa', marginBottom: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Filter size={22} /> Intelligent Content Discovery
                </h3>
                <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: '1.8' }}>
                    The Problem Arena implements a **global filtering engine**. It automatically hides paid/premium LeetCode content for free users and provides multi-field indexing (Slug, Title, ID) to ensure that users always find available challenges.
                </p>
            </div>

            <div style={{ background: 'rgba(24, 24, 27, 0.6)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(167, 139, 250, 0.15)' }}>
                <h3 style={{ fontSize: '20px', color: '#a78bfa', marginBottom: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Cpu size={22} /> Real-time Sync Engine
                </h3>
                <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: '1.8' }}>
                    Built on Socket.IO 4.x, the sync engine uses isolated namespaces for different rooms. Code changes are debounced at 150ms to maintain editor performance while ensuring near-instant visibility for opponents.
                </p>
            </div>
        </div>
    </div>
);

export default Documentation;
