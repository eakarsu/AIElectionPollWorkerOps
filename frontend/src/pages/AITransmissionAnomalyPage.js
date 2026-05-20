import React from 'react';
import AIPage from '../components/AIPage';
import { aiTransmissionAnomaly } from '../services/api';

export default function AITransmissionAnomalyPage() {
  return (
    <AIPage
      title="AI · Transmission Anomaly"
      feature="transmission-anomaly"
      subtitle="Detect failed, late, duplicate or unexpected transmissions across precincts."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. focus on failed transmissions to County Election Board.' },
      ]}
      run={(v) => aiTransmissionAnomaly({ notes: v.notes })}
    />
  );
}
