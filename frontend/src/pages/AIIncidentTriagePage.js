import React from 'react';
import AIPage from '../components/AIPage';
import { aiIncidentTriage } from '../services/api';

export default function AIIncidentTriagePage() {
  return (
    <AIPage
      title="AI · Incident Triage"
      feature="incident-triage"
      subtitle="Prioritize open incidents with SLAs, owners and recommended actions."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. weight rank toward voter_intimidation and accessibility issues.' },
      ]}
      run={(v) => aiIncidentTriage({ notes: v.notes })}
    />
  );
}
