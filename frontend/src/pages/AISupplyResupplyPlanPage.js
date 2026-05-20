import React from 'react';
import AIPage from '../components/AIPage';
import { aiSupplyResupplyPlan } from '../services/api';

export default function AISupplyResupplyPlanPage() {
  return (
    <AIPage
      title="AI · Supply Resupply Plan"
      feature="supply-resupply-plan"
      subtitle="Dispatch low-stock items to precincts with vehicle assignments and ETAs."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. provisional envelopes emergency at PCT-003.' },
      ]}
      run={(v) => aiSupplyResupplyPlan({ notes: v.notes })}
    />
  );
}
