import React, { useState } from 'react';
import { Book, Code, Server, Route, Layers, Zap, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

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
            background: '#0a0a0a',
            color: 'white',
            padding: '80px 20px 40px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '900',
                        marginBottom: '16px',
                        background: 'linear-gradient(135deg, #00FFFF, #FF7BAC)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        AlgoDuel Documentation
                    </h1>
                    <p style={{ fontSize: '18px', color: '#71717a' }}>
                        Complete technical reference for the competitive programming platform
                    </p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '40px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    overflowX: 'auto',
                    paddingBottom: '8px'
                }}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: activeTab === tab.id ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderBottom: activeTab === tab.id ? '2px solid #00FFFF' : '2px solid transparent',
                                    color: activeTab === tab.id ? '#00FFFF' : '#71717a',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '40px',
                    minHeight: '600px'
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
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(0, 255, 255, 0.05)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: isExpanded ? '16px' : '12px',
            transition: 'all 0.2s'
        }}
    >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#00FFFF' }}>{title}</h3>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
    </div>
);

const TechItem = ({ name, version, purpose }) => (
    <div style={{
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.03)',
        borderLeft: '3px solid #00FFFF',
        marginBottom: '8px',
        borderRadius: '4px'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <code style={{
                color: '#00FFFF',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'monospace'
            }}>
                {name}
            </code>
            {version && <span style={{ color: '#71717a', fontSize: '12px' }}>v{version}</span>}
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>{purpose}</p>
    </div>
);

const OverviewContent = () => (
    <div>
        <h2 style={{ fontSize: '32px', marginBottom: '24px', color: 'white' }}>Project Overview</h2>

        <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', color: '#00FFFF', marginBottom: '16px' }}>What is AlgoDuel?</h3>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d4d4d8' }}>
                AlgoDuel (SmartCoder) is a <strong>real-time competitive programming platform</strong> where developers can battle 1v1
                in algorithm challenges. It features live code synchronization, LeetCode integration, multiplayer rooms,
                and instant code execution using the Judge0 API.
            </p>
        </div>

        <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', color: '#00FFFF', marginBottom: '16px' }}>Core Features</h3>
            <ul style={{ fontSize: '15px', lineHeight: '2', color: '#d4d4d8', paddingLeft: '24px' }}>
                <li><strong>Real-time Code Editor</strong> - Monaco-style editor with syntax highlighting</li>
                <li><strong>Live 1v1 Battles</strong> - WebSocket-powered multiplayer coding battles</li>
                <li><strong>LeetCode Integration</strong> - Sync your LeetCode stats and profile</li>
                <li><strong>Code Execution</strong> - Run & test code with Judge0 API</li>
                <li><strong>OAuth Authentication</strong> - Google & GitHub login</li>
                <li><strong>Battle History</strong> - Track all your past competitions</li>
                <li><strong>Learn Mode</strong> - Educational resources and tutorials</li>
            </ul>
        </div>

        <div>
            <h3 style={{ fontSize: '20px', color: '#00FFFF', marginBottom: '16px' }}>Tech Stack Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{
                    padding: '24px',
                    background: 'rgba(0,255,255,0.05)',
                    border: '1px solid rgba(0,255,255,0.2)',
                    borderRadius: '8px'
                }}>
                    <h4 style={{ color: '#00FFFF', marginBottom: '12px' }}>Frontend</h4>
                    <p style={{ fontSize: '13px', color: '#a1a1aa', margin: 0 }}>
                        React 19, Vite, Socket.io, Three.js, React Router, React Helmet
                    </p>
                </div>
                <div style={{
                    padding: '24px',
                    background: 'rgba(255,123,172,0.05)',
                    border: '1px solid rgba(255,123,172,0.2)',
                    borderRadius: '8px'
                }}>
                    <h4 style={{ color: '#FF7BAC', marginBottom: '12px' }}>Backend</h4>
                    <p style={{ fontSize: '13px', color: '#a1a1aa', margin: 0 }}>
                        Express, MongoDB, Socket.io, JWT, Passport, Judge0, LeetCode API
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const FrontendContent = ({ expandedSections, toggleSection }) => (
    <div>
        <h2 style={{ fontSize: '32px', marginBottom: '24px', color: 'white' }}>Frontend Technologies</h2>

        <SectionHeader
            title="Core Framework & Build Tool"
            isExpanded={expandedSections.frontendCore}
            onToggle={() => toggleSection('frontendCore')}
        />
        {expandedSections.frontendCore && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="React" version="19.2.0" purpose="UI library for building component-based interfaces" />
                <TechItem name="Vite" version="7.2.4" purpose="Lightning-fast build tool and dev server with HMR" />
                <TechItem name="React DOM" version="19.2.0" purpose="React renderer for web applications" />
            </div>
        )}

        <SectionHeader
            title="Routing & Navigation"
            isExpanded={expandedSections.frontendRouting}
            onToggle={() => toggleSection('frontendRouting')}
        />
        {expandedSections.frontendRouting && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="React Router DOM" version="7.11.0" purpose="Declarative routing for React - handles all page navigation and protected routes" />
            </div>
        )}

        <SectionHeader
            title="Real-time Communication"
            isExpanded={expandedSections.frontendSocket}
            onToggle={() => toggleSection('frontendSocket')}
        />
        {expandedSections.frontendSocket && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="Socket.io-client" version="4.8.3" purpose="WebSocket client for real-time bidirectional communication in battles" />
            </div>
        )}

        <SectionHeader
            title="Code Editor & Syntax"
            isExpanded={expandedSections.frontendEditor}
            onToggle={() => toggleSection('frontendEditor')}
        />
        {expandedSections.frontendEditor && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="React Simple Code Editor" version="0.14.1" purpose="Lightweight code editor component for the workspace" />
                <TechItem name="Prismjs" version="1.30.0" purpose="Syntax highlighting for multiple programming languages" />
            </div>
        )}

        <SectionHeader
            title="HTTP & API"
            isExpanded={expandedSections.frontendHTTP}
            onToggle={() => toggleSection('frontendHTTP')}
        />
        {expandedSections.frontendHTTP && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="Axios" version="1.13.2" purpose="Promise-based HTTP client for API requests" />
            </div>
        )}

        <SectionHeader
            title="UI & Icons"
            isExpanded={expandedSections.frontendUI}
            onToggle={() => toggleSection('frontendUI')}
        />
        {expandedSections.frontendUI && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="Lucide React" version="0.562.0" purpose="Beautiful, consistent icon library (500+ icons)" />
            </div>
        )}

        <SectionHeader
            title="SEO & Meta Tags"
            isExpanded={expandedSections.frontendSEO}
            onToggle={() => toggleSection('frontendSEO')}
        />
        {expandedSections.frontendSEO && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="React Helmet Async" version="2.0.5" purpose="Manage document head for SEO optimization and meta tags" />
            </div>
        )}

        <SectionHeader
            title="3D Graphics & Effects"
            isExpanded={expandedSections.frontend3D}
            onToggle={() => toggleSection('frontend3D')}
        />
        {expandedSections.frontend3D && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="Three.js" version="0.182.0" purpose="3D graphics library for WebGL rendering" />
                <TechItem name="@react-three/fiber" version="9.4.2" purpose="React renderer for Three.js" />
                <TechItem name="@react-three/drei" version="10.7.7" purpose="Useful helpers for react-three-fiber" />
                <TechItem name="@react-three/postprocessing" version="3.0.4" purpose="Post-processing effects (bloom, etc.)" />
                <TechItem name="three-stdlib" version="2.36.1" purpose="Standard library extensions for Three.js" />
            </div>
        )}
    </div>
);

