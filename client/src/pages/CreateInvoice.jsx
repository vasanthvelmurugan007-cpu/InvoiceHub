import React from 'react';
import DocumentEditor from '../components/DocumentEditor';

const CreateInvoice = () => {
    return (
        <DocumentEditor
            type="invoice"
            title="Invoice"
            entityLabel="Bill To"
            entityType="customer"
            apiEndpoint="invoices"
            redirectPath="/invoices"
        />
    );
};

export default CreateInvoice;
