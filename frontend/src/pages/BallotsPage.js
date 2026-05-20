import React from 'react';
import CrudPage from '../components/CrudPage';
import { ballotsApi } from '../services/api';

export default function BallotsPage() {
  return (
    <CrudPage
      title="Ballots"
      subtitle="In-person, absentee and provisional ballot allocation per precinct."
      api={ballotsApi}
      statusKey="status"
      fields={[
        { key: 'ballot_id',  label: 'Ballot ID' },
        { key: 'precinct_id',label: 'Precinct ID' },
        { key: 'type',       label: 'Type', type: 'select', options: ['in_person','absentee','provisional','curbside'] },
        { key: 'count',      label: 'Count', type: 'number' },
        { key: 'period',     label: 'Period', type: 'select', options: ['pre_election','election_day','post_election'] },
        { key: 'status',     label: 'Status', type: 'select', options: ['pending','allocated','received','reserved','closed'] },
        { key: 'notes',      label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
