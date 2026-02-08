import React from 'react';
import DocumentList from '../components/DocumentList';

const Estimates = () => {
    return (
        <DocumentList
            title="Estimates"
            endpoint="estimates"
            createPath="/estimates/new"
            columns={['Estimate #', 'Date', 'Customer', 'Amount', 'Status']}
            mapRow={(est) => (
                <>
                    <td className="font-medium">{est.estimate_number}</td>
                    <td>{new Date(est.date).toLocaleDateString()}</td>
                    <td>{est.customer_name}</td>
                    <td>₹{est.total?.toFixed(2)}</td>
                    <td><span className="badge">{est.status}</span></td>
                </>
            )}
        />
    );
};

export default Estimates;
