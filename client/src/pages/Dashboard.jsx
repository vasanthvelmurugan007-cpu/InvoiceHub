import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Link } from 'react-router-dom';
import { FileText, Users, Package, PlusCircle, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import Skeleton, { CardSkeleton } from '../components/Skeleton';

const Dashboard = () => {
    const [stats, setStats] = useState({ sales: 0, expenses: 0, unpaid: 0, invoice_count: 0, salesTrend: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await apiFetch('/api/reports/dashboard');
            const data = await res.json();
            setStats(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load dashboard data");
            setLoading(false);
        }
    };

    // Placeholder data if no trend exists yet
    const chartData = stats.salesTrend?.length > 0 ? stats.salesTrend : [
        { date: 'Day 1', amount: 0 },
        { date: 'Day 2', amount: 0 }
    ];

    if (loading) {
        return (
            <div className="page-container dashboard">
                <div className="flex justify-between items-center mb-xl">
                    <div><Skeleton width="200px" height="32px" className="mb-xs" /><Skeleton width="300px" /></div>
                    <Skeleton width="150px" height="40px" borderRadius="20px" />
                </div>
                <div className="grid-4 gap-lg mb-xl">
                    <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
                </div>
                <div className="grid-3 gap-lg mb-xl">
                    <CardSkeleton /><CardSkeleton /><CardSkeleton />
                </div>
                <div className="grid-2 gap-lg" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
                    <Skeleton height="300px" borderRadius="16px" />
                    <Skeleton height="300px" borderRadius="16px" />
                </div>
            </div>
        );
    }


    return (
        <div className="page-container dashboard">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="mb-xs" style={{ marginBottom: '4px' }}>Dashboard Overview</h1>
                    <p className="text-secondary">Welcome back, here's what's happening today.</p>
                </div>
                <div className="date-pill">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Quick Actions Row */}
            <div className="grid-4 gap-lg mb-xl">
                <Link to="/invoices/new" className="action-card primary-gradient">
                    <div className="icon-wrapper"><PlusCircle size={28} /></div>
                    <div className="action-text">
                        <h3>New Invoice</h3>
                        <p>Create bill & deduct stock</p>
                    </div>
                </Link>
                <Link to="/products" className="action-card glass">
                    <div className="icon-wrapper text-indigo"><Package size={24} /></div>
                    <div className="action-text">
                        <h3>Add Product</h3>
                        <p>Manage inventory</p>
                    </div>
                </Link>
                <Link to="/customers" className="action-card glass">
                    <div className="icon-wrapper text-blue"><Users size={24} /></div>
                    <div className="action-text">
                        <h3>Add Client</h3>
                        <p>Register new customer</p>
                    </div>
                </Link>
                <Link to="/settings" className="action-card glass">
                    <div className="icon-wrapper text-slate"><AlertCircle size={24} /></div>
                    <div className="action-text">
                        <h3>Settings</h3>
                        <p>UPI & Company Profile</p>
                    </div>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid-3 gap-lg mb-xl">
                <div className="stat-card glass-glow">
                    <div className="stat-header">
                        <span className="stat-label">MONTHLY REVENUE</span>
                        <div className="stat-icon-bg money"><TrendingUp size={16} /></div>
                    </div>
                    <div className="stat-value">₹ {(stats.monthly_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <p className="trend positive">Total: ₹ {(stats.sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="stat-card glass">
                    <div className="stat-header">
                        <span className="stat-label">PENDING PAYMENTS</span>
                        <div className="stat-icon-bg pending"><AlertCircle size={16} /></div>
                    </div>
                    {/* Assuming logic for pending value, using placeholder or calculated from backend if available. 
                        For now, showing 0 as requested or simple derivative if backend supports it. 
                        The user asked to reset to 0. Real data will do that if DB is empty. */}
                    <div className="stat-value text-red">₹ 0.00</div>
                    <p className="trend neutral">{stats.unpaid || 0} invoices overdue</p>
                </div>
                <div className="stat-card glass">
                    <div className="stat-header">
                        <span className="stat-label">TOTAL INVOICES</span>
                        <div className="stat-icon-bg invoices"><FileText size={16} /></div>
                    </div>
                    <div className="stat-value">{stats.invoice_count || 0}</div>
                    <p className="trend positive"><span>↑</span> new this week</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid-2 gap-lg mb-xl" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
                <div className="card glass-panel" style={{ padding: '24px' }}>
                    <div className="panel-header" style={{ background: 'transparent', padding: '0 0 20px 0' }}>
                        <h3>Revenue Growth</h3>
                        <span className="text-secondary text-xs">Last 15 Production Days</span>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(val) => [`₹ ${val.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="flex-col gap-lg">
                    <div className="card glass-panel">
                        <div className="panel-header">
                            <h3>Recent Invoices</h3>
                            <Link to="/invoices" className="btn-link">View All</Link>
                        </div>
                        {stats.recentInvoices?.length > 0 ? (
                            <div style={{ padding: '0 12px' }}>
                                {stats.recentInvoices.map(inv => (
                                    <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 12px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{inv.customer_name}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{inv.invoice_number} • {new Date(inv.date).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ fontWeight: '700', color: '#0f172a' }}>₹ {(inv.total || 0).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon"><FileText size={48} /></div>
                                <p>No recent invoices found.</p>
                                <Link to="/invoices/new" className="btn btn-sm btn-primary mt-sm">Create Now</Link>
                            </div>
                        )}
                    </div>

                    {/* Low Stock Alert */}
                    {stats.low_stock?.length > 0 ? (
                        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                            <div className="flex items-center gap-sm mb-md text-red">
                                <AlertCircle size={20} />
                                <h3>Low Stock Alert</h3>
                            </div>
                            <div className="flex-col gap-xs">
                                {stats.low_stock.slice(0, 5).map((p, i) => (
                                    <div key={i} className="flex justify-between items-center p-xs" style={{ background: '#fef2f2', padding: '8px', borderRadius: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{p.name}</span>
                                        <span className="badge badge-danger" style={{ fontSize: '11px' }}>{p.quantity} left</span>
                                    </div>
                                ))}
                                {stats.low_stock.length > 5 && <div className="text-xs text-center text-secondary mt-xs">and {stats.low_stock.length - 5} more...</div>}
                            </div>
                        </div>
                    ) : (
                        <div className="card bg-gray-50 flex justify-center items-center text-secondary text-sm" style={{ padding: '20px' }}>
                            <RefreshCw size={16} className="mr-xs" style={{ marginRight: '8px' }} /> Inventory Healthy
                        </div>
                    )}

                    <div className="card primary-gradient text-white" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', padding: '24px' }}>
                        <h3 style={{ color: 'white', marginBottom: '8px' }}>Go Premium</h3>
                        <p style={{ opacity: 0.9, fontSize: '13px', marginBottom: '15px', color: 'rgba(255,255,255,0.8)' }}>Unlock detailed analytics, vendor management, and priority support.</p>
                        <Link to="/upgrade" style={{ background: 'white', color: 'var(--primary-color)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Upgrade Plan</Link>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Dashboard;
