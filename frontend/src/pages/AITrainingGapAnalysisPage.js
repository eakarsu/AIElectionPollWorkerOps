import React from 'react';
import AIPage from '../components/AIPage';
import { aiTrainingGapAnalysis } from '../services/api';

export default function AITrainingGapAnalysisPage() {
  return (
    <AIPage
      title="AI · Training Gap Analysis"
      feature="training-gap-analysis"
      subtitle="Find untrained workers and recommend sessions before election day."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. focus on chief judge certification and ADA training.' },
      ]}
      run={(v) => aiTrainingGapAnalysis({ notes: v.notes })}
    />
  );
}
