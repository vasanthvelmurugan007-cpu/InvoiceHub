import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Users, CreditCard, ShieldCheck, Shield, Trash2, UserPlus, Check, X, Clock } from 'lucide-react';

const AdminDashboard = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'User', subscription_tier: 'Free' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [usersRes, reqRes] = await Promise.all([
            apiFetch('/api/users'),
            apiFetch('/api/subscription/requests')
        ]);

        const usersData = await usersRes.json();
        const reqData = await reqRes.json();

        if (usersData.data) setUsers(usersData.data);
        if (reqData.data) setRequests(reqData.data);
        setLoading(false);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        await apiFetch('/api/users', {
            method: 'POST',
            body: JSON.stringify(newUser)
        });
        setNewUser({ username: '', password: '', role: 'User', subscription_tier: 'Free' });
        setShowAdd(false);
        fetchData();
    };

    const toggleTier = async (id, currentTier) => {
        const nextTier = currentTier === 'Premium' ? 'Free' : 'Premium';
        await apiFetch(`/api/users/${id}/tier`, {
            method: 'POST',
            body: JSON.stringify({ subscription_tier: nextTier })
        });
        fetchData();
    };

    const handleApprove = async (id) => {
        await apiFetch(`/api/subscription/requests/${id}/approve`, {
            method: 'POST'
        });
        fetchData();
    };

    const handleReject = async (id) => {
        await apiFetch(`/api/subscription/requests/${id}/reject`, {
            method: 'POST'
        });
        fetchData();
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            const res = await apiFetch(`/api/users/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchData();
            } else {
                const d = await res.json();
                alert(d.error || 'Failed to delete user');
            }
        } catch (err) {
            alert('Error deleting user: ' + err.message);
        }
    };

    if (currentUser?.role !== 'Admin') return <div className="page-container">Access Denied</div>;

    return (
        <div className="page-container" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1a202c', marginBottom: '10px' }}>Admin Control Center</h1>
                <p style={{ color: '#718096', fontSize: '1.1rem' }}>Manage users, roles, and premium subscription approvals.</p>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '2px solid #e2e8f0' }}>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        padding: '15px 30px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: activeTab === 'users' ? '#4f46e5' : '#718096',
                        border: 'none',
                        background: 'none',
                        borderBottom: activeTab === 'users' ? '3px solid #4f46e5' : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}>
                    <Users size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    User Management
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    style={{
                        padding: '15px 30px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: activeTab === 'requests' ? '#4f46e5' : '#718096',
                        border: 'none',
                        background: 'none',
                        borderBottom: activeTab === 'requests' ? '3px solid #4f46e5' : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}>
                    <CreditCard size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Upgrade Requests {requests.filter(r => r.status === 'Pending').length > 0 && (
                        <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>
                            {requests.filter(r => r.status === 'Pending').length}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === 'users' ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <button onClick={() => setShowAdd(true)} style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UserPlus size={18} /> Add Premium User
                        </button>
                    </div>

                    {showAdd && (
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ marginBottom: '20px' }}>Create New Account</h3>
                            <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#4a5568' }}>Username</label>
                                    <input type="text" required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }} placeholder="Select username" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#4a5568' }}>Password</label>
                                    <input type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }} placeholder="Set password" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#4a5568' }}>Access Level</label>
                                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
                                        <option value="User">Standard User</option>
                                        <option value="Admin">Administrator</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#4a5568' }}>Subscription</label>
                                    <select value={newUser.subscription_tier} onChange={e => setNewUser({ ...newUser, subscription_tier: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
                                        <option value="Free">Free Edition</option>
                                        <option value="Premium">Premium Edition</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'span 4', display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '12px 25px', color: '#718096', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                    <button type="submit" style={{ padding: '12px 35px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Create User</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ textAlign: 'left', padding: '20px', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>User Identity</th>
                                    <th style={{ textAlign: 'left', padding: '20px', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Authorization</th>
                                    <th style={{ textAlign: 'left', padding: '20px', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Subscription</th>
                                    <th style={{ textAlign: 'left', padding: '20px', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Valid Until</th>
                                    <th style={{ textAlign: 'right', padding: '20px', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '20px', fontWeight: '600' }}>{u.username}</td>
                                        <td style={{ padding: '20px' }}>
                                            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: u.role === 'Admin' ? '#eef2ff' : '#f8fafc', color: u.role === 'Admin' ? '#4f46e5' : '#64748b' }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <button
                                                onClick={() => toggleTier(u.id, u.subscription_tier)}
                                                style={{
                                                    padding: '6px 15px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    backgroundColor: u.subscription_tier === 'Premium' ? '#ecfdf5' : '#f5f5f5',
                                                    color: u.subscription_tier === 'Premium' ? '#059669' : '#a3a3a3'
                                                }}>
                                                {u.subscription_tier === 'Premium' ? <ShieldCheck size={14} /> : <Shield size={14} />}
                                                {u.subscription_tier}
                                            </button>
                                        </td>
                                        <td style={{ padding: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>{u.subscription_expiry || 'Permanent'}</td>
                                        <td style={{ padding: '20px', textAlign: 'right' }}>
                                            {u.username !== 'admin' && u.username !== currentUser?.username && (
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '20px', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Transaction ID</th>
                                <th style={{ textAlign: 'left', padding: '20px', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Method</th>
                                <th style={{ textAlign: 'left', padding: '20px', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Amount</th>
                                <th style={{ textAlign: 'left', padding: '20px', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Verification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '20px', fontFamily: 'monospace', color: '#1a202c' }}>{req.transaction_id}</td>
                                    <td style={{ padding: '20px', color: '#718096', fontSize: '0.85rem' }}>{req.upi_used}</td>
                                    <td style={{ padding: '20px', fontWeight: 'bold' }}>₹{req.amount}</td>
                                    <td style={{ padding: '20px', color: '#718096', fontSize: '0.85rem' }}>{new Date(req.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '20px', textAlign: 'center' }}>
                                        {req.status === 'Pending' ? (
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                <button onClick={() => handleApprove(req.id)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Check size={16} /> Approve
                                                </button>
                                                <button onClick={() => handleReject(req.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <X size={16} /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{
                                                padding: '5px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                backgroundColor: req.status === 'Approved' ? '#ecfdf5' : '#fef2f2',
                                                color: req.status === 'Approved' ? '#059669' : '#b91c1c'
                                            }}>
                                                {req.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        No subscription requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
