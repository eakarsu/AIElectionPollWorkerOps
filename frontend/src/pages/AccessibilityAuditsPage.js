import React from 'react';
import CrudPage from '../components/CrudPage';
import { accessibilityAuditsApi } from '../services/api';

export default function AccessibilityAuditsPage() {
  return (
    <CrudPage
      title="Accessibility Audits"
      subtitle="ADA audit scores and findings per precinct."
      api={accessibilityAuditsApi}
      fields={[
        { key: 'audit_id',    label: 'Audit ID' },
        { key: 'precinct_id', label: 'Precinct ID' },
        { key: 'auditor',     label: 'Auditor' },
        { key: 'score',       label: 'Score', type: 'number' },
        { key: 'conducted_at',label: 'Conducted At', type: 'datetime-local' },
        { key: 'findings',    label: 'Findings', type: 'textarea' },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