const BackendContent = ({ expandedSections, toggleSection }) => (
    <div>
        <h2 style={{ fontSize: '32px', marginBottom: '24px', color: 'white' }}>Backend Technologies</h2>

        <SectionHeader
            title="Core Framework"
            isExpanded={expandedSections.backendCore}
            onToggle={() => toggleSection('backendCore')}
        />
        {expandedSections.backendCore && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="Node.js" version="20.19.6" purpose="JavaScript runtime for server-side execution" />
                <TechItem name="Express" version="5.2.1" purpose="Fast, minimalist web framework for Node.js" />
                <TechItem name="Nodemon" version="3.1.11" purpose="Auto-restart server on file changes (dev only)" />
            </div>
        )}

        <SectionHeader
            title="Real-time Communication"
            isExpanded={expandedSections.backendSocket}
            onToggle={() => toggleSection('backendSocket')}
        />
        {expandedSections.backendSocket && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="Socket.io" version="4.8.3" purpose="WebSocket server for real-time battle synchronization" />
            </div>
        )}

        <SectionHeader
            title="Database"
            isExpanded={expandedSections.backendDB}
            onToggle={() => toggleSection('backendDB')}
        />
        {expandedSections.backendDB && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="MongoDB" version="-" purpose="NoSQL database for storing users, problems, battles" />
                <TechItem name="Mongoose" version="9.1.2" purpose="ODM library for MongoDB with schema validation" />
            </div>
        )}

        <SectionHeader
            title="Authentication & Security"
            isExpanded={expandedSections.backendAuth}
            onToggle={() => toggleSection('backendAuth')}
        />
        {expandedSections.backendAuth && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="JWT (jsonwebtoken)" version="9.0.3" purpose="Generate and verify JSON Web Tokens for stateless auth" />
                <TechItem name="Passport" version="0.7.0" purpose="Authentication middleware for Node.js" />
                <TechItem name="Passport Google OAuth" version="2.0.0" purpose="Google OAuth 2.0 authentication strategy" />
                <TechItem name="Helmet" version="8.1.0" purpose="Security middleware - sets HTTP headers" />
            </div>
        )}

        <SectionHeader
            title="Sessions & Caching"
            isExpanded={expandedSections.backendSession}
            onToggle={() => toggleSection('backendSession')}
        />
        {expandedSections.backendSession && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="Express Session" version="1.18.2" purpose="Session middleware for Express" />
                <TechItem name="Redis" version="5.10.0" purpose="In-memory data store for session caching" />
                <TechItem name="Connect Redis" version="9.0.0" purpose="Redis session store for Express" />
            </div>
        )}

        <SectionHeader
            title="Middleware & Utilities"
            isExpanded={expandedSections.backendMiddleware}
            onToggle={() => toggleSection('backendMiddleware')}
        />
        {expandedSections.backendMiddleware && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="CORS" version="2.8.5" purpose="Enable Cross-Origin Resource Sharing" />
                <TechItem name="Cookie Parser" version="1.4.7" purpose="Parse Cookie header and populate req.cookies" />
                <TechItem name="Compression" version="1.8.1" purpose="Compress response bodies for better performance" />
                <TechItem name="Express Rate Limit" version="8.2.1" purpose="Rate limiting to prevent abuse" />
                <TechItem name="Dotenv" version="17.2.3" purpose="Load environment variables from .env file" />
            </div>
        )}

        <SectionHeader
            title="External APIs"
            isExpanded={expandedSections.backendAPIs}
            onToggle={() => toggleSection('backendAPIs')}
        />
        {expandedSections.backendAPIs && (
            <div style={{ marginBottom: '24px' }}>
                <TechItem name="Axios" version="1.13.2" purpose="HTTP client for making requests to Judge0 and other APIs" />
                <TechItem name="Leetcode Query" version="2.0.1" purpose="Fetch LeetCode user statistics and profile data" />
                <div style={{
                    padding: '12px 16px',
                    background: 'rgba(255,123,172,0.1)',
                    borderLeft: '3px solid #FF7BAC',
                    marginTop: '8px',
                    borderRadius: '4px'
                }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#d4d4d8' }}>
                        <strong>Judge0 API</strong> - External code execution service (not in package.json, accessed via HTTP)
                    </p>
                </div>
            </div>
        )}
    </div>
);

