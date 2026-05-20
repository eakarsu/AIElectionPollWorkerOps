import React from 'react';
import AIPage from '../components/AIPage';
import { aiEquipmentReallocate } from '../services/api';

export default function AIEquipmentReallocatePage() {
  return (
    <AIPage
      title="AI · Equipment Reallocate"
      feature="equipment-reallocate"
      subtitle="Recommend equipment moves across precincts to cover failures and surges."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. scanner offline at PCT-008; need swap.' },
      ]}
      run={(v) => aiEquipmentReallocate({ notes: v.notes })}
    />
  );
}
