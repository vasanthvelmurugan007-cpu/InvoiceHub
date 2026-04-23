import React from 'react';
import DocumentList from '../components/DocumentList';

const PurchaseOrders = () => {
    return (
        <DocumentList
            title="Purchase Orders"
            endpoint="purchase-orders"
            createPath="/purchase-orders/new"
            columns={['PO #', 'Date', 'Vendor', 'Amount', 'Status']}
            mapRow={(po) => (
                <>
                    <td className="font-medium">{po.po_number}</td>
                    <td>{new Date(po.date).toLocaleDateString()}</td>
                    <td>{po.vendor_name}</td>
                    <td>₹{(po.total || 0).toFixed(2)}</td>
                    <td><span className="badge">{po.status || 'Open'}</span></td>
                </>
            )}
        />
    );
};

export default PurchaseOrders;
