import React, { useState, useEffect } from 'react';
import { Plus, Phone, MapPin } from 'lucide-react';
import Modal from '../components/Modal';

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '', contact_person: '', email: '', phone: '', address: '', gstin: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/vendors', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            if (!res.ok) {
                if (res.status === 403) return { data: [] }; // Premium feature locked
                throw new Error('Failed to fetch vendors');
            }
            return res.json();
        }).then(d => setVendors(d.data || []))
        .catch(err => console.error("Error fetching vendors:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await fetch('/api/vendors', {
            method: 'POST', body: JSON.stringify(formData), headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        setIsModalOpen(false);
        setFormData({ company_name: '', contact_person: '', email: '', phone: '', address: '', gstin: '' });
        // Refresh
        fetch('/api/vendors', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()).then(d => setVendors(d.data || []));
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center w-full gap-xl mb-xl">
                <h1 style={{ margin: 0 }}>Vendors</h1>
                <button className="btn btn-primary shrink-0" onClick={() => setIsModalOpen(true)}>
                    <div className="flex items-center gap-sm">
                        <Plus size={18} />
                        <span>Add Vendor</span>
                    </div>
                </button>
            </div>

            <div className="grid-3 gap-md">
                {vendors.map(v => (
                    <div key={v.id} className="card">
                        <h3 className="mb-sm">{v.company_name}</h3>
                        <p className="text-sm text-secondary mb-md font-medium">{v.contact_person}</p>

                        <div className="flex flex-col gap-xs text-sm text-secondary">
                            <div className="flex items-center gap-sm">
                                <Phone size={14} className="text-secondary" />
                                <span>{v.phone || 'No Phone'}</span>
                            </div>
                            <div className="flex items-center gap-sm">
                                <MapPin size={14} className="text-secondary" />
                                <span>{v.address || 'No Address'}</span>
                            </div>
                            {v.gstin && (
                                <div className="mt-sm">
                                    <span className="badge badge-info flex items-center gap-xs" style={{ width: 'fit-content' }}>
                                        GST: {v.gstin}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Vendor">
                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <input placeholder="Company Name *" required value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
                    <input placeholder="Contact Person" value={formData.contact_person} onChange={e => setFormData({ ...formData, contact_person: e.target.value })} />
                    <input placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    <input placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <input placeholder="GSTIN" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} />
                    <textarea placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    <button type="submit" className="btn btn-primary">Save Vendor</button>
                </form>
            </Modal>

        </div>
    );
};

export default Vendors;
