import React from 'react';
import AIPage from '../components/AIPage';
import { aiBallotRouting } from '../services/api';

export default function AIBallotRoutingPage() {
  return (
    <AIPage
      title="AI · Ballot Routing"
      feature="ballot-routing"
      subtitle="Allocate ballots and schedule drop-box pickups and courier runs."
      inputs={[
        { key: 'notes', label: 'Notes / Bias', type: 'textarea', placeholder: 'e.g. drop-box pickup priority for boxes above 70 percent capacity.' },
      ]}
      run={(v) => aiBallotRouting({ notes: v.notes })}
    />
  );
}
