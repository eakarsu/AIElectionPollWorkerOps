import React from 'react';
import AIPage from '../components/AIPage';
import { aiRecountReadinessBrief } from '../services/api';

export default function AIRecountReadinessBriefPage() {
  return (
    <AIPage
      title="AI · Recount Readiness Brief"
      feature="recount-readiness-brief"
      subtitle="Score recount readiness across in-progress and requested recounts."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. focus on Mayor race recounts.' },
      ]}
      run={(v) => aiRecountReadinessBrief({ notes: v.notes })}
    />
  );
}
