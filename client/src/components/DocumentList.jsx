import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Plus, Eye, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

const DocumentList = ({ title, endpoint, createPath, columns, mapRow }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        apiFetch(`/api/${endpoint}`)
            .then(res => {
                if (!res.ok) {
                    if (res.status === 403) return { data: [] }; // Premium feature locked
                    throw new Error('Failed to fetch');
                }
                return res.json();
            })
            .then(d => setItems(d.data || []))
            .catch(err => console.error(`Error fetching ${endpoint}:`, err));
    }, [endpoint]);

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-lg">
                <h1>{title}</h1>
                <Link to={createPath} className="btn btn-primary">
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    New {title}
                </Link>
            </div>

            <div className="card" style={{ padding: '0' }}>
                <table>
                    <thead>
                        <tr>
                            {columns.map(c => <th key={c}>{c}</th>)}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
                        ) : items.map((item, i) => (
                            <tr key={i}>
                                {mapRow(item)}
                                <td>
                                    <div className="flex gap-sm">
                                        <button className="icon-btn"><Eye size={18} /></button>
                                        <button className="icon-btn"><Printer size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`
                .icon-btn { padding: 4px; color: #64748b; }
                .icon-btn:hover { color: var(--primary-color); }
            `}</style>
        </div>
    );
};

export default DocumentList;
