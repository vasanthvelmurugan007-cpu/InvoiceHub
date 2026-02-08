import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Lock, User, ShieldCheck, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                navigate('/login', { state: { message: 'Registration successful! Please login.' } });
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
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
                        backgroundColor: '#10b981',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px auto',
                        color: 'white'
                    }}>
                        <UserPlus size={30} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Create Account</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Join the billing platform today</p>
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

                <form onSubmit={handleSubmit}>
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
                                placeholder="Choose a username"
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
                                placeholder="Create a password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: '#10b981',
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
                        {loading ? 'Creating account...' : <><UserPlus size={20} /> Register</>}
                    </button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center' }}>
                    <Link to="/login" style={{
                        color: '#6b7280',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                    }}>
                        <ArrowLeft size={16} /> Already have an account? Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
