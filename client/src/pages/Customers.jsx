import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, MapPin, FileText, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', gstin: '', state: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/customers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.data) setCustomers(data.data);
        } catch (err) {
            console.error("Error fetching customers:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this customer?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/customers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setCustomers(customers.filter(c => c.id !== id));
            } else {
                alert("Failed to delete customer");
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ name: '', email: '', phone: '', address: '', gstin: '', state: '' });
                fetchCustomers();
            }
        } catch (err) {
            console.error("Error adding customer:", err);
        }
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-lg">
                <h1>Customers</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Customer
                </button>
            </div>

            <div className="grid-container">
                {customers.map(customer => (
                    <div key={customer.id} className="card customer-card">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 style={{ marginBottom: '4px' }}>{customer.name}</h3>
                                {customer.gstin && <span className="badge">GST: {customer.gstin}</span>}
                            </div>
                            <button onClick={() => handleDelete(customer.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Delete Customer">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="customer-details">
                            <p><Phone size={14} /> {customer.phone || 'N/A'}</p>
                            <p><MapPin size={14} /> {customer.address || 'N/A'}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Customer">
                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <div>
                        <label>Company/Name *</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="flex gap-md">
                        <div style={{ flex: 1 }}>
                            <label>Phone</label>
                            <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Email</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label>Address</label>
                        <textarea rows="2" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                    <div className="flex gap-md">
                        <div style={{ flex: 1 }}>
                            <label>GSTIN</label>
                            <input value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>State</label>
                            <input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-md mt-md">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Customer</button>
                    </div>
                </form>
            </Modal>


        </div>
    );
};

export default Customers;
