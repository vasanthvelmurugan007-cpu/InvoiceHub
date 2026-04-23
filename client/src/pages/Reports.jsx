import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const Reports = () => {
    const [stats, setStats] = useState({ sales: 0, expenses: 0, unpaid: 0 });

    useEffect(() => {
        apiFetch('/api/reports/dashboard')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load reports');
                return res.json();
            })
            .then(data => setStats(data))
            .catch(err => console.error('Error loading reports:', err));
    }, []);

    const exportToExcel = async () => {
        try {
            const res = await apiFetch('/api/reports/gstr1');

            if (!res.ok) {
                const errData = await res.json();
                alert(errData.message || 'Failed to generate report');
                return;
            }

            const json = await res.json();

            const worksheet = XLSX.utils.json_to_sheet(json.data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "GSTR-1 Report");

            // Generate filename with date
            const dateStr = new Date().toISOString().slice(0, 7);
            XLSX.writeFile(workbook, `GSTR1_Report_${dateStr}.xlsx`);
        } catch (err) {
            alert('Error generating report: ' + err.message);
        }
    };

    return (
        <div className="page-container">
            <h1 className="mb-lg">Business Reports</h1>

            <div className="grid-3 gap-lg mb-xl">
                <div className="card report-card">
                    <div className="icon-bg blue"><TrendingUp size={24} /></div>
                    <div>
                        <p>Total Sales</p>
                        <h3>₹{stats.sales?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>
                <div className="card report-card">
                    <div className="icon-bg red"><TrendingDown size={24} /></div>
                    <div>
                        <p>Total Expenses</p>
                        <h3>₹{stats.expenses?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>
                <div className="card report-card">
                    <div className="icon-bg orange"><AlertCircle size={24} /></div>
                    <div>
                        <p>Unpaid Invoices</p>
                        <h3>{stats.unpaid}</h3>
                    </div>
                </div>
            </div>

            <div className="grid-2 gap-lg">
                <div className="card">
                    <h3>Compliance & GST</h3>
                    <p className="text-secondary mt-sm mb-lg">Generate GSTR-1 reports for easy tax filing in Excel format.</p>
                    <button className="btn btn-primary" onClick={exportToExcel} style={{ width: '100%' }}>
                        Download GSTR-1 (Excel)
                    </button>
                    <div className="mt-md p-md bg-gray-50 border rounded text-xs text-secondary">
                        <strong>Includes:</strong> B2B Invoices, B2C Large, Place of Supply, and Tax Breakups (IGST/CGST/SGST).
                    </div>
                </div>
                <div className="card">
                    <h3>Profit & Loss</h3>
                    <div className="flex justify-between mt-md border-bottom pb-sm">
                        <span>Total Income</span>
                        <span className="text-green">₹{(stats.sales || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mt-sm border-bottom pb-sm">
                        <span>Total Expense</span>
                        <span className="text-red">- ₹{(stats.expenses || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mt-md font-bold text-lg">
                        <span>Net Profit</span>
                        <span className={((stats.sales || 0) - (stats.expenses || 0)) >= 0 ? 'text-green' : 'text-red'}>
                            ₹{((stats.sales || 0) - (stats.expenses || 0)).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Reports;
