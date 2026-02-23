import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
    return (
        <div style={{
            padding: '60px 20px',
            maxWidth: '800px',
            margin: '0 auto',
            color: 'var(--text-main)',
            fontFamily: "'Inter', sans-serif",
            lineHeight: '1.6',
            background: 'var(--bg-main)',
            minHeight: '100vh'
        }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', textDecoration: 'none', marginBottom: '40px', fontWeight: 950, textTransform: 'uppercase' }}>
                <ArrowLeft size={20} /> BACK_TO_HOME
            </Link>

            <h1 style={{ fontSize: '42px', fontWeight: 950, marginBottom: '10px', color: 'var(--text-main)', textTransform: 'uppercase' }}>TERMS_OF_SERVICE</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontWeight: 700 }}>Last Updated: January 24, 2026</p>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
                <p>
                    By accessing and using <strong>AlgoDuel / SmartCoder</strong> ("the Service"), you agree to be bound by complying with these Terms of Service ("Terms"). If you do not agree, you must not use the Service.
                </p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>2. Description of Service</h2>
                <p>
                    AlgoDuel provides a platform for coding practice, real-time competitive programming ("battles"), and productivity tools ("Second Brain") including Notes, Task Management, and Calendar integration.
                </p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>3. User Accounts & Security</h2>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li>You may be required to register using a third-party service (e.g., Google or GitHub).</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                    <li>You connect your Google Account voluntarily to enable Calendar and Task sync features.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>4. User Conduct</h2>
                <p>You agree not to:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li>Use the Service for any illegal purpose.</li>
                    <li>Cheat, exploit, or manipulate the competitive coding mechanics.</li>
                    <li>Attempt to access other users' private data (Notes, Tasks) without authorization.</li>
                    <li>Overload our API or infrastructure.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>5. Intellectual Property</h2>
                <p>
                    <strong>Our IP:</strong> The platform code, design, and assets are owned by AlgoDuel Systems.
                    <br />
                    <strong>Your Content:</strong> You retain ownership of the code, notes, and data you create. You grant us a limited license to store and display this content solely for providing the Service.
                </p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>6. Termination</h2>
                <p>
                    We reserve the right to suspend or terminate your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users.
                </p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>7. Disclaimer of Warranties</h2>
                <p>
                    The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
                </p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>8. Limitation of Liability</h2>
                <p>
                    In no event shall AlgoDuel be liable for any indirect, incidental, special, or consequential damages arising out of your use of the Service, including loss of data (e.g., notes, code submissions).
                </p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>9. API Usage (Google)</h2>
                <p>
                    Our use of Google APIs is subject to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" style={{ color: '#00FFFF' }}>Google API Services User Data Policy</a>. We only access the data necessary to provide the features you explicitly enable (e.g., syncing tasks).
                </p>
            </section>

            <section style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>10. Contact Information</h2>
                <p>For any questions regarding these Terms, please contact us at:</p>
                <p style={{ color: '#00FFFF', marginTop: '10px' }}>support@algoduel.com</p>
            </section>

            <footer style={{ borderTop: 'var(--border-main)', paddingTop: '20px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 700 }}>
                &copy; {new Date().getFullYear()} AlgoDuel Systems. All rights reserved.
            </footer>
        </div>
    );
};

export default TermsPage;
