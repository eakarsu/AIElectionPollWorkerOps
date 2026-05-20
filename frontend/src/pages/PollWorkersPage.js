import React from 'react';
import CrudPage from '../components/CrudPage';
import { pollWorkersApi } from '../services/api';

export default function PollWorkersPage() {
  return (
    <CrudPage
      title="Poll Workers"
      subtitle="Chief judges, clerks, greeters, interpreters and tech support."
      api={pollWorkersApi}
      statusKey="status"
      fields={[
        { key: 'worker_id',  label: 'Worker ID' },
        { key: 'name',       label: 'Name' },
        { key: 'role',       label: 'Role', type: 'select', options: ['chief_judge','clerk','greeter','interpreter','tech_support','ballot_judge'] },
        { key: 'precinct_id',label: 'Precinct ID' },
        { key: 'language',   label: 'Language' },
        { key: 'status',     label: 'Status', type: 'select', options: ['active','training','no_show','inactive'] },
        { key: 'notes',      label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