const RoutesContent = () => (
    <div>
        <h2 style={{ fontSize: '32px', marginBottom: '24px', color: 'white' }}>Routes & Pages</h2>

        <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', color: '#00FFFF', marginBottom: '16px' }}>Frontend Routes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <RouteItem path="/" component="LandingPage" description="Marketing landing page with features, tech stack, and CTAs" />
                <RouteItem path="/app" component="MainApp" description="Protected app shell - redirects to /app/problems" />
                <RouteItem path="/app/problems" component="ProblemList" description="Browse all coding problems" />
                <RouteItem path="/app/workspace/:problemId" component="Workspace" description="Code editor for solving problems (solo practice)" />
                <RouteItem path="/app/lobby/:roomId" component="Lobby" description="Waiting room before battle starts" />
                <RouteItem path="/app/battle/:roomId" component="CompetitionRoom" description="Live 1v1 coding battle with real-time sync" />
                <RouteItem path="/app/learn" component="LearnPage" description="Educational resources and tutorials" />
                <RouteItem path="/app/history" component="HistoryPage" description="View past battle results and statistics" />
                <RouteItem path="/app/stats" component="LeetCodePage" description="LeetCode profile and statistics integration" />
                <RouteItem path="/connect-leetcode" component="ConnectLeetCode" description="Guide to install browser extension" />
            </div>
        </div>

        <div>
            <h3 style={{ fontSize: '20px', color: '#FF7BAC', marginBottom: '16px' }}>Backend API Routes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <APIRoute method="POST" path="/api/auth/signup" description="Create new user account with email/password" />
                <APIRoute method="POST" path="/api/auth/login" description="Login with email/password, returns JWT" />
                <APIRoute method="GET" path="/api/auth/google" description="Initiate Google OAuth flow" />
                <APIRoute method="GET" path="/api/auth/google/callback" description="Google OAuth callback handler" />
                <APIRoute method="GET" path="/api/auth/github" description="Initiate GitHub OAuth flow" />
                <APIRoute method="GET" path="/api/auth/github/callback" description="GitHub OAuth callback handler" />
                <APIRoute method="GET" path="/api/auth/logout" description="Clear session and logout user" />
                <APIRoute method="POST" path="/api/problems" description="Create a new coding problem (admin)" />
                <APIRoute method="GET" path="/api/problems" description="Get all problems with pagination" />
                <APIRoute method="GET" path="/api/problems/:id" description="Get single problem by ID" />
                <APIRoute method="GET" path="/api/leetcode/:username" description="Fetch LeetCode stats for a username" />
                <APIRoute method="POST" path="/api/leetcode/me" description="Auto-sync LeetCode stats from session cookie" />
                <APIRoute method="GET" path="/api/history" description="Get authenticated user's battle history" />
            </div>
        </div>
    </div>
);

