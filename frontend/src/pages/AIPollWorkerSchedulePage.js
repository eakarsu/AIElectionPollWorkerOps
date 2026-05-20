import React from 'react';
import AIPage from '../components/AIPage';
import { aiPollWorkerSchedule } from '../services/api';

export default function AIPollWorkerSchedulePage() {
  return (
    <AIPage
      title="AI · Poll-Worker Schedule"
      feature="poll-worker-schedule"
      subtitle="Recommend shifts, backfills and language coverage across precincts."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. backfill no-show at PCT-005; ensure ES coverage.' },
      ]}
      run={(v) => aiPollWorkerSchedule({ notes: v.notes })}
    />
  );
}
