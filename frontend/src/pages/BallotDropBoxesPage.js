import React from 'react';
import CrudPage from '../components/CrudPage';
import { ballotDropBoxesApi } from '../services/api';

export default function BallotDropBoxesPage() {
  return (
    <CrudPage
      title="Ballot Drop Boxes"
      subtitle="Drop-box locations, capacity, last emptied and observers."
      api={ballotDropBoxesApi}
      statusKey="status"
      fields={[
        { key: 'box_id',      label: 'Box ID' },
        { key: 'location',    label: 'Location' },
        { key: 'capacity',    label: 'Capacity', type: 'number' },
        { key: 'last_emptied',label: 'Last Emptied', type: 'datetime-local' },
        { key: 'status',      label: 'Status', type: 'select', options: ['operational','maintenance','removed'] },
        { key: 'observer',    label: 'Observer' },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
