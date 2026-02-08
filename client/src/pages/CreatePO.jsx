import React from 'react';
import DocumentEditor from '../components/DocumentEditor';

const CreatePO = () => {
    return (
        <DocumentEditor
            type="po"
            title="Purchase Order"
            entityLabel="Vendor"
            entityType="vendor"
            apiEndpoint="purchase-orders"
            redirectPath="/purchase-orders"
        />
    );
};

export default CreatePO;
