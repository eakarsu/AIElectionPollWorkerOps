import React from 'react';
import AIPage from '../components/AIPage';
import { aiPostElectionReport } from '../services/api';

export default function AIPostElectionReportPage() {
  return (
    <AIPage
      title="AI · Post-Election Report"
      feature="post-election-report"
      subtitle="After-action narrative with metrics, what-went-well, what-went-wrong and recommendations."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. lead with wait-time distribution.' },
      ]}
      run={(v) => aiPostElectionReport({ notes: v.notes })}
    />
  );
}
