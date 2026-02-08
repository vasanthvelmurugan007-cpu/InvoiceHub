import React from 'react';
import DocumentEditor from '../components/DocumentEditor';

const CreateEstimate = () => {
    return (
        <DocumentEditor
            type="estimate"
            title="Estimate"
            entityLabel="Bill To"
            entityType="customer"
            apiEndpoint="estimates"
            redirectPath="/estimates"
        />
    );
};

export default CreateEstimate;
