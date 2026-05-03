import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function AuthPage() {
    const { signInWithGoogle } = useAppStore();
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        await signInWithGoogle();
        setLoading(false);
    };

    return (
        <div style={{
            backgroundColor: '#0A0A0A',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            fontFamily: 'sans-serif',
        }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h1 style={{ color: '#C8FF00', fontSize: '42px', fontWeight: 900, margin: 0 }}>
                    FORGE AI
                </h1>
                <p style={{ color: '#888888', fontSize: '14px', marginTop: '8px' }}>
                    Your Personal Operating System
                </p>
            </div>

            <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%',
                    maxWidth: '320px',
                    justifyContent: 'center',
                    opacity: loading ? 0.7 : 1,
                }}
            >
                <img
                    src="https://www.google.com/favicon.ico"
                    width={20}
                    height={20}
                    alt="Google"
                />
                {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <p style={{ color: '#444444', fontSize: '12px', marginTop: '24px', textAlign: 'center', whiteSpace: 'pre-line' }}>
                {'Your data stays private and secure.\nNo passwords required.'}
            </p>
        </div>
    );
}
