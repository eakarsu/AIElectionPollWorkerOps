import React from 'react';
import AIPage from '../components/AIPage';
import { aiRulesTranslate } from '../services/api';

export default function AIRulesTranslatePage() {
  return (
    <AIPage
      title="AI · Rules Translate"
      feature="rules-translate"
      subtitle="Translate procedural election rules into supported languages, with a back-translation check and an unofficial-translation disclaimer. Voter-facing output: enters a pending approval (requires_review: true) and is not for public posting until approved."
      inputs={[
        { key: 'source_text',  label: 'Source rule text', type: 'textarea', placeholder: 'Paste the authoritative English rule text.' },
        { key: 'source_lang',  label: 'Source language',                    placeholder: 'en' },
        { key: 'target_langs', label: 'Target languages (comma-sep)',       placeholder: 'es, zh, vi' },
      ]}
      run={(v) => aiRulesTranslate({
        source_text: v.source_text,
        source_lang: v.source_lang || 'en',
        target_langs: v.target_langs,
      })}
    />
  );
}
