import React from 'react';
import AIPage from '../components/AIPage';
import { aiTrainingQaCopilot } from '../services/api';

export default function AITrainingQaCopilotPage() {
  return (
    <AIPage
      title="AI · Training Q&A Copilot"
      feature="training-qa-copilot"
      subtitle="Answer poll-worker procedure questions grounded only in the jurisdiction handbook. If the handbook is silent, the copilot routes to a chief judge rather than guessing."
      inputs={[
        { key: 'question',         label: 'Question',                 type: 'textarea', placeholder: 'e.g. A voter is not on the registration roll but insists they registered. What do I do?' },
        { key: 'role',             label: 'Asker role',                                placeholder: 'poll_worker | chief_judge | observer_coordinator' },
        { key: 'handbook_context', label: 'Handbook excerpt (authoritative)', type: 'textarea', placeholder: 'Paste the relevant section(s) of the jurisdiction handbook. If empty, the copilot will refuse to answer and escalate to a chief judge.' },
      ]}
      run={(v) => aiTrainingQaCopilot({
        question: v.question,
        role: v.role || 'poll_worker',
        handbook_context: v.handbook_context || '',
      })}
    />
  );
}
