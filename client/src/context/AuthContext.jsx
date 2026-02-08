import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) setUser(data.user);
                    else localStorage.removeItem('token');
                    setLoading(false);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.require2fa) {
                return { success: true, require2fa: true, token: data.token };
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Unable to connect to server. Please ensure the server is running.' };
        }
    };

    const verify2fa = async (tempToken, code) => {
        try {
            const res = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tempToken}`
                },
                body: JSON.stringify({ token: code })
            });
            const data = await res.json();

            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (error) {
            return { success: false, error: 'Verification failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, verify2fa, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
