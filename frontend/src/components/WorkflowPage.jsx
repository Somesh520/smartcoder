import React from 'react';

const WorkflowPage = ({ onNavigate, onGetStarted }) => {
    return (
        <div style={{ minHeight: '100vh', background: '#09090b', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            <Navbar onNavigate={onNavigate} onGetStarted={onGetStarted} current="workflow" />

            <div style={{ maxWidth: '800px', margin: '120px auto 40px', padding: '0 20px' }}>
                <h1 style={{ textAlign: 'center', fontSize: '48px', fontWeight: 800, marginBottom: '60px', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    How It Works
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
            backdropFilter: 'blur(10px)', background: 'rgba(9, 9, 11, 0.8)', borderBottom: '1px solid #27272a', zIndex: 100
        }}>
            <div onClick={() => onNavigate('landing')} style={{ cursor: 'pointer', fontWeight: 800, fontSize: '20px' }}>
                <span style={{ color: '#22c55e' }}>Algo</span>Duel.
            </div>
            <div style={{ display: 'flex', gap: '30px', fontSize: '14px', fontWeight: 500, color: '#a1a1aa' }}>
                <button onClick={() => onNavigate('purpose')} style={{ ...navBtnStyle, color: current === 'purpose' ? 'white' : '#a1a1aa' }}>Purpose</button>
                <button onClick={() => onNavigate('workflow')} style={{ ...navBtnStyle, color: current === 'workflow' ? 'white' : '#a1a1aa' }}>How it Works</button>
                <button onClick={() => onNavigate('about')} style={{ ...navBtnStyle, color: current === 'about' ? 'white' : '#a1a1aa' }}>About Us</button>
            </div>
            <button onClick={onGetStarted} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600, background: '#22c55e', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Play Now</button>
        </nav>
    );
};

const Step = ({ number, title, desc }) => (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', background: '#121214', padding: '30px', borderRadius: '16px', border: '1px solid #27272a' }}>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e', opacity: 0.8 }}>
            {number}
        </div>
        <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 10px 0', color: 'white' }}>{title}</h3>
            <p style={{ fontSize: '16px', color: '#a1a1aa', margin: 0, lineHeight: '1.6' }}>{desc}</p>
        </div>
    </div>
);

const navBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500 };

export default WorkflowPage;
