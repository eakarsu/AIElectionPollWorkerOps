import React from 'react';
import AIPage from '../components/AIPage';
import { aiDisinformationQuizGen } from '../services/api';

export default function AIDisinformationQuizPage() {
  return (
    <AIPage
      title="AI · Anti-Disinformation Quiz Generator"
      feature="disinformation-quiz-generate"
      subtitle="Generate scenario-based quiz items for poll-worker training. Each item must cite an official source (EAC, state SoS, county election office, NIST, CISA). Non-partisan; no candidate or party advocacy."
      inputs={[
        { key: 'topic',    label: 'Topic',                                              placeholder: 'e.g. mail-in and absentee ballot misinformation' },
        { key: 'count',    label: 'Number of items', type: 'number',                   defaultValue: 5 },
        { key: 'audience', label: 'Audience',                                           placeholder: 'poll_workers | chief_judges | public_information_officers' },
      ]}
      run={(v) => aiDisinformationQuizGen({
        topic: v.topic || '',
        count: Number(v.count) || 5,
        audience: v.audience || 'poll_workers',
      })}
    />
  );
}
