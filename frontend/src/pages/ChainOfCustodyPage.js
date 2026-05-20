import React from 'react';
import CrudPage from '../components/CrudPage';
import { chainOfCustodyApi } from '../services/api';

export default function ChainOfCustodyPage() {
  return (
    <CrudPage
      title="Chain of Custody"
      subtitle="Every handoff of ballots, memory cards and sealed bags."
      api={chainOfCustodyApi}
      fields={[
        { key: 'custody_id', label: 'Custody ID' },
        { key: 'item',       label: 'Item' },
        { key: 'from_actor', label: 'From' },
        { key: 'to_actor',   label: 'To' },
        { key: 'ts',         label: 'Timestamp', type: 'datetime-local' },
        { key: 'location',   label: 'Location' },
        { key: 'notes',      label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
