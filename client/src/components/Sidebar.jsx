import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, Settings, CreditCard, Star, LogOut, Truck, ClipboardList, ShoppingCart, Wallet, UserCog, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/invoices', icon: <FileText size={20} />, label: 'Invoices' },
        { path: '/customers', icon: <Users size={20} />, label: 'Customers' },
        { path: '/products', icon: <Package size={20} />, label: 'Products' },
        { path: '/vendors', icon: <Wallet size={20} />, label: 'Vendors', premium: true },
        { path: '/expenses', icon: <ShoppingCart size={20} />, label: 'Expenses', premium: true },
        { path: '/estimates', icon: <ClipboardList size={20} />, label: 'Estimates', premium: true },
        { path: '/purchase-orders', icon: <ShoppingCart size={20} />, label: 'Purchase Orders', premium: true },
        { path: '/delivery-challans', icon: <Truck size={20} />, label: 'Delivery Challans', premium: true },
        { path: '/reports', icon: <FileText size={20} />, label: 'Reports', premium: true },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    if (user?.role === 'Admin') {
        menuItems.push({ path: '/admin', icon: <UserCog size={20} />, label: 'Admin Control' });
    }

    const isPremium = user?.subscription_tier === 'Premium';

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

            {/* Header */}
            <div className="sidebar-header">
                <div className="brand">
                    <div className="logo-icon">I</div>
                    {!collapsed && (
                        <div>
                            <h2>InvoiceHub</h2>
                            <span className={`badge-edition ${isPremium ? 'premium' : 'free'}`}>
                                {isPremium ? 'PREMIUM' : 'FREE'}
                            </span>
                        </div>
                    )}
                </div>
                {/* Mobile Toggle would go here or handled via CSS media queries */}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-group">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const isLocked = item.premium && !isPremium;

                        return (
                            <Link
                                key={item.path}
                                to={isLocked ? '/upgrade' : item.path}
                                className={`nav-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                title={collapsed ? item.label : ''}
                            >
                                <span className="icon">{item.icon}</span>
                                {!collapsed && <span className="label">{item.label}</span>}
                                {!collapsed && isLocked && <span className="lock-badge">Pro</span>}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                {!isPremium && !collapsed && (
                    <Link to="/upgrade" className="upgrade-card">
                        <div className="upgrade-content">
                            <Star size={16} fill="currentColor" />
                            <span>Upgrade to Pro</span>
                        </div>
                    </Link>
                )}

                <div className="user-profile">
                    <div className="avatar">
                        {user?.username ? user.username[0].toUpperCase() : 'U'}
                    </div>
                    {!collapsed && (
                        <div className="user-info">
                            <div className="username">{user?.username}</div>
                            <div className="role">{user?.role}</div>
                        </div>
                    )}
                    <button onClick={logout} className="logout-btn" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <style>{`
                .sidebar {
                    width: 280px;
                    height: 100vh;
                    background: var(--bg-sidebar);
                    color: var(--slate-300);
                    display: flex;
                    flex-direction: column;
                    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-right: 1px solid rgba(255,255,255,0.05);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }

                .sidebar.collapsed {
                    width: 80px;
                }

                .sidebar-header {
                    padding: 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .logo-icon {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    color: white;
                    font-size: 20px;
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
                }

                .brand h2 {
                    font-size: 1.25rem;
                    color: white;
                    margin: 0;
                    font-weight: 700;
                    letter-spacing: -0.025em;
                }

                .badge-edition {
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: inline-block;
                    margin-top: 4px;
                }

                .badge-edition.premium { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
                .badge-edition.free { background: rgba(255, 255, 255, 0.1); color: #94a3b8; }

                .sidebar-nav {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                }

                .nav-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 8px;
                    color: var(--slate-400);
                    transition: all 0.2s;
                    font-weight: 500;
                    text-decoration: none;
                    position: relative;
                }

                .nav-item:hover {
                    background: rgba(255,255,255,0.05);
                    color: white;
                }

                .nav-item.active {
                    background: linear-gradient(90deg, rgba(79, 70, 229, 0.15) 0%, rgba(79, 70, 229, 0) 100%);
                    color: var(--primary-300);
                    border-left: 3px solid var(--primary-500);
                }

                .nav-item .icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .nav-item .lock-badge {
                    margin-left: auto;
                    font-size: 9px;
                    font-weight: bold;
                    background: rgba(255,255,255,0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    color: var(--slate-400);
                }

                .sidebar-footer {
                    padding: 20px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    background: rgba(0,0,0,0.2);
                }

                .upgrade-card {
                    display: block;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border-radius: 12px;
                    padding: 12px;
                    margin-bottom: 20px;
                    color: white;
                    text-align: center;
                    font-weight: 700;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                    transition: transform 0.2s;
                }
                
                .upgrade-card:hover { transform: translateY(-2px); }

                .upgrade-content { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.875rem; }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: var(--primary-600);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.125rem;
                }

                .user-info {
                    flex: 1;
                    min-width: 0;
                }

                .username {
                    font-weight: 600;
                    color: white;
                    font-size: 0.9rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .role {
                    font-size: 0.75rem;
                    color: var(--slate-500);
                }

                .logout-btn {
                    color: var(--slate-500);
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .logout-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
