import React from 'react';
import AIPage from '../components/AIPage';
import { aiLanguageSupportPlan } from '../services/api';

export default function AILanguageSupportPlanPage() {
  return (
    <AIPage
      title="AI · Language Support Plan"
      feature="language-support-plan"
      subtitle="Compliance-driven language access plan covering interpreters and materials."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. add Vietnamese coverage at PCT-006.' },
      ]}
      run={(v) => aiLanguageSupportPlan({ notes: v.notes })}
    />
  );
}
