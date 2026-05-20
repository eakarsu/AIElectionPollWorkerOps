import React from 'react';
import CrudPage from '../components/CrudPage';
import { incidentReportsApi } from '../services/api';

export default function IncidentReportsPage() {
  return (
    <CrudPage
      title="Incident Reports"
      subtitle="Open and resolved incidents by precinct and severity."
      api={incidentReportsApi}
      statusKey="status"
      fields={[
        { key: 'incident_id',label: 'Incident ID' },
        { key: 'precinct_id',label: 'Precinct ID' },
        { key: 'type',       label: 'Type' },
        { key: 'severity',   label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'opened_at',  label: 'Opened At', type: 'datetime-local' },
        { key: 'status',     label: 'Status', type: 'select', options: ['open','investigating','mitigated','resolved'] },
        { key: 'notes',      label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
