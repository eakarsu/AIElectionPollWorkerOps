import React from 'react';
import AIPage from '../components/AIPage';
import { aiIncidentReportDraft } from '../services/api';

export default function AIIncidentReportDraftPage() {
  return (
    <AIPage
      title="AI · Incident Report Draft"
      feature="incident-report-draft"
      subtitle="Draft a formal, neutral incident-report narrative from triage notes and structured facts. Every draft is opened as a pending approval (requires_review: true) and is not part of the official record until an authorized approver signs off."
      inputs={[
        { key: 'incident_id',      label: 'Incident ID',     placeholder: 'INC-2207' },
        { key: 'precinct_id',      label: 'Precinct ID',     placeholder: 'PCT-008' },
        { key: 'type',             label: 'Incident type',   placeholder: 'equipment_malfunction | voter_intimidation | power_outage | accessibility_barrier | custody_anomaly' },
        { key: 'severity',         label: 'Severity',        placeholder: 'low | medium | high | critical' },
        { key: 'triage_notes',     label: 'Triage notes',    type: 'textarea', placeholder: 'What happened, who responded, how it was mitigated. No partisan framing.' },
        { key: 'structured_facts', label: 'Structured facts', type: 'textarea', placeholder: 'key=value pairs, e.g. opened_at=09:14, mitigated_at=09:25, ballots_affected=0' },
      ]}
      run={(v) => aiIncidentReportDraft({
        incident_id: v.incident_id,
        precinct_id: v.precinct_id,
        type: v.type,
        severity: v.severity || 'medium',
        triage_notes: v.triage_notes || '',
        structured_facts: v.structured_facts || '',
      })}
    />
  );
}
