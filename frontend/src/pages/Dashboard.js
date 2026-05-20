import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';

const FEATURES = [
  { path: '/precincts',             title: 'Precincts',             icon: 'P', color: '#3b82f6', desc: 'All polling locations, wards, registered voters and open status.' },
  { path: '/poll-workers',          title: 'Poll Workers',          icon: 'W', color: '#06b6d4', desc: 'Chief judges, clerks, greeters, interpreters and tech support.' },
  { path: '/equipment',             title: 'Equipment',             icon: 'E', color: '#10b981', desc: 'Scanners, ballot markers, ePollbooks, ADA audio units.' },
  { path: '/ballots',               title: 'Ballots',               icon: 'B', color: '#f59e0b', desc: 'In-person, absentee and provisional ballot allocation per precinct.' },
  { path: '/chain-of-custody',      title: 'Chain of Custody',      icon: 'C', color: '#a78bfa', desc: 'Every handoff of ballots, memory cards, and sealed bags.' },
  { path: '/training-sessions',     title: 'Training Sessions',     icon: 'T', color: '#ec4899', desc: 'Poll-worker training schedule and attendance.' },
  { path: '/voter-lines',           title: 'Voter Lines',           icon: 'V', color: '#22c55e', desc: 'Live and historical line waits and queue lengths.' },
  { path: '/incident-reports',      title: 'Incident Reports',      icon: 'I', color: '#ef4444', desc: 'Open and resolved incidents by precinct and severity.' },
  { path: '/election-judges',       title: 'Election Judges',       icon: 'J', color: '#0ea5e9', desc: 'Certified judges, party affiliation and assignments.' },
  { path: '/recounts',              title: 'Recounts',              icon: 'R', color: '#14b8a6', desc: 'Requested and in-progress recounts by race.' },
  { path: '/observers',             title: 'Observers',             icon: 'O', color: '#fb7185', desc: 'Accredited observers from parties, civil-rights orgs and press.' },
  { path: '/supplies',              title: 'Supplies',              icon: 'S', color: '#facc15', desc: 'Pens, stickers, sleeves, envelopes, signage kits.' },
  { path: '/vehicles',              title: 'Vehicles',              icon: 'X', color: '#a3e635', desc: 'Cargo vans, panel trucks, and sedans for courier runs.' },
  { path: '/ballot-drop-boxes',     title: 'Ballot Drop Boxes',     icon: 'D', color: '#60a5fa', desc: 'Drop-box locations, capacity, last emptied and observers.' },
  { path: '/accessibility-audits',  title: 'Accessibility Audits',  icon: 'A', color: '#7dd3fc', desc: 'ADA audit scores and findings per precinct.' },
  { path: '/language-support',      title: 'Language Support',      icon: 'L', color: '#f472b6', desc: 'Interpreters and translated materials per language.' },
  { path: '/audit-log',             title: 'Audit Log',             icon: '#', color: '#dc2626', desc: 'Every privileged action across the platform.' },
  { path: '/transmissions',         title: 'Transmissions',         icon: 'M', color: '#34d399', desc: 'Results, audit batches, and incident summaries sent upstream.' },

  { path: '/ai/line-wait-forecast',        title: 'AI · Line Wait Forecast',        icon: '*', color: '#8b5cf6', desc: 'Forecast peak voter waits by precinct.' },
  { path: '/ai/equipment-reallocate',      title: 'AI · Equipment Reallocate',      icon: '*', color: '#8b5cf6', desc: 'Move scanners, ePollbooks, ADA units where needed.' },
  { path: '/ai/incident-triage',           title: 'AI · Incident Triage',           icon: '*', color: '#8b5cf6', desc: 'Prioritize open incidents with SLAs and owners.' },
  { path: '/ai/recount-readiness-brief',   title: 'AI · Recount Readiness Brief',   icon: '*', color: '#8b5cf6', desc: 'Score recount readiness and surface gaps.' },
  { path: '/ai/chain-of-custody-anomaly',  title: 'AI · Chain-of-Custody Anomaly',  icon: '*', color: '#8b5cf6', desc: 'Flag gaps, out-of-sequence, or unauthorized handoffs.' },
  { path: '/ai/executive-brief',           title: 'AI · Executive Brief',           icon: '*', color: '#8b5cf6', desc: 'County-level snapshot for the election director.' },
  { path: '/ai/poll-worker-schedule',      title: 'AI · Poll-Worker Schedule',      icon: '*', color: '#8b5cf6', desc: 'Recommend shifts and backfills with language coverage.' },
  { path: '/ai/language-support-plan',     title: 'AI · Language Support Plan',     icon: '*', color: '#8b5cf6', desc: 'Compliance-driven language access plan.' },
  { path: '/ai/accessibility-gap-analyze', title: 'AI · Accessibility Gap Analyze', icon: '*', color: '#8b5cf6', desc: 'ADA/HAVA gap analysis with mitigations.' },
  { path: '/ai/observer-coordination',     title: 'AI · Observer Coordination',     icon: '*', color: '#8b5cf6', desc: 'Plan balanced observer coverage by precinct.' },
  { path: '/ai/supply-resupply-plan',      title: 'AI · Supply Resupply Plan',      icon: '*', color: '#8b5cf6', desc: 'Dispatch low-stock items to precincts.' },
  { path: '/ai/transmission-anomaly',      title: 'AI · Transmission Anomaly',      icon: '*', color: '#8b5cf6', desc: 'Detect failed, late, or duplicate transmissions.' },
  { path: '/ai/ballot-routing',            title: 'AI · Ballot Routing',            icon: '*', color: '#8b5cf6', desc: 'Allocate ballots and schedule drop-box pickups.' },
  { path: '/ai/training-gap-analysis',     title: 'AI · Training Gap Analysis',     icon: '*', color: '#8b5cf6', desc: 'Find untrained workers and recommend sessions.' },
  { path: '/ai/voter-communication-draft', title: 'AI · Voter Communication Draft', icon: '*', color: '#8b5cf6', desc: 'Draft neutral plain-language voter notices.' },
  { path: '/ai/post-election-report',      title: 'AI · Post-Election Report',      icon: '*', color: '#8b5cf6', desc: 'After-action narrative with metrics and recs.' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h2>Election Operations Overview</h2>
        <p>County election command picture · {new Date().toUTCString()}</p>
      </div>

      {err && <div className="ai-error">Stats unavailable: {err}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat"><div className="stat-label">Precincts</div><div className="stat-value">{stats.precincts?.total ?? '—'}</div><div className="stat-sub">{stats.precincts?.open ?? 0} open · {stats.precincts?.issues ?? 0} issues</div></div>
          <div className="stat"><div className="stat-label">Poll Workers</div><div className="stat-value">{stats.poll_workers?.total ?? '—'}</div><div className="stat-sub">{stats.poll_workers?.active ?? 0} active · {stats.poll_workers?.no_show ?? 0} no-show</div></div>
          <div className="stat"><div className="stat-label">Equipment</div><div className="stat-value">{stats.equipment?.total ?? '—'}</div><div className="stat-sub">{stats.equipment?.ready ?? 0} ready · {stats.equipment?.offline ?? 0} offline</div></div>
          <div className="stat"><div className="stat-label">Ballots</div><div className="stat-value">{stats.ballots?.total ?? '—'}</div><div className="stat-sub">{Number(stats.ballots?.total_count || 0).toLocaleString()} allocated</div></div>
          <div className="stat"><div className="stat-label">Custody Events</div><div className="stat-value">{stats.chain_of_custody?.total ?? '—'}</div><div className="stat-sub">handoffs logged</div></div>
          <div className="stat"><div className="stat-label">Training</div><div className="stat-value">{stats.training_sessions?.total ?? '—'}</div><div className="stat-sub">{stats.training_sessions?.completed ?? 0} done · {stats.training_sessions?.scheduled ?? 0} upcoming</div></div>
          <div className="stat"><div className="stat-label">Voter Lines</div><div className="stat-value">{stats.voter_lines?.total ?? '—'}</div><div className="stat-sub">{stats.voter_lines?.long_wait ?? 0} long wait · max {stats.voter_lines?.max_wait ?? 0} min</div></div>
          <div className="stat"><div className="stat-label">Incidents</div><div className="stat-value">{stats.incident_reports?.total ?? '—'}</div><div className="stat-sub">{stats.incident_reports?.critical ?? 0} critical · {stats.incident_reports?.open ?? 0} open</div></div>
          <div className="stat"><div className="stat-label">Judges</div><div className="stat-value">{stats.election_judges?.total ?? '—'}</div><div className="stat-sub">{stats.election_judges?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Recounts</div><div className="stat-value">{stats.recounts?.total ?? '—'}</div><div className="stat-sub">{stats.recounts?.in_progress ?? 0} in progress · {stats.recounts?.requested ?? 0} requested</div></div>
          <div className="stat"><div className="stat-label">Observers</div><div className="stat-value">{stats.observers?.total ?? '—'}</div><div className="stat-sub">{stats.observers?.accredited ?? 0} accredited</div></div>
          <div className="stat"><div className="stat-label">Supplies</div><div className="stat-value">{stats.supplies?.total ?? '—'}</div><div className="stat-sub">{stats.supplies?.low ?? 0} low</div></div>
          <div className="stat"><div className="stat-label">Vehicles</div><div className="stat-value">{stats.vehicles?.total ?? '—'}</div><div className="stat-sub">{stats.vehicles?.available ?? 0} avail · {stats.vehicles?.en_route ?? 0} en route</div></div>
          <div className="stat"><div className="stat-label">Drop Boxes</div><div className="stat-value">{stats.ballot_drop_boxes?.total ?? '—'}</div><div className="stat-sub">{stats.ballot_drop_boxes?.operational ?? 0} operational</div></div>
          <div className="stat"><div className="stat-label">Accessibility</div><div className="stat-value">{stats.accessibility_audits?.total ?? '—'}</div><div className="stat-sub">avg score {stats.accessibility_audits?.avg_score ?? 0}</div></div>
          <div className="stat"><div className="stat-label">Lang Support</div><div className="stat-value">{stats.language_support?.total ?? '—'}</div><div className="stat-sub">{stats.language_support?.staffed ?? 0} staffed</div></div>
          <div className="stat"><div className="stat-label">Audit Log</div><div className="stat-value">{stats.audit_log?.total ?? '—'}</div><div className="stat-sub">entries</div></div>
          <div className="stat"><div className="stat-label">Transmissions</div><div className="stat-value">{stats.transmissions?.total ?? '—'}</div><div className="stat-sub">{stats.transmissions?.failed ?? 0} failed · {stats.transmissions?.pending ?? 0} pending</div></div>
        </div>
      )}

      <h3 style={{ color: '#cbd5e1', margin: '8px 0 14px', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Capabilities</h3>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div
            key={f.path}
            className="feature-card"
            style={{ ['--card-color']: f.color }}
            onClick={() => navigate(f.path)}
          >
            <div className="feature-card-icon" style={{ background: f.color + '22', color: f.color }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
