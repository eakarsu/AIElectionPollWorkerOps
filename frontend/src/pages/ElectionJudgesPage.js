import React from 'react';
import CrudPage from '../components/CrudPage';
import { electionJudgesApi } from '../services/api';

export default function ElectionJudgesPage() {
  return (
    <CrudPage
      title="Election Judges"
      subtitle="Certified judges, party affiliation and assignments."
      api={electionJudgesApi}
      statusKey="status"
      fields={[
        { key: 'judge_id',         label: 'Judge ID' },
        { key: 'name',             label: 'Name' },
        { key: 'precinct_id',      label: 'Precinct ID' },
        { key: 'party_affiliation',label: 'Party', type: 'select', options: ['D','R','I','G','L','Other'] },
        { key: 'certifications',   label: 'Certifications' },
        { key: 'status',           label: 'Status', type: 'select', options: ['active','training','inactive'] },
        { key: 'notes',            label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
