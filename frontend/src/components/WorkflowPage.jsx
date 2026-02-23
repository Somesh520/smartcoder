import React from 'react';

const WorkflowPage = ({ onNavigate, onGetStarted }) => {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>
            <Navbar onNavigate={onNavigate} onGetStarted={onGetStarted} current="workflow" />

            <div style={{ maxWidth: '800px', margin: '120px auto 40px', padding: '0 20px' }}>
                <h1 style={{ textAlign: 'center', fontSize: '48px', fontWeight: 950, marginBottom: '60px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                    HOW_IT_WORKS
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <Step number="01" title="Create or Join" desc="Start a new lobby as a host, or join an existing room using a 6-digit code or a direct invite link from a friend." />
                    <Step number="02" title="Pre-Game Setup" desc="The host selects the problem topic (e.g., Arrays, Dynamic Programming) and difficulty level. Both players ready up." />
                    <Step number="03" title="The Battle" desc="Once the game starts, you are dropped into a shared IDE. You can see your opponent's cursor in real-time if you choose, but usually, you focus on your own code. Voice chat handles the communication." />
                    <Step number="04" title="Testing & Debugging" desc="Run custom test cases against your code. Our backend executes your solution safely in a sandboxed environment." />
                    <Step number="05" title="Submission" desc="When you are confident, hit Submit. Use our hidden test cases to verify correctness. The first player to pass all cases wins the match!" />
                </div>
            </div>
        </div>
    );
};

const Navbar = ({ onNavigate, onGetStarted, current }) => {
    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, padding: '20px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backdropFilter: 'blur(10px)', background: 'var(--bg-main)', borderBottom: 'var(--border-main)', zIndex: 100
        }}>
            <div onClick={() => onNavigate('landing')} style={{ cursor: 'pointer', fontWeight: 950, fontSize: '20px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                <span style={{ color: 'var(--accent)' }}>ALGO</span>DUEL.
            </div>
            <div style={{ display: 'flex', gap: '30px', fontSize: '14px', fontWeight: 950, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <button onClick={() => onNavigate('purpose')} style={{ ...navBtnStyle, color: current === 'purpose' ? 'var(--text-main)' : 'var(--text-muted)' }}>Purpose</button>
                <button onClick={() => onNavigate('workflow')} style={{ ...navBtnStyle, color: current === 'workflow' ? 'var(--text-main)' : 'var(--text-muted)' }}>How it Works</button>
                <button onClick={() => onNavigate('about')} style={{ ...navBtnStyle, color: current === 'about' ? 'var(--text-main)' : 'var(--text-muted)' }}>About Us</button>
            </div>
            <button onClick={onGetStarted} className="neo-btn" style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 950, background: 'var(--accent)', color: 'black', border: 'var(--border-main)', borderRadius: '0', cursor: 'pointer', textTransform: 'uppercase' }}>Play Now</button>
        </nav>
    );
};

const Step = ({ number, title, desc }) => (
    <div className="neo-card" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', background: 'var(--bg-card)', padding: '30px', borderRadius: '0', border: 'var(--border-main)', boxShadow: 'var(--shadow-main)' }}>
        <div style={{ fontSize: '24px', fontWeight: 950, color: 'var(--accent)', opacity: 0.8 }}>
            {number}
        </div>
        <div>
            <h3 style={{ fontSize: '20px', fontWeight: 950, margin: '0 0 10px 0', color: 'var(--text-main)', textTransform: 'uppercase' }}>{title}</h3>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6', fontWeight: 700 }}>{desc}</p>
        </div>
    </div>
);

const navBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 950 };

export default WorkflowPage;
