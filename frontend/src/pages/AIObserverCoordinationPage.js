import React from 'react';
import AIPage from '../components/AIPage';
import { aiObserverCoordination } from '../services/api';

export default function AIObserverCoordinationPage() {
  return (
    <AIPage
      title="AI · Observer Coordination"
      feature="observer-coordination"
      subtitle="Plan observer coverage so partisan parity is preserved and no precinct is uncovered."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. ensure each precinct has at least one D-leaning and one R-leaning observer.' },
      ]}
      run={(v) => aiObserverCoordination({ notes: v.notes })}
    />
  );
}