const RouteItem = ({ path, component, description }) => (
    <div style={{
        padding: '16px 20px',
        background: 'rgba(0,255,255,0.03)',
        border: '1px solid rgba(0,255,255,0.1)',
        borderRadius: '8px'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <code style={{
                color: '#00FFFF',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'monospace'
            }}>
                {path}
            </code>
            <span style={{
                padding: '2px 8px',
                background: 'rgba(255,123,172,0.2)',
                color: '#FF7BAC',
                fontSize: '11px',
                borderRadius: '4px',
                fontWeight: '600'
            }}>
                {component}
            </span>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>{description}</p>
    </div>
);

const APIRoute = ({ method, path, description }) => (
    <div style={{
        padding: '16px 20px',
        background: 'rgba(255,123,172,0.03)',
        border: '1px solid rgba(255,123,172,0.1)',
        borderRadius: '8px'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{
                padding: '4px 8px',
                background: method === 'GET' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)',
                color: method === 'GET' ? '#22c55e' : '#eab308',
                fontSize: '11px',
                borderRadius: '4px',
                fontWeight: '700',
                fontFamily: 'monospace',
                minWidth: '50px',
                textAlign: 'center'
            }}>
                {method}
            </span>
            <code style={{
                color: '#FF7BAC',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'monospace'
            }}>
                {path}
            </code>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>{description}</p>
    </div>
);

const ArchitectureContent = () => (
    <div>
        <h2 style={{ fontSize: '32px', marginBottom: '24px', color: 'white' }}>Architecture & Features</h2>

        <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', color: '#00FFFF', marginBottom: '16px' }}>System Architecture</h3>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#d4d4d8', marginBottom: '20px' }}>
                AlgoDuel follows a <strong>client-server architecture</strong> with real-time WebSocket communication:
            </p>
            <ul style={{ fontSize: '14px', lineHeight: '2', color: '#a1a1aa', paddingLeft: '24px' }}>
                <li><strong>Frontend (React + Vite)</strong> - SPA hosted on Vercel</li>
                <li><strong>Backend (Express)</strong> - REST API + WebSocket server</li>
                <li><strong>Database (MongoDB)</strong> - User data, problems, battle history</li>
                <li><strong>Redis</strong> - Session storage and caching</li>
                <li><strong>Judge0 API</strong> - External code execution service</li>
                <li><strong>LeetCode API</strong> - Profile and stats synchronization</li>
            </ul>
        </div>

        <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', color: '#00FFFF', marginBottom: '16px' }}>Socket.io Events (Real-time)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <SocketEvent event="create_room" direction="Client → Server" description="Create a new battle room and receive roomId" />
                <SocketEvent event="join_room" direction="Client → Server" description="Join an existing room with roomId and username" />
                <SocketEvent event="room_joined" direction="Server → Client" description="Confirmation that user joined, with room state" />
                <SocketEvent event="code_change" direction="Client ↔ Server" description="Broadcast code changes to all users in room" />
                <SocketEvent event="run_code" direction="Client → Server" description="Request code execution via Judge0" />
                <SocketEvent event="code_output" direction="Server → Client" description="Return execution results from Judge0" />
                <SocketEvent event="submit_code" direction="Client → Server" description="Submit final solution and end battle" />
                <SocketEvent event="battle_ended" direction="Server → Client" description="Notify all users that battle has ended" />
                <SocketEvent event="leave_room" direction="Client → Server" description="User leaves the room" />
                <SocketEvent event="user_left" direction="Server → Client" description="Notify remaining users that someone left" />
            </div>
        </div>

        <div>
            <h3 style={{ fontSize: '20px', color: '#00FFFF', marginBottom: '16px' }}>Key Features Implementation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FeatureCard
                    title="Real-time Code Sync"
                    description="Every keystroke in the editor is broadcast via Socket.io to all users in the room. Debounced to avoid excessive events. State is maintained on the server to handle reconnections."
                />
                <FeatureCard
                    title="LeetCode Integration"
                    description="Uses leetcode-query package to fetch user stats. Browser extension captures leetcode_session cookie, which is sent to backend to identify the user and pull their profile data."
                />
                <FeatureCard
                    title="Code Execution"
                    description="Integrates with Judge0 API. Sends source code, language ID, and test cases. Polls for execution result. Returns stdout, stderr, compilation errors, and execution time."
                />
                <FeatureCard
                    title="OAuth Authentication"
                    description="Passport.js strategies for Google and GitHub. After OAuth callback, user data is stored in MongoDB and JWT is issued. JWT is stored in httpOnly cookie for security."
                />
            </div>
        </div>
    </div>
);

const SocketEvent = ({ event, direction, description }) => (
    <div style={{
        padding: '16px 20px',
        background: 'rgba(139,92,246,0.05)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: '8px',
        borderLeft: '4px solid #8b5cf6'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <code style={{
                color: '#a78bfa',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'monospace'
            }}>
                {event}
            </code>
            <span style={{ fontSize: '12px', color: '#71717a' }}>{direction}</span>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>{description}</p>
    </div>
);

const FeatureCard = ({ title, description }) => (
    <div style={{
        padding: '20px',
        background: 'rgba(0,255,255,0.03)',
        border: '1px solid rgba(0,255,255,0.2)',
        borderRadius: '8px'
    }}>
        <h4 style={{ color: '#00FFFF', marginBottom: '8px', fontSize: '16px' }}>{title}</h4>
        <p style={{ margin: 0, fontSize: '14px', color: '#a1a1aa', lineHeight: '1.6' }}>{description}</p>
    </div>
);

export default Documentation;
