import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 20% 20%, rgba(44, 187, 93, 0.08), transparent 45%), #0a0a0a',
            color: 'var(--text-main)',
            padding: '24px'
        }}>
            <div style={{
                width: 'min(560px, 100%)',
                background: 'rgba(24,24,27,0.92)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 20px 45px rgba(0,0,0,0.35)'
            }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(239,68,68,0.14)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                }}>
                    <AlertTriangle size={28} color="#f87171" />
                </div>

                <h1 style={{ margin: 0, fontSize: '34px', lineHeight: 1.1, fontWeight: 900 }}>
                    404
                </h1>
                <p style={{ margin: '8px 0 4px', fontSize: '20px', fontWeight: 800 }}>
                    Page Not Found
                </p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
                    This route does not exist in the app.
                </p>

                <div style={{
                    marginTop: '14px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {location.pathname}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '22px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'transparent',
                            color: 'var(--text-main)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate('/app')}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid var(--accent)',
                            background: 'var(--accent)',
                            color: '#000',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Home size={16} />
                        Go To App
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
