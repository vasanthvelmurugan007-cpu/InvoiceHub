import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Printer, Eye, Trash2, MessageCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Skeleton, { TableSkeleton } from '../components/Skeleton';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            if (data.data) setInvoices(data.data);
        } catch (err) {
            console.error("Error fetching invoices:", err);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this invoice?")) return;
        const toastId = toast.loading("Deleting invoice...");
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/invoices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setInvoices(invoices.filter(i => i.id !== id));
                toast.success("Invoice deleted successfully", { id: toastId });
            } else {
                toast.error("Failed to delete invoice", { id: toastId });
            }
        } catch (err) {
            console.error("Delete failed", err);
            toast.error("Error deleting invoice", { id: toastId });
        }
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-lg">
                <h1>Invoices</h1>
                <Link to="/invoices/new" className="btn btn-primary">
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    New Invoice
                </Link>
            </div>

            {loading ? <TableSkeleton rows={8} /> : (
                <div className="table-container card">
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                    {error ? 'No invoices to display due to error.' : 'No invoices found. Create one to get started.'}
                                </td></tr>
                            ) : invoices.map(inv => (
                                <tr key={inv.id}>
                                    <td className="font-medium">{inv.invoice_number}</td>
                                    <td>{new Date(inv.date).toLocaleDateString()}</td>
                                    <td>{inv.customer_name || 'Unknown'}</td>
                                    <td className="font-medium">₹{inv.total.toFixed(2)}</td>
                                    <td><span className={`status-badge ${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <button className="icon-btn" title="View"><Eye size={18} /></button>
                                            <button className="icon-btn" title="Print"><Printer size={18} /></button>

                                            <button
                                                className="icon-btn"
                                                title="Share on WhatsApp"
                                                onClick={() => {
                                                    const msg = `Hello ${inv.customer_name}, your invoice #${inv.invoice_number} for ₹${inv.total.toFixed(2)} is generated. Please pay by ${new Date(inv.date).toLocaleDateString()}.`;
                                                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                                                }}
                                                style={{ color: '#16a34a' }}
                                            >
                                                <MessageCircle size={18} />
                                            </button>

                                            <button
                                                className="icon-btn"
                                                title="Email Invoice"
                                                onClick={() => {
                                                    const subject = `Invoice ${inv.invoice_number} from MyCompany`;
                                                    const body = `Dear ${inv.customer_name},\n\nPlease find attached invoice #${inv.invoice_number} for ₹${inv.total.toFixed(2)}.\n\nThank you.`;
                                                    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                                                }}
                                                style={{ color: '#2563eb' }}
                                            >
                                                <Mail size={18} />
                                            </button>

                                            <button className="icon-btn" title="Delete" onClick={() => handleDelete(inv.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


        </div>
    );
};

export default Invoices;
