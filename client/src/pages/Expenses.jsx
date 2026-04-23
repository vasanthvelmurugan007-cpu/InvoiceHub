import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: '', amount: '', date: new Date().toISOString().split('T')[0], description: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/expenses', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            if (!res.ok) {
                if (res.status === 403) return { data: [] }; // Premium feature locked
                throw new Error('Failed to fetch expenses');
            }
            return res.json();
        }).then(d => setExpenses(d.data || []))
        .catch(err => console.error("Error fetching expenses:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await fetch('/api/expenses', {
            method: 'POST', body: JSON.stringify(formData), headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        setIsModalOpen(false);
        setFormData({ category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
        fetch('/api/expenses', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()).then(d => setExpenses(d.data || []));
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-lg">
                <h1>Expenses</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Expense
                </button>
            </div>

            <div className="table-container card">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(exp => (
                            <tr key={exp.id}>
                                <td>{new Date(exp.date).toLocaleDateString()}</td>
                                <td><span className="badge">{exp.category}</span></td>
                                <td>{exp.description}</td>
                                <td className="font-medium">₹{exp.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Expense">
                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        <option value="">Select Category</option>
                        <option value="Rent">Rent</option>
                        <option value="Salaries">Salaries</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Travel">Travel</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="number" placeholder="Amount" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                    <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    <button type="submit" className="btn btn-primary">Save Expense</button>
                </form>
            </Modal>
        </div>
    );
};

export default Expenses;
