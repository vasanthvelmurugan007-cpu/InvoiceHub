import React from 'react';
import DocumentEditor from '../components/DocumentEditor';

const CreateChallan = () => {
    return (
        <DocumentEditor
            type="dc"
            title="Delivery Challan"
            entityLabel="Consignee"
            entityType="customer"
            apiEndpoint="delivery-challans"
            redirectPath="/delivery-challans"
        />
    );
};

export default CreateChallan;
