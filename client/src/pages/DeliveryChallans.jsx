import React from 'react';
import DocumentList from '../components/DocumentList';

const DeliveryChallans = () => {
    return (
        <DocumentList
            title="Delivery Challans"
            endpoint="delivery-challans"
            createPath="/delivery-challans/new"
            columns={['DC #', 'Date', 'Customer', 'Vehicle No', 'Mode']}
            mapRow={(dc) => (
                <>
                    <td className="font-medium">{dc.dc_number}</td>
                    <td>{new Date(dc.date).toLocaleDateString()}</td>
                    <td>{dc.customer_name}</td>
                    <td>{dc.vehicle_number || '-'}</td>
                    <td>{dc.transport_mode}</td>
                </>
            )}
        />
    );
};

export default DeliveryChallans;
