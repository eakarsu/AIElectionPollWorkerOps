import React from 'react';
import CrudPage from '../components/CrudPage';
import { trainingSessionsApi } from '../services/api';

export default function TrainingSessionsPage() {
  return (
    <CrudPage
      title="Training Sessions"
      subtitle="Poll-worker training schedule and attendance."
      api={trainingSessionsApi}
      statusKey="status"
      fields={[
        { key: 'session_id',      label: 'Session ID' },
        { key: 'topic',           label: 'Topic' },
        { key: 'instructor',      label: 'Instructor' },
        { key: 'attendees_count', label: 'Attendees', type: 'number' },
        { key: 'date',            label: 'Date', type: 'date' },
        { key: 'status',          label: 'Status', type: 'select', options: ['scheduled','completed','cancelled'] },
        { key: 'notes',           label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
