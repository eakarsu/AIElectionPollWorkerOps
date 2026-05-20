import React from 'react';
import CrudPage from '../components/CrudPage';
import { voterLinesApi } from '../services/api';

export default function VoterLinesPage() {
  return (
    <CrudPage
      title="Voter Lines"
      subtitle="Live and historical line waits and queue lengths."
      api={voterLinesApi}
      statusKey="status"
      fields={[
        { key: 'line_id',     label: 'Line ID' },
        { key: 'precinct_id', label: 'Precinct ID' },
        { key: 'ts',          label: 'Timestamp', type: 'datetime-local' },
        { key: 'wait_minutes',label: 'Wait (min)', type: 'number' },
        { key: 'queue_length',label: 'Queue Length', type: 'number' },
        { key: 'status',      label: 'Status', type: 'select', options: ['normal','busy','long_wait','closed'] },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
