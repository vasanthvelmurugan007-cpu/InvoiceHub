import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, User, ShieldCheck, KeyRound } from 'lucide-react';

const LoginPage = () => {
    const [step, setStep] = useState('credentials'); // 'credentials' | '2fa'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [tempToken, setTempToken] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, verify2fa } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (step === 'credentials') {
            const res = await login(username, password);
            if (res.success) {
                if (res.require2fa) {
                    setTempToken(res.token);
                    setStep('2fa');
                } else {
                    navigate('/');
                }
            } else {
                setError(res.error || 'Login failed');
            }
        } else {
            // Verify 2FA
            const res = await verify2fa(tempToken, otp);
            if (res.success) {
                navigate('/');
            } else {
                setError(res.error || 'Invalid Code');
            }
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#4f46e5',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px auto',
                        color: 'white'
                    }}>
                        <ShieldCheck size={30} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                        {step === 'credentials' ? 'InvoiceHub' : 'Two-Factor Auth'}
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        {step === 'credentials' ? 'Secure Login for your dashboard' : 'Enter the code from your Authenticator app'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        color: '#b91c1c',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        marginBottom: '20px',
                        textAlign: 'center',
                        border: '1px solid #fee2e2'
                    }}>
                        {error}
                    </div>
                )}

                {message && !error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        marginBottom: '20px',
                        textAlign: 'center',
                        border: '1px solid #d1fae5'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {step === 'credentials' ? (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }}>
                                        <User size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 40px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '10px',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        placeholder="Enter username"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }}>
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 40px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '10px',
                                            fontSize: '0.95rem',
                                            outline: 'none'
                                        }}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Authenticator Code</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }}>
                                    <KeyRound size={18} />
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        letterSpacing: '4px',
                                        fontWeight: 'bold',
                                        textAlign: 'center'
                                    }}
                                    placeholder="000 000"
                                />
                            </div>
                            <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                <button
                                    type="button"
                                    onClick={() => setStep('credentials')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#6b7280',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'background-color 0.2s'
                        }}>
                        {loading ? 'Verifying...' : (step === 'credentials' ? <><LogIn size={20} /> Sign In</> : <><ShieldCheck size={20} /> Verify</>)}
                    </button>
                </form>

                {step === 'credentials' && (
                    <div style={{ marginTop: '25px', textAlign: 'center' }}>
                        <Link to="/register" style={{ color: '#4f46e5', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>
                            Don't have an account? Register
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
