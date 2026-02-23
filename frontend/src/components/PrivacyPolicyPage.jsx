import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
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

            <h1 style={{ fontSize: '42px', fontWeight: 950, marginBottom: '10px', color: 'var(--text-main)', textTransform: 'uppercase' }}>PRIVACY_POLICY</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontWeight: 700 }}>Last Updated: January 24, 2026</p>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>1. Introduction</h2>
                <p>
                    Welcome to <strong>AlgoDuel / SmartCoder</strong> ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services (collectively, "Services").
                    This policy outlines our handling practices and how we collect and use the Personal Data you provide during your interactions with us.
                </p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>2. Data Collection</h2>
                <p>We collect the following types of information:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    <li><strong>Account Information:</strong> When you sign in with Google, we collect your name, email address, and profile picture to create your user account.</li>
                    <li><strong>User Content:</strong> Code submissions, notes, and task data you explicitly create within the application.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>3. Google User Data</h2>
                <p>Our application integrates with Google Services (Google Calendar and Google Tasks) to provide productivity features. If you grant us permission, we access:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px', marginBottom: '10px' }}>
                    <li><strong>Google Calendar:</strong> To read your events (displaying them in your schedule) and write new events (syncing tasks you create).</li>
                    <li><strong>Google Tasks:</strong> To read your task lists and create/delete tasks as requested by you.</li>
                </ul>
                <p><strong>Limited Use Policy:</strong> The use of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" style={{ color: '#00FFFF' }}>Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
                <p>We <strong>do not</strong> share your Google User Data with any third-party AI models or external entities. Data is only stored in your secured personal database record.</p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>4. Data Usage</h2>
                <p>We use your data strictly to:</p>
                <ul>
                    <li>Provide, maintain, and improve the Services.</li>
                    <li>Personalize your dashboard and productivity tools.</li>
                    <li>Authenticate your identity and prevent fraud.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>5. Data Storage & Security</h2>
                <p>
                    Your data is stored securely using industry-standard encryption protocols (MongoDB Atlas). We implement appropriate technical measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal data.
                </p>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>6. Your Rights</h2>
                <p>You have the right to access, correct, or delete your personal data. You can disconnect your Google Account at any time via the "Settings" or "Tasks" page, which will revoke our access tokens.</p>
            </section>

            <section style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '15px' }}>7. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                <p style={{ color: '#00FFFF', marginTop: '10px' }}>support@algoduel.com</p>
            </section>

            <footer style={{ borderTop: 'var(--border-main)', paddingTop: '20px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 700 }}>
                &copy; {new Date().getFullYear()} AlgoDuel Systems. All rights reserved.
            </footer>
        </div>
    );
};

export default PrivacyPolicyPage;
