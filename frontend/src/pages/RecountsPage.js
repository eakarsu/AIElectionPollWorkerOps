import React from 'react';
import CrudPage from '../components/CrudPage';
import { recountsApi } from '../services/api';

export default function RecountsPage() {
  return (
    <CrudPage
      title="Recounts"
      subtitle="Requested and in-progress recounts by race."
      api={recountsApi}
      statusKey="status"
      fields={[
        { key: 'recount_id',  label: 'Recount ID' },
        { key: 'race',        label: 'Race' },
        { key: 'precinct_id', label: 'Precinct ID' },
        { key: 'status',      label: 'Status', type: 'select', options: ['requested','in_progress','completed','cancelled'] },
        { key: 'started_at',  label: 'Started At', type: 'datetime-local' },
        { key: 'ended_at',    label: 'Ended At', type: 'datetime-local' },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
