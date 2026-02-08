import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Save, Building, CreditCard, FileText, Upload, ShieldCheck } from 'lucide-react';
import Modal from '../components/Modal';

const Settings = () => {
    const { user, setUser } = useAuth(); // Assuming useAuth exposes setUser to update local user state
    const [settings, setSettings] = useState({
        company_name: '', address: '', gstin: '', email: '', phone: '', bank_details: '', terms: '', state: '', logo_url: '', signature_url: '', upi_id: '', custom_field_label: ''
    });
    const [requests, setRequests] = useState([]);

    // 2FA State
    const [show2faModal, setShow2faModal] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [verifyCode, setVerifyCode] = useState('');

    const start2FASetup = async () => {
        const res = await apiFetch('/api/auth/2fa/setup', { method: 'POST' });
        const data = await res.json();
        if (data.qrCode) {
            setQrCode(data.qrCode);
            setShow2faModal(true);
        } else {
            alert('Failed to start setup');
        }
    };

    const confirm2FA = async () => {
        const res = await apiFetch('/api/auth/2fa/enable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: verifyCode })
        });
        const data = await res.json();
        if (data.success) {
            alert('Two-Factor Authentication Enabled!');
            setShow2faModal(false);
            setVerifyCode('');
            // Refresh user data (quick hack: manually update local state)
            setUser({ ...user, two_factor_enabled: 1 });
        } else {
            alert(data.error || 'Verification Failed');
        }
    };

    const disable2FA = async () => {
        if (!window.confirm('Are you sure you want to disable 2FA? This will reduce account security.')) return;
        const res = await apiFetch('/api/auth/2fa/disable', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            alert('2FA Disabled');
            setUser({ ...user, two_factor_enabled: 0 });
        }
    };

    useEffect(() => {
        apiFetch('/api/settings').then(res => res.json()).then(d => {
            if (d.data) {
                setSettings(prev => ({ ...prev, ...d.data }));
            }
        });
        fetchRequests();
    }, []);

    const fetchRequests = () => {
        apiFetch('/api/subscription/requests').then(res => res.json()).then(d => {
            if (d.data) setRequests(d.data);
        });
    };

    const handleChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        await apiFetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
        alert('Settings Saved Successfully!');
    };

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
        await apiFetch(`/api/subscription/requests/${id}/${action}`, {
            method: 'POST'
        });
        fetchRequests();
        alert(`Subscription ${action}d!`);
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-lg">
                <h1>Company Settings</h1>
                <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    Save Changes
                </button>
            </div>

            <div className="grid-2 gap-lg">
                <div className="card">
                    <h3 className="mb-md flex items-center gap-sm"><Building size={18} /> Company Profile</h3>

                    <div className="grid-2 gap-md mb-md p-md border rounded bg-gray-50">
                        <div style={{ position: 'relative' }}>
                            <label className="text-sm font-bold mb-xs block">Company Logo</label>
                            <input type="file" id="logo-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'logo_url')} className="text-sm" style={{ display: 'none' }} />
                            <div
                                onClick={() => document.getElementById('logo-upload').click()}
                                style={{
                                    width: '100%',
                                    height: '100px',
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    background: '#fff',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                                onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                            >
                                {settings.logo_url && settings.logo_url !== '/logo.png' ? (
                                    <>
                                        <img src={settings.logo_url} alt="Logo" style={{ maxHeight: '80%', maxWidth: '90%', objectFit: 'contain' }} />
                                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Click to change</div>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} color="#94a3b8" />
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>Upload Logo</div>
                                    </>
                                )}
                            </div>
                            {settings.logo_url && settings.logo_url !== '/logo.png' && (
                                <button
                                    onClick={() => setSettings(prev => ({ ...prev, logo_url: '' }))}
                                    style={{ position: 'absolute', top: '25px', right: '5px', padding: '2px 6px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-bold mb-xs block">Proprietor Signature</label>
                            <input type="file" id="sig-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'signature_url')} className="text-sm" style={{ display: 'none' }} />
                            <div
                                onClick={() => document.getElementById('sig-upload').click()}
                                style={{
                                    width: '100%',
                                    height: '100px',
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    background: '#fff'
                                }}
                            >
                                {settings.signature_url ? (
                                    <img src={settings.signature_url} alt="Signature" style={{ maxHeight: '80%', maxWidth: '90%', objectFit: 'contain' }} />
                                ) : (
                                    <>
                                        <Upload size={20} color="#94a3b8" />
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>Upload Signature</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-group mb-md">
                        <label>Company Name</label>
                        <input name="company_name" className="input-field" value={settings.company_name} onChange={handleChange} placeholder="e.g. Acme Industries" />
                    </div>
                    <div className="form-group mb-md">
                        <label>Address</label>
                        <textarea name="address" className="input-field" rows="3" value={settings.address} onChange={handleChange} placeholder="Full business address" />
                    </div>
                    <div className="grid-2 gap-md">
                        <div className="form-group">
                            <label>GSTIN</label>
                            <input name="gstin" className="input-field" value={settings.gstin} onChange={handleChange} placeholder="27ABCDE1234F1Z5" />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input name="phone" className="input-field" value={settings.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                        </div>
                    </div>
                    <div className="form-group mt-md">
                        <label>Email</label>
                        <input name="email" className="input-field" value={settings.email} onChange={handleChange} placeholder="billing@acme.com" />
                    </div>
                    <div className="form-group mt-md">
                        <label>State (Required for GST)</label>
                        <select name="state" className="input-field" value={settings.state || ''} onChange={handleChange}>
                            <option value="">Select State</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="West Bengal">West Bengal</option>
                            <option value="Rajasthan">Rajasthan</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-lg">
                    <div className="card">
                        <h3 className="mb-md flex items-center gap-sm"> UPI Payment Settings</h3>
                        <p className="text-secondary text-sm mb-sm">Enter your UPI ID to generate QR codes on invoices.</p>
                        <div className="form-group">
                            <label>UPI ID (e.g. business@upi)</label>
                            <input name="upi_id" className="input-field" value={settings.upi_id || ''} onChange={handleChange} placeholder="yourname@bank" />
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="mb-md flex items-center gap-sm"> Custom Invoice Field</h3>
                        <p className="text-secondary text-sm mb-sm">Add a custom field to your invoices (e.g. "Vehicle No", "Order ID").</p>
                        <div className="form-group">
                            <label>Field Name / Label</label>
                            <input name="custom_field_label" className="input-field" value={settings.custom_field_label || ''} onChange={handleChange} placeholder="e.g. Purchase Order #" />
                        </div>
                    </div>

                    <div className="card" style={{ border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
                        <h3 className="mb-md flex items-center gap-sm" style={{ color: '#166534' }}> <Building size={18} /> Data Backup & Security</h3>
                        <p className="text-secondary text-sm mb-sm" style={{ color: '#15803d' }}>Download a full backup of your data to keep it safe.</p>
                        <button
                            className="btn"
                            style={{ background: '#16a34a', color: 'white', width: '100%' }}
                            onClick={() => window.open('/api/settings/backup', '_blank')}
                        >
                            <Upload size={16} style={{ marginRight: '8px', transform: 'rotate(180deg)' }} /> Download Database Backup
                        </button>
                    </div>

                    <div className="card" style={{ border: '1px solid #e0e7ff', background: '#eef2ff' }}>
                        <h3 className="mb-md flex items-center gap-sm" style={{ color: '#3730a3' }}> <ShieldCheck size={18} /> Account Security</h3>
                        <p className="text-secondary text-sm mb-sm" style={{ color: '#4338ca' }}>Protect your account with Two-Factor Authentication (2FA).</p>

                        {user && user.two_factor_enabled ? (
                            <div className="flex items-center justify-between">
                                <span style={{ color: '#166534', fontWeight: 'bold', fontSize: '0.9rem' }}>✓ 2FA is Enabled</span>
                                <button className="btn btn-sm" onClick={disable2FA} style={{ background: '#fee2e2', color: '#b91c1c' }}>Disable</button>
                            </div>
                        ) : (
                            <button className="btn" style={{ background: '#4f46e5', color: 'white', width: '100%' }} onClick={start2FASetup}>
                                Setup 2FA
                            </button>
                        )}
                    </div>

                    <div className="card">
                        <h3 className="mb-md flex items-center gap-sm"><CreditCard size={18} /> Bank Details</h3>
                        <p className="text-secondary text-sm mb-sm">This will appear on your invoices.</p>
                        <textarea name="bank_details" className="input-field" rows="4" value={settings.bank_details} onChange={handleChange}
                            placeholder={`Bank Name: HDFC Bank\nA/C No: 1234567890\nIFSC: HDFC0001234\nBranch: Andheri East`}
                        />
                    </div>

                    <div className="card">
                        <h3 className="mb-md flex items-center gap-sm"><FileText size={18} /> Default Terms</h3>
                        <textarea name="terms" className="input-field" rows="4" value={settings.terms} onChange={handleChange}
                            placeholder="e.g. Payment due in 30 days."
                        />
                    </div>
                </div>
            </div>

            <Modal isOpen={show2faModal} onClose={() => setShow2faModal(false)} title="Setup Two-Factor Authentication">
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '15px', color: '#64748b' }}>Scan this QR code with your authenticator app (e.g. Google Authenticator).</p>
                    {qrCode && <img src={qrCode} alt="2FA QR Code" style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', marginBottom: '20px' }} />}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Enter Verification Code</label>
                        <input
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            placeholder="000 000"
                            style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '1.2rem',
                                textAlign: 'center',
                                letterSpacing: '2px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px'
                            }}
                        />
                    </div>

                    <button onClick={confirm2FA} className="btn btn-primary" style={{ width: '100%' }}>Enable 2FA</button>
                </div>
            </Modal>

            <div className="card mt-lg">
                <h3 className="mb-md flex items-center gap-sm"><CreditCard size={18} /> Premium Upgrade Requests</h3>
                <p className="text-secondary text-sm mb-md">Approve manual UPI payments here to unlock features for users.</p>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length > 0 ? requests.map(req => (
                                <tr key={req.id}>
                                    <td>{new Date(req.date).toLocaleDateString()}</td>
                                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{req.transaction_id}</code></td>
                                    <td>₹ {req.amount}</td>
                                    <td>
                                        <span className={`badge badge-${req.status.toLowerCase()}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {req.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-sm" onClick={() => handleAction(req.id, 'approve')} style={{ backgroundColor: '#10b981', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                                                <button className="btn btn-sm" onClick={() => handleAction(req.id, 'reject')} style={{ backgroundColor: '#ef4444', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                                            </div>
                                        )}
                                        {req.status !== 'Pending' && <span className="text-secondary text-sm">Processed</span>}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No premium requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 14px; }
                .input-field { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; transition: border 0.2s; }
                .input-field:focus { border-color: var(--primary-color); outline: none; }
                .gap-sm { gap: 8px; }
                .bg-gray-50 { background-color: #f8fafc; }
                .border { border: 1px solid #e2e8f0; }
                .rounded { border-radius: 6px; }
                .p-md { padding: 15px; }
                .font-bold { font-weight: 600; }
                .mb-xs { margin-bottom: 4px; }
                .block { display: block; }
                
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
                .badge-pending { background: #fef3c7; color: #92400e; }
                .badge-approved { background: #d1fae5; color: #065f46; }
                .badge-rejected { background: #fee2e2; color: #991b1b; }
                
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th { text-align: left; padding: 12px; border-bottom: 2px solid #f1f5f9; font-size: 13px; color: #64748b; }
                .data-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            `}</style>
        </div >
    );
};

export default Settings;
