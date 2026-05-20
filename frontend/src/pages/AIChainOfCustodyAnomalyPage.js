import React from 'react';
import AIPage from '../components/AIPage';
import { aiChainOfCustodyAnomaly } from '../services/api';

export default function AIChainOfCustodyAnomalyPage() {
  return (
    <AIPage
      title="AI · Chain-of-Custody Anomaly"
      feature="chain-of-custody-anomaly"
      subtitle="Detect gaps, out-of-sequence handoffs and unauthorized actors in custody logs."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. focus on memory card transfers and post-close recount transport.' },
      ]}
      run={(v) => aiChainOfCustodyAnomaly({ notes: v.notes })}
    />
  );
}
