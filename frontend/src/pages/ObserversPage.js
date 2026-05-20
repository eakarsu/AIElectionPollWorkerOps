import React from 'react';
import CrudPage from '../components/CrudPage';
import { observersApi } from '../services/api';

export default function ObserversPage() {
  return (
    <CrudPage
      title="Observers"
      subtitle="Accredited observers from parties, civil-rights orgs and press."
      api={observersApi}
      statusKey="status"
      fields={[
        { key: 'observer_id',  label: 'Observer ID' },
        { key: 'name',         label: 'Name' },
        { key: 'org',          label: 'Organization' },
        { key: 'precinct_id',  label: 'Precinct ID' },
        { key: 'accredited_at',label: 'Accredited At', type: 'datetime-local' },
        { key: 'status',       label: 'Status', type: 'select', options: ['pending','accredited','press_pass','revoked'] },
        { key: 'notes',        label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
