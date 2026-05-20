import React from 'react';
import CrudPage from '../components/CrudPage';
import { languageSupportApi } from '../services/api';

export default function LanguageSupportPage() {
  return (
    <CrudPage
      title="Language Support"
      subtitle="Interpreters and translated materials per language."
      api={languageSupportApi}
      statusKey="status"
      fields={[
        { key: 'support_id',       label: 'Support ID' },
        { key: 'precinct_id',      label: 'Precinct ID' },
        { key: 'language',         label: 'Language' },
        { key: 'interpreter_count',label: 'Interpreter Count', type: 'number' },
        { key: 'materials_count',  label: 'Materials Count',   type: 'number' },
        { key: 'status',           label: 'Status', type: 'select', options: ['planned','staffed','partial','unmet'] },
        { key: 'notes',            label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
