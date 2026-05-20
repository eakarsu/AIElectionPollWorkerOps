import React from 'react';
import CrudPage from '../components/CrudPage';
import { precinctsApi } from '../services/api';

export default function PrecinctsPage() {
  return (
    <CrudPage
      title="Precincts"
      subtitle="All polling locations across the county."
      api={precinctsApi}
      statusKey="status"
      fields={[
        { key: 'precinct_id',       label: 'Precinct ID' },
        { key: 'name',              label: 'Name' },
        { key: 'ward',              label: 'Ward' },
        { key: 'address',           label: 'Address' },
        { key: 'registered_voters', label: 'Registered Voters', type: 'number' },
        { key: 'status',            label: 'Status', type: 'select', options: ['open','closed','staffing_short','equipment_issue','relocated'] },
        { key: 'notes',             label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
