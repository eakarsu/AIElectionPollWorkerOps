import React from 'react';
import AIPage from '../components/AIPage';
import { aiVoterCommunicationDraft } from '../services/api';

export default function AIVoterCommunicationDraftPage() {
  return (
    <AIPage
      title="AI · Voter Communication Draft"
      feature="voter-communication-draft"
      subtitle="Draft neutral, plain-language voter notices across SMS, email, web and print."
      inputs={[
        { key: 'audience',  label: 'Audience',  type: 'textarea', placeholder: 'e.g. Voters assigned to PCT-014 Arthur Community Church' },
        { key: 'situation', label: 'Situation', type: 'textarea', placeholder: 'e.g. Power outage; voting temporarily relocated to PCT-013.' },
        { key: 'channels',  label: 'Channels (comma-sep)',           placeholder: 'sms, email, public_notice' },
      ]}
      run={(v) => aiVoterCommunicationDraft({ audience: v.audience, situation: v.situation, channels: v.channels })}
    />
  );
}
