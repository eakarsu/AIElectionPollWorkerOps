import React from 'react';
import CrudPage from '../components/CrudPage';
import { transmissionsApi } from '../services/api';

export default function TransmissionsPage() {
  return (
    <CrudPage
      title="Transmissions"
      subtitle="Results, audit batches and incident summaries sent upstream."
      api={transmissionsApi}
      statusKey="status"
      fields={[
        { key: 'tx_id',      label: 'TX ID' },
        { key: 'precinct_id',label: 'Precinct ID' },
        { key: 'type',       label: 'Type' },
        { key: 'sent_at',    label: 'Sent At', type: 'datetime-local' },
        { key: 'status',     label: 'Status', type: 'select', options: ['pending','sent','failed','retrying'] },
        { key: 'recipient',  label: 'Recipient' },
        { key: 'notes',      label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
