import React from 'react';
import { NavLink } from 'react-router-dom';
import { logout, getStoredUser } from '../services/api';

// Sidebar menu groups per spec:
// Overview / Precincts / Poll Workers / Equipment / Ballots / Incidents /
// Accessibility / Governance / AI Ops / AI Reporting / Admin

const PRECINCT_LINKS = [
  { to: '/precincts',          label: 'Precincts' },
  { to: '/voter-lines',        label: 'Voter Lines' },
  { to: '/vehicles',           label: 'Vehicles' },
  { to: '/transmissions',      label: 'Transmissions' },
];

const POLL_WORKER_LINKS = [
  { to: '/poll-workers',       label: 'Poll Workers' },
  { to: '/election-judges',    label: 'Election Judges' },
  { to: '/training-sessions',  label: 'Training Sessions' },
];

const EQUIPMENT_LINKS = [
  { to: '/equipment',          label: 'Equipment' },
  { to: '/supplies',           label: 'Supplies' },
];

const BALLOT_LINKS = [
  { to: '/ballots',            label: 'Ballots' },
  { to: '/ballot-drop-boxes',  label: 'Ballot Drop Boxes' },
  { to: '/chain-of-custody',   label: 'Chain of Custody' },
  { to: '/recounts',           label: 'Recounts' },
];

const INCIDENT_LINKS = [
  { to: '/incident-reports',   label: 'Incident Reports' },
];

const ACCESSIBILITY_LINKS = [
  { to: '/accessibility-audits',label: 'Accessibility Audits' },
  { to: '/language-support',   label: 'Language Support' },
];

const GOVERNANCE_LINKS = [
  { to: '/observers',          label: 'Observers' },
  { to: '/audit-log',          label: 'Audit Log' },
];

const AI_OPS_LINKS = [
  { to: '/ai/line-wait-forecast',      label: 'AI · Line Wait Forecast' },
  { to: '/ai/equipment-reallocate',    label: 'AI · Equipment Reallocate' },
  { to: '/ai/incident-triage',         label: 'AI · Incident Triage' },
  { to: '/ai/poll-worker-schedule',    label: 'AI · Poll-Worker Schedule' },
  { to: '/ai/ballot-routing',          label: 'AI · Ballot Routing' },
  { to: '/ai/supply-resupply-plan',    label: 'AI · Supply Resupply Plan' },
  { to: '/ai/observer-coordination',   label: 'AI · Observer Coordination' },
  { to: '/ai/training-gap-analysis',   label: 'AI · Training Gap Analysis' },
  { to: '/ai/language-support-plan',   label: 'AI · Language Support Plan' },
  { to: '/ai/accessibility-gap-analyze', label: 'AI · Accessibility Gap Analyze' },
];

const AI_REPORTING_LINKS = [
  { to: '/ai/executive-brief',         label: 'AI · Executive Brief' },
  { to: '/ai/recount-readiness-brief', label: 'AI · Recount Readiness Brief' },
  { to: '/ai/chain-of-custody-anomaly',label: 'AI · Chain-of-Custody Anomaly' },
  { to: '/ai/transmission-anomaly',    label: 'AI · Transmission Anomaly' },
  { to: '/ai/voter-communication-draft', label: 'AI · Voter Communication Draft' },
  { to: '/ai/post-election-report',    label: 'AI · Post-Election Report' },
];

export default function Sidebar() {
  const user = getStoredUser();
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h1>ELECTION OPS</h1>
        <p>Poll-Worker &amp; Precinct Command</p>
      </div>

      <NavLink to="/" end>Overview</NavLink>

      <div className="sidebar-group-label">Precincts</div>
      {PRECINCT_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Poll Workers</div>
      {POLL_WORKER_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Equipment</div>
      {EQUIPMENT_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Ballots</div>
      {BALLOT_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Incidents</div>
      {INCIDENT_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Accessibility</div>
      {ACCESSIBILITY_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Governance</div>
      {GOVERNANCE_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">AI Ops</div>
      {AI_OPS_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">AI Reporting</div>
      {AI_REPORTING_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Analytics</div>
      <NavLink to="/custom-views">Election Analytics</NavLink>

      <div className="sidebar-group-label">Admin</div>
      <NavLink to="/webhooks">Webhooks</NavLink>

      <div className="sidebar-user">
        {user && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name || user.email}</div>
            <div className="sidebar-user-role">{user.role || 'user'}</div>
          </div>
        )}
        <button className="btn secondary sidebar-logout" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}
