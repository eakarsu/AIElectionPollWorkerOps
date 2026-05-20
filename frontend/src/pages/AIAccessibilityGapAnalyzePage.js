import React from 'react';
import AIPage from '../components/AIPage';
import { aiAccessibilityGap } from '../services/api';

export default function AIAccessibilityGapAnalyzePage() {
  return (
    <AIPage
      title="AI · Accessibility Gap Analyze"
      feature="accessibility-gap-analyze"
      subtitle="ADA / HAVA gap analysis with severity, mitigations and fix ETAs."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. focus precincts with score < 70.' },
      ]}
      run={(v) => aiAccessibilityGap({ notes: v.notes })}
    />
  );
}
