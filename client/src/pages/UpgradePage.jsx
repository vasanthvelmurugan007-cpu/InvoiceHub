import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Check, Star, Shield, Zap, CreditCard } from 'lucide-react';

const UpgradePage = ({ onUpgrade }) => {
    const [loading, setLoading] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [upiId, setUpiId] = useState("santo@okicici"); // Default placeholder
    const [step, setStep] = useState(1); // 1: Pricing, 2: Payment, 3: Success

    useEffect(() => {
        apiFetch('/api/settings')
            .then(res => res.json())
            .then(d => {
                if (d.data && d.data.upi_id) {
                    setUpiId(d.data.upi_id);
                }
            });
    }, []);

    const handleRequestUpgrade = async (e) => {
        e.preventDefault();
        if (!transactionId) return alert("Please enter Transaction ID");

        setLoading(true);
        try {
            const response = await apiFetch('/api/subscription/request', {
                method: 'POST',
                body: JSON.stringify({ transaction_id: transactionId, upi_used: upiId })
            });
            const data = await response.json();
            if (data.success) {
                setStep(3);
            } else {
                alert(data.error || 'Request failed');
            }
        } catch (error) {
            console.error('Request failed:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upgrade-page" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#1a202c' }}>Go Premium</h1>
                <p style={{ fontSize: '1.2rem', color: '#718096' }}>Unlock powerful tools for your growing business</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
                {/* Free Tier */}
                <div style={{ padding: '30px', border: '1px solid #e2e8f0', borderRadius: '15px', backgroundColor: '#f8fafc' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Normal</h2>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>₹0 <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#718096' }}>/year</span></div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={18} color="#48bb78" /> Basic Billing (Invoices)</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={18} color="#48bb78" /> Customer Management</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={18} color="#48bb78" /> Product & Inventory</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e0' }}>✘ Vendor Management</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e0' }}>✘ Expense Tracking</li>
                        <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e0' }}>✘ Multi-document support</li>
                    </ul>
                </div>

                {step === 1 && (
                    <div style={{
                        padding: '40px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        transform: 'scale(1.05)',
                        transition: 'all 0.3s'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.8rem' }}>Premium</h2>
                            <Star fill="currentColor" />
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px' }}>₹1000 <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#e2e8f0' }}>Lifetime</span></div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0' }}>
                            {[
                                "One-time Payment",
                                "Lifetime Access to All Features",
                                "Vendor Management",
                                "Expense Tracking & Analysis",
                                "Estimates & POs",
                                "Delivery Challans (DC)",
                                "GSTR-1 Reports",
                            ].map((item, idx) => (
                                <li key={idx} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Check size={14} /> {item}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => setStep(2)}
                            style={{
                                width: '100%',
                                padding: '15px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: 'white',
                                color: '#764ba2',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                cursor: 'pointer'
                            }}>
                            Buy Lifetime Access
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ padding: '30px', border: '2px solid #667eea', borderRadius: '20px', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '20px', color: '#4a5568' }}>Complete Payment</h2>

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '10px', flex: 1, textAlign: 'center' }}>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '5px' }}>Scan QR to Pay</p>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${upiId}&pn=Santo&am=1000&cu=INR`} alt="Payment QR" style={{ width: '120px', height: '120px' }} />
                            </div>
                            <div style={{ flex: 1.5 }}>
                                <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '5px' }}>UPI ID:</p>
                                <div style={{ backgroundColor: '#edf2f7', padding: '10px', borderRadius: '5px', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px' }}>{upiId}</div>
                                <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>Pay ₹1000 via Google Pay, PhonePe, or Paytm for Lifetime Access.</p>
                            </div>
                        </div>

                        <form onSubmit={handleRequestUpgrade}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px' }}>Transaction ID (Ref No.)</label>
                                <input
                                    type="text"
                                    required
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter 12-digit ID"
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}>
                                {loading ? 'Submitting...' : 'Submit Payment Proof'}
                            </button>
                            <button
                                onClick={() => setStep(1)}
                                style={{ width: '100%', background: 'none', border: 'none', color: '#718096', marginTop: '10px', cursor: 'pointer' }}>
                                Go Back
                            </button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ padding: '50px', backgroundColor: '#f0fff4', borderRadius: '20px', textAlign: 'center', gridColumn: 'span 2' }}>
                        <div style={{ width: '60px', height: '60px', backgroundColor: '#48bb78', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                            <Check color="white" size={32} />
                        </div>
                        <h2 style={{ marginBottom: '10px' }}>Request Submitted!</h2>
                        <p style={{ color: '#4a5568', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                            We are verifying your transaction <b>{transactionId}</b>. Your premium features will be unlocked within 2-4 hours.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{ padding: '12px 30px', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Shield color="#667eea" style={{ marginBottom: '10px' }} />
                    <h4 style={{ marginBottom: '5px' }}>Secure Data</h4>
                    <p style={{ fontSize: '0.9rem', color: '#718096' }}>Your financial data is encrypted and safe.</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Zap color="#667eea" style={{ marginBottom: '10px' }} />
                    <h4 style={{ marginBottom: '5px' }}>Instant Access</h4>
                    <p style={{ fontSize: '0.9rem', color: '#718096' }}>Unlock features immediately after payment.</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Star color="#667eea" style={{ marginBottom: '10px' }} />
                    <h4 style={{ marginBottom: '5px' }}>Premium Support</h4>
                    <p style={{ fontSize: '0.9rem', color: '#718096' }}>Priority email and chat assistance.</p>
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;
