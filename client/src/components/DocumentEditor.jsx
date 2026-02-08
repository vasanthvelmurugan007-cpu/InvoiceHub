import React, { useState, useEffect } from 'react';
import { Plus, Save, Printer, Trash2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const numberToWords = (num) => {
    if (isNaN(num) || num === null || num === undefined) return '';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((num = Math.round(num).toString()).length > 9) return 'Amount Too Large';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() + ' Only';
};

const DocumentEditor = ({ type, title, entityLabel, entityType, apiEndpoint, redirectPath }) => {
    const navigate = useNavigate();

    // Data State
    const [entities, setEntities] = useState([]);
    const [products, setProducts] = useState([]);
    const [settings, setSettings] = useState({});

    // Editable Template State
    const [sender, setSender] = useState({ name: '', address: '', email: '', gstin: '', phone: '' });
    const [recipient, setRecipient] = useState({ name: '', address: '', gstin: '', state: '' });
    const [footerInfo, setFooterInfo] = useState({ bank_details: '', terms: '' });

    // Transaction State
    const [entityId, setEntityId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [referenceNo, setReferenceNo] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [customFieldValue, setCustomFieldValue] = useState('');
    const [items, setItems] = useState([]);

    const isDC = type === 'dc';

    // Initial Data Fetch
    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const entityEndpoint = entityType === 'vendor' ? 'vendors' : 'customers';

        fetch(`/api/${entityEndpoint}`, { headers }).then(res => res.json()).then(d => setEntities(d.data || []));
        fetch('/api/products', { headers }).then(res => res.json()).then(d => setProducts(d.data || []));
        fetch('/api/settings', { headers }).then(res => res.json()).then(d => {
            const s = d.data || {};
            setSettings(s);
            // Default Sender Info from Settings or Empty for New Users
            setSender({
                name: s.company_name || '',
                address: s.address || '',
                email: s.email || '',
                gstin: s.gstin || '',
                phone: s.phone || ''
            });
            // Default Footer Info
            setFooterInfo({
                bank_details: s.bank_details || '',
                terms: s.terms || ''
            });
        });
    }, [entityType, apiEndpoint]);

    const autoSaveLogo = async (logoData) => {
        const token = localStorage.getItem('token');
        const updatedSettings = { ...settings, logo_url: logoData };
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedSettings)
            });
            setSettings(updatedSettings);
        } catch (error) {
            console.error('Failed to auto-save logo', error);
        }
    };

    // When Customer/Vendor Selected, Update Recipient
    useEffect(() => {
        const entity = entities.find(e => e.id == entityId);
        if (entity) {
            setRecipient({
                name: entity.name || entity.company_name,
                address: entity.address || '',
                gstin: entity.gstin || '',
                state: entity.state || '' // Important for GST
            });
        } else {
            setRecipient({ name: '', address: '', gstin: '', state: '' });
        }
    }, [entityId, entities]);

    const isInterState = settings.state && recipient.state &&
        settings.state.toLowerCase() !== recipient.state.toLowerCase();

    // Calculations
    let subtotal = 0;
    let totalTax = 0;

    const calculatedItems = items.map(item => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const taxRate = parseFloat(item.tax_rate) || 0;
        const amount = qty * price;
        const taxAmount = amount * (taxRate / 100);

        subtotal += amount;
        totalTax += taxAmount;
        return { ...item, amount, taxAmount };
    });

    const total = subtotal + totalTax;

    const handlePrint = () => window.print();

    const handleWhatsAppShare = () => {
        if (!sender.phone && !recipient.phone) return alert("Please ensure both your phone and customer phone are saved.");

        let msg = `*INVOICE: ${referenceNo || 'DRAFT'}* \n`;
        msg += `Date: ${new Date(date).toLocaleDateString()} \n`;
        msg += `To: ${recipient.name} \n`;
        msg += `Amount: *₹${total.toFixed(2)}* \n\n`;
        msg += `Please find your invoice details attached. Thank you for your business! \n`;
        msg += `- ${sender.name}`;

        const phone = (recipient.phone || '').replace(/[^0-9]/g, ''); // Clean phone
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const handleThermalPrint = () => {
        document.body.classList.add('thermal-mode');
        window.print();
        document.body.classList.remove('thermal-mode');
    };

    const addItem = () => setItems([...items, { id: Date.now(), product_id: '', product_name: '', hsn_code: '', quantity: 1, unit: 'pcs', price: 0, tax_rate: 0, amount: 0 }]);

    const updateItem = (index, field, value) => {
        setItems(prevItems => {
            const newItems = [...prevItems];
            newItems[index] = { ...newItems[index], [field]: value };

            if (field === 'product_id') {
                const product = products.find(p => p.id == value);
                if (product) {
                    newItems[index].product_name = product.name;
                    newItems[index].hsn_code = product.hsn_code;
                    newItems[index].unit = product.unit;
                    newItems[index].price = product.price;
                    newItems[index].tax_rate = product.tax_rate;
                }
            }
            return newItems;
        });
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!entityId) return alert('Select Entity');
        if (items.length === 0) return alert('Add Items');

        const data = {
            [entityType === 'vendor' ? 'vendor_id' : 'customer_id']: entityId,
            invoice_number: referenceNo || undefined, // Allow server to generate if blank
            date,
            items: calculatedItems,
            custom_field_value: customFieldValue
        };

        if (type === 'invoice') {
            data.po_number = referenceNo;
            data.vehicle_number = vehicleNo;
        }
        data.subtotal = subtotal; data.tax_total = totalTax; data.total = total;

        try {
            const token = localStorage.getItem('token');

            // 1. Sync profile details to settings
            const syncData = {
                ...settings,
                company_name: sender.name,
                address: sender.address,
                gstin: sender.gstin,
                bank_details: footerInfo.bank_details,
                terms: footerInfo.terms
            };
            await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(syncData)
            });

            // 2. Save the transaction document
            const response = await fetch(`/api/${apiEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert(`${title} saved successfully!`);
                navigate(redirectPath);
            } else {
                const err = await response.json();
                alert(`Error: ${err.error || 'Failed to save record'}`);
            }
        } catch (err) {
            console.error("Save process failed:", err);
            alert("An unexpected error occurred while saving. Please check your connection.");
        }
    };

    return (
        <div className="page-container">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-lg no-print">
                <div className="flex items-center gap-md">
                    <h1 className="text-xl font-bold">New {title}</h1>
                    <span className="text-sm text-secondary bg-gray-100 px-2 py-1 rounded">Draft Mode</span>
                </div>
                <div className="flex gap-sm">
                    <button className="btn btn-secondary" onClick={handleWhatsAppShare} style={{ color: '#16a34a', borderColor: '#16a34a' }}>
                        <Upload size={18} style={{ marginRight: '8px' }} /> WhatsApp
                    </button>
                    <button className="btn btn-secondary" onClick={handleThermalPrint} title="Thermal Receipt Print">
                        <Printer size={18} /> <span style={{ fontSize: '12px', marginLeft: '4px' }}>Thermal</span>
                    </button>
                    <button className="btn btn-secondary" onClick={handlePrint}>
                        <Printer size={18} style={{ marginRight: '8px' }} /> Print A4
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        <Save size={18} style={{ marginRight: '8px' }} /> Save Record
                    </button>
                </div>
            </div>

            {/* Selection Inputs (Hidden on Print) */}
            <div className="grid-4 gap-md mb-lg no-print p-md bg-gray-50 border rounded">
                <div><label className="text-xs font-bold text-secondary">SELECT {entityType === 'vendor' ? 'VENDOR' : 'CUSTOMER'}</label><select className="input-field mt-xs" value={entityId} onChange={e => setEntityId(e.target.value)}><option value="">Select {entityType === 'vendor' ? 'Vendor' : 'Customer'}</option>{entities.map(e => <option key={e.id} value={e.id}>{e.name || e.company_name}</option>)}</select></div>
                <div><label className="text-xs font-bold text-secondary">DATE</label><input type="date" className="input-field mt-xs" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div><label className="text-xs font-bold text-secondary">REFERENCE NO</label><input className="input-field mt-xs" value={referenceNo} onChange={e => setReferenceNo(e.target.value)} placeholder="PO / Ref No" /></div>
                <div><label className="text-xs font-bold text-secondary">VEHICLE NO</label><input className="input-field mt-xs" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} placeholder="MH-12-AB-1234" /></div>
            </div>

            {/* A4 Paper */}
            <div className="invoice-paper">
                {/* 1. Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
                    <div style={{ width: '55%' }}>
                        <div
                            className="no-print"
                            style={{ position: 'relative', cursor: 'pointer', marginBottom: '25px', width: 'fit-content' }}
                            title="Click to Change Logo"
                            onClick={() => document.getElementById('logo-upload-editor').click()}
                        >
                            <input
                                type="file"
                                id="logo-upload-editor"
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => autoSaveLogo(reader.result);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {settings.logo_url && <img src={settings.logo_url} alt="Logo" style={{ maxHeight: '100px', maxWidth: '300px', objectFit: 'contain' }} />}
                            {(!settings.logo_url || settings.logo_url === '/logo.png') && (
                                <div style={{ border: '1px dashed #cbd5e1', padding: '10px 20px', borderRadius: '8px', background: '#f8fafc', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Upload size={14} /> Upload Your Logo
                                </div>
                            )}
                            <div className="hover-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                                <span style={{ fontSize: '10px', color: 'var(--primary-color)', fontWeight: 'bold' }}>Change Logo</span>
                            </div>
                        </div>

                        <div className="print-only">
                            {settings.logo_url && <img src={settings.logo_url} alt="Logo" style={{ maxHeight: '100px', maxWidth: '300px', marginBottom: '25px', objectFit: 'contain' }} />}
                        </div>
                        <textarea
                            className="edit-h1 no-print"
                            style={{ fontSize: '26px', color: '#0f172a', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px', resize: 'none', height: 'auto', minHeight: '40px', overflow: 'hidden' }}
                            value={sender.name}
                            onChange={e => {
                                setSender({ ...sender, name: e.target.value });
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            placeholder="YOUR COMPANY NAME"
                            rows={1}
                        />
                        <div
                            className="print-only"
                            style={{ fontSize: '26px', color: '#0f172a', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px', whiteSpace: 'pre-wrap', lineHeight: '1.2' }}
                        >
                            {sender.name}
                        </div>
                        <textarea
                            className="edit-p"
                            style={{ fontSize: '14px', lineHeight: '1.6', minHeight: '80px', color: '#64748b' }}
                            value={sender.address}
                            onChange={e => setSender({ ...sender, address: e.target.value })}
                            placeholder="Business Address, City, State, Zip&#10;Phone: +91-0000000000&#10;Email: info@yourcompany.com"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>GSTIN:</span>
                            <input
                                className="edit-inline"
                                style={{ width: '200px', fontWeight: '600', color: '#334155', fontSize: '14px', textAlign: 'left' }}
                                value={sender.gstin}
                                onChange={e => setSender({ ...sender, gstin: e.target.value })}
                                placeholder="29XXXXX0000X0Z0"
                            />
                        </div>
                    </div>
                    <div style={{ width: '40%', textAlign: 'right' }}>
                        <h2 style={{ fontSize: '11px', color: '#1e40af', fontWeight: '800', margin: '0 0 15px 0', letterSpacing: '2.5px', textTransform: 'uppercase' }}>INVOICE DETAILS</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 15px', borderRadius: '6px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Invoice No</span>
                                <input
                                    className="edit-inline"
                                    style={{ width: '100px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a', fontSize: '16px' }}
                                    value={referenceNo || '#001'}
                                    onChange={e => setReferenceNo(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 15px', borderRadius: '6px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Date Issued</span>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{new Date(date).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 15px', borderRadius: '6px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Customer ID</span>
                                <input
                                    className="edit-inline"
                                    style={{ width: '100px', textAlign: 'right', fontWeight: '600', color: '#334155', fontSize: '14px' }}
                                    value={entityId || '-'}
                                    onChange={e => setEntityId(e.target.value)}
                                />
                            </div>
                            {settings.custom_field_label && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 15px', borderRadius: '6px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{settings.custom_field_label}</span>
                                    <input
                                        className="edit-inline"
                                        style={{ width: '120px', textAlign: 'right', fontWeight: '600', color: '#334155' }}
                                        value={customFieldValue}
                                        onChange={e => setCustomFieldValue(e.target.value)}
                                        placeholder="Enter details"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Bill To Section */}
                <div style={{ marginBottom: '50px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{
                        fontSize: '11px', fontWeight: '800', color: '#1e40af', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '15px'
                    }}>
                        Billed To
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <input className="edit-h3" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }} value={recipient.name} onChange={e => setRecipient({ ...recipient, name: e.target.value })} placeholder="Client Name" />
                            <textarea className="edit-p" rows="3" style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }} value={recipient.address} onChange={e => setRecipient({ ...recipient, address: e.target.value })} placeholder="Billing Address&#10;City, State, Zip" />
                        </div>
                        <div style={{ width: '250px' }}>
                            <div style={{ marginBottom: '6px', fontSize: '13px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: '500' }}>GSTIN</span>
                                <input className="edit-inline" style={{ width: '140px', textAlign: 'right', fontWeight: '600', color: '#334155' }} value={recipient.gstin} onChange={e => setRecipient({ ...recipient, gstin: e.target.value })} placeholder="-" />
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: '500' }}>State</span>
                                <span style={{ fontWeight: '600', color: '#334155' }}>{recipient.state || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Items Table */}
                <div style={{ marginBottom: '40px' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #3b82f6', borderRight: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '800', width: '35%' }}>DESCRIPTION</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #3b82f6', borderRight: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '800', width: '10%' }}>HSN/SAC</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #3b82f6', borderRight: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '800', width: '10%' }}>QTY</th>
                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #3b82f6', borderRight: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '800', width: '15%' }}>PRICE</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #3b82f6', borderRight: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '800', width: '10%' }}>TAX %</th>
                                <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '2px solid #3b82f6', color: '#1e293b', fontWeight: '800', width: '20%' }}>AMOUNT</th>
                                <th className="no-print" style={{ width: '30px', borderBottom: '2px solid #3b82f6' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {calculatedItems.map((item, i) => (
                                <tr key={item.id || i}>
                                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #f1f5f9' }}>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                className="table-input"
                                                style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px', marginBottom: '4px' }}
                                                value={item.product_name}
                                                onChange={e => updateItem(i, 'product_name', e.target.value)}
                                                placeholder="Item Name"
                                                list={`product-list-${i}`}
                                            />
                                            <datalist id={`product-list-${i}`}>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.name}>{p.name} - ₹{p.price}</option>
                                                ))}
                                            </datalist>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #f1f5f9' }}>
                                        <input
                                            className="table-input"
                                            style={{ textAlign: 'center', color: '#64748b' }}
                                            value={item.hsn_code || ''}
                                            onChange={e => updateItem(i, 'hsn_code', e.target.value)}
                                            placeholder="-"
                                        />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #f1f5f9' }}>
                                        <input
                                            type="number"
                                            step="any"
                                            className="table-input-active"
                                            style={{ textAlign: 'center', fontWeight: '800', color: '#1e293b', background: '#f8fafc', padding: '6px 4px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                                            value={item.quantity}
                                            onChange={e => updateItem(i, 'quantity', e.target.value)}
                                        />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #f1f5f9' }}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="table-input"
                                            style={{ textAlign: 'right', color: '#334155' }}
                                            value={item.price}
                                            onChange={e => updateItem(i, 'price', e.target.value)}
                                        />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #f1f5f9' }}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="table-input"
                                            style={{ textAlign: 'center', fontWeight: '600', color: '#64748b', background: '#f1f5f9', borderRadius: '4px', padding: '2px' }}
                                            value={item.tax_rate}
                                            onChange={e => updateItem(i, 'tax_rate', e.target.value)}
                                        />
                                    </td>
                                    <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
                                        {item.amount.toFixed(2)}
                                    </td>
                                    <td className="no-print" style={{ padding: '12px 0', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                        <button onClick={() => removeItem(i)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }} title="Remove Item">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {[...Array(Math.max(0, 2 - items.length))].map((_, i) => (
                                <tr key={`empty-${i}`} style={{ borderBottom: '1px solid #f1f5f9' }}><td colSpan="7" style={{ height: '70px' }}></td></tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="no-print mt-4"><button className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Line Item</button></div>
                </div>

                {/* 4. Footer Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '40px' }}>

                    {/* Left Column */}
                    <div style={{ width: '50%' }}>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Total In Words</div>
                            <div style={{ fontSize: '15px', fontWeight: '500', color: '#334155', fontStyle: 'italic', lineHeight: '1.4' }}>
                                {numberToWords(total)}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Bank Details</div>
                            <textarea className="edit-p" rows="4" style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }} value={footerInfo.bank_details} onChange={e => setFooterInfo({ ...footerInfo, bank_details: e.target.value })} placeholder="Bank Name: Your Bank&#10;A/C: 0000000000&#10;IFSC: ABCD0123456" />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Terms & Notes</div>
                            <textarea className="edit-p" rows="3" style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }} value={footerInfo.terms} onChange={e => setFooterInfo({ ...footerInfo, terms: e.target.value })} placeholder="Thank you for doing business with us.&#10;Payment is due within 15 days." />
                        </div>
                    </div>

                    {/* Right Column: Totals */}
                    <div style={{ width: '40%' }}>
                        <div style={{ padding: '0 0 20px', borderBottom: '2px dashed #e2e8f0', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                                <span>Subtotal</span>
                                <span style={{ fontWeight: '500', color: '#334155' }}>{subtotal.toFixed(2)}</span>
                            </div>

                            {/* Dynamic Tax Split */}
                            {isInterState ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                                    <span>IGST</span>
                                    <span style={{ fontWeight: '500', color: '#334155' }}>{totalTax.toFixed(2)}</span>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                                        <span>CGST</span>
                                        <span style={{ fontWeight: '500', color: '#334155' }}>{(totalTax / 2).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                                        <span>SGST</span>
                                        <span style={{ fontWeight: '500', color: '#334155' }}>{(totalTax / 2).toFixed(2)}</span>
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                                <span>Total Tax</span>
                                <span style={{ fontWeight: '500', color: '#334155' }}>{totalTax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Total Due</span>
                            <span style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>₹ {Math.round(total).toFixed(2)}</span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            {settings.signature_url && (
                                <img src={settings.signature_url} alt="Sig" style={{ height: '50px', maxWidth: '100%', marginBottom: '10px' }} />
                            )}
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Authorized Signature
                            </div>
                        </div>
                    </div>
                </div>

                {/* Branding Footer line */}
                <div className="mt-12 text-center text-xs text-slate-300 no-print" style={{ paddingTop: '20px' }}> Generated by InvoiceHub </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                .invoice-paper {
                    width: 210mm;
                    min-height: 297mm;
                    background: white;
                    padding: 20mm;
                    margin: 0 auto;
                    box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.1);
                    font-family: 'Inter', sans-serif;
                    color: #0f172a;
                    position: relative;
                }
                
                /* Input Styles */
                .edit-h1, .edit-h3, .edit-p, .edit-inline, .table-input, .table-input-active { border: none; background: transparent; outline: none; width: 100%; font-family: inherit; }
                .table-input-active { transition: all 0.2s; }
                .table-input-active:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
                .edit-p { resize: none; overflow: hidden; }
                .edit-inline { border-bottom: 1px dashed #cbd5e0; transition: border 0.2s; padding: 0 4px; }
                .edit-inline:focus { border-bottom: 1px solid #0f172a; }
                
                /* Table Print Optimization */
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
                tfoot { display: table-row-group; }
                
                .print-only { display: none; }

                @media print {
                    @page { size: A4; margin: 0; }
                    body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; background: white; }
                    .page-container { padding: 0; display: block; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    
                    /* Reset Container for Print Flow */
                    .invoice-paper { 
                        box-shadow: none; 
                        margin: 0; 
                        width: 100%; 
                        height: auto; 
                        padding: 15mm; /* Slightly reduced margins for print safety */
                        overflow: visible;
                    }
                    
                    /* Ensure text colors are dark for readability */
                    input, textarea, select { color: #000 !important; }
                }
            `}</style>
        </div>
    );
};

export default DocumentEditor;
