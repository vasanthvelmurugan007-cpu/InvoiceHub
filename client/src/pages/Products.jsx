import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', hsn_code: '', unit: 'pcs', price: '', tax_rate: '0', quantity: '0'
    });



    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.data) setProducts(data.data);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ name: '', description: '', hsn_code: '', unit: 'pcs', price: '', tax_rate: '0' });
                fetchProducts();
            }
        } catch (err) {
            console.error("Error adding product:", err);
        }
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-lg">
                <h1>Products / Inventory</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Product
                </button>
            </div>



            <div className="table-container card">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>HSN Code</th>
                            <th>Unit</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Tax (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-sm text-secondary">{product.description}</div>
                                </td>
                                <td>{product.hsn_code || '-'}</td>
                                <td>{product.unit}</td>
                                <td style={{ fontWeight: 'bold', color: (product.quantity || 0) < 5 ? '#e53e3e' : '#38a169' }}>
                                    {product.quantity || 0}
                                </td>
                                <td>₹{product.price}</td>
                                <td>{product.tax_rate}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Product">
                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <div>
                        <label>Product Name *</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label>Description</label>
                        <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="flex gap-md">
                        <div style={{ flex: 1 }}>
                            <label>HSN Code</label>
                            <input value={formData.hsn_code} onChange={e => setFormData({ ...formData, hsn_code: e.target.value })} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Unit</label>
                            <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                                <option value="pcs">Pieces (pcs)</option>
                                <option value="wm">Weight (kg)</option>
                                <option value="mtr">Meters (mtr)</option>
                                <option value="ltr">Liters (ltr)</option>
                                <option value="box">Box</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-md">
                        <div style={{ flex: 1 }}>
                            <label>Price (₹) *</label>
                            <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Tax Rate (%)</label>
                            <input type="number" step="0.1" value={formData.tax_rate} onChange={e => setFormData({ ...formData, tax_rate: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label>Opening Stock</label>
                        <input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-md mt-md">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Product</button>
                    </div>
                </form>
            </Modal>


        </div>
    );
};

export default Products;
