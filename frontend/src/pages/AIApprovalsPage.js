import React, { useCallback, useEffect, useState } from 'react';
import { aiApprovalsApi, getStoredUser } from '../services/api';

// Human-in-the-loop sign-off queue for sensitive AI outputs (Pass 7).
// Sensitive features: incident-report-draft, voter-communication-draft, rules-translate.
// Approval requires a named approver_id and stamps approval_timestamp server-side.

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'superseded'];
const FEATURE_OPTIONS = [
  '',
  'incident-report-draft',
  'voter-communication-draft',
  'rules-translate',
];

function fmtTs(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleString(); } catch (_) { return String(ts); }
}

export default function AIApprovalsPage() {
  const user = getStoredUser();
  const defaultApprover = (user && (user.email || user.name)) || '';

  const [status, setStatus] = useState('pending');
  const [feature, setFeature] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [approverId, setApproverId] = useState(defaultApprover);
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await aiApprovalsApi.list({ status, feature, limit: 200 });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status, feature]);

  useEffect(() => { refresh(); }, [refresh]);

  const openDetail = async (row) => {
    setSelected(row);
    setDetail(null);
    setActionMessage(null);
    setRejectReason('');
    setNotes('');
    setDetailLoading(true);
    try {
      const d = await aiApprovalsApi.get(row.id);
      setDetail(d);
    } catch (e) {
      setActionMessage(`Failed to load detail: ${e.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setDetail(null);
    setActionMessage(null);
  };

  const doApprove = async () => {
    if (!selected) return;
    if (!approverId) {
      setActionMessage('Approver ID is required — no anonymous sign-off.');
      return;
    }
    setActionBusy(true); setActionMessage(null);
    try {
      const updated = await aiApprovalsApi.approve(selected.id, approverId, notes || null);
      setDetail(updated);
      setActionMessage(`Approved by ${updated.approver_id} at ${fmtTs(updated.approval_timestamp)}`);
      await refresh();
    } catch (e) {
      setActionMessage(`Approve failed: ${e.message}`);
    } finally {
      setActionBusy(false);
    }
  };

  const doReject = async () => {
    if (!selected) return;
    if (!approverId) {
      setActionMessage('Approver ID is required.');
      return;
    }
    if (!rejectReason) {
      setActionMessage('Rejection reason is required.');
      return;
    }
    setActionBusy(true); setActionMessage(null);
    try {
      const updated = await aiApprovalsApi.reject(selected.id, approverId, rejectReason);
      setDetail(updated);
      setActionMessage(`Rejected by ${updated.approver_id} at ${fmtTs(updated.approval_timestamp)}`);
      await refresh();
    } catch (e) {
      setActionMessage(`Reject failed: ${e.message}`);
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>AI Approvals — Human-in-the-Loop Sign-off</h2>
        <p style={{ marginTop: 6, color: '#555' }}>
          Sensitive AI outputs (incident-report drafts, voter-facing communications, rules translations) enter
          this queue as <code>pending</code>. Approval requires a named approver — the server stamps
          <code> approval_timestamp</code> on transition. Nothing here is part of the official record until signed off.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <label>
          Status:&nbsp;
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">(all)</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Feature:&nbsp;
          <select value={feature} onChange={(e) => setFeature(e.target.value)}>
            {FEATURE_OPTIONS.map((f) => <option key={f || '_all'} value={f}>{f || '(all)'}</option>)}
          </select>
        </label>
        <button className="btn secondary" onClick={refresh} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && <div style={{ color: '#b00', marginBottom: 12 }}>Error: {error}</div>}

      <div style={{ overflowX: 'auto', border: '1px solid #e3e3e3', borderRadius: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#fafafa' }}>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Feature</th>
              <th style={th}>Resource</th>
              <th style={th}>Status</th>
              <th style={th}>Requires review</th>
              <th style={th}>Requested by</th>
              <th style={th}>Approver</th>
              <th style={th}>Approved at</th>
              <th style={th}>Created</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr><td colSpan={10} style={{ padding: 12, color: '#777' }}>No approvals.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={td}>{r.id}</td>
                <td style={td}>{r.feature}</td>
                <td style={td}>{r.resource_type || ''}{r.resource_id ? ` / ${r.resource_id}` : ''}</td>
                <td style={td}><span style={statusBadge(r.status)}>{r.status}</span></td>
                <td style={td}>{r.requires_review ? 'yes' : 'no'}</td>
                <td style={td}>{r.requested_by || ''}</td>
                <td style={td}>{r.approver_id || ''}</td>
                <td style={td}>{fmtTs(r.approval_timestamp)}</td>
                <td style={td}>{fmtTs(r.created_at)}</td>
                <td style={td}>
                  <button className="btn" onClick={() => openDetail(r)}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={modalBackdrop} onClick={closeDetail}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Approval #{selected.id} — {selected.feature}</h3>
              <button className="btn secondary" onClick={closeDetail}>Close</button>
            </div>
            <div style={{ marginTop: 12, color: '#555', fontSize: 13 }}>
              Resource: <code>{selected.resource_type || '(none)'}{selected.resource_id ? ` / ${selected.resource_id}` : ''}</code>
              {' · '}Status: <strong>{detail?.status || selected.status}</strong>
              {detail?.approver_id && (<> · Approver: <code>{detail.approver_id}</code> at {fmtTs(detail.approval_timestamp)}</>)}
            </div>

            {detailLoading ? (
              <div style={{ marginTop: 16 }}>Loading…</div>
            ) : detail ? (
              <>
                <div style={{ marginTop: 12 }}>
                  <div style={sectionLabel}>AI output payload</div>
                  <pre style={preBox}>{JSON.stringify(detail.payload, null, 2)}</pre>
                </div>

                {detail.status === 'pending' && (
                  <div style={{ marginTop: 12, padding: 12, border: '1px solid #e3e3e3', borderRadius: 6 }}>
                    <div style={sectionLabel}>Sign-off</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <label>
                        Approver ID:&nbsp;
                        <input
                          type="text"
                          value={approverId}
                          onChange={(e) => setApproverId(e.target.value)}
                          placeholder="email or name of approver"
                          style={{ minWidth: 260 }}
                        />
                      </label>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <label style={{ display: 'block' }}>Notes (optional):</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        style={{ width: '100%' }}
                        placeholder="Reviewer notes, scope of approval, etc."
                      />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <label style={{ display: 'block' }}>Rejection reason (required if rejecting):</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        style={{ width: '100%' }}
                        placeholder="Why this output is not approved."
                      />
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      <button className="btn" onClick={doApprove} disabled={actionBusy}>
                        {actionBusy ? 'Working…' : 'Approve'}
                      </button>
                      <button className="btn secondary" onClick={doReject} disabled={actionBusy}>
                        {actionBusy ? 'Working…' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}

                {actionMessage && (
                  <div style={{ marginTop: 10, color: '#333' }}>{actionMessage}</div>
                )}
              </>
            ) : (
              <div style={{ marginTop: 16, color: '#b00' }}>Failed to load detail.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const th = { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #ddd', fontWeight: 600, fontSize: 13 };
const td = { padding: '8px 10px', verticalAlign: 'top' };
const sectionLabel = { fontWeight: 600, marginBottom: 6 };
const preBox = { background: '#fafafa', padding: 12, borderRadius: 6, maxHeight: 320, overflow: 'auto', fontSize: 12 };
const modalBackdrop = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex',
  alignItems: 'flex-start', justifyContent: 'center', padding: 32, zIndex: 1000,
};
const modalCard = {
  background: '#fff', borderRadius: 8, padding: 20, width: '100%', maxWidth: 900,
  maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
};
function statusBadge(status) {
  const color = status === 'approved' ? '#0a7' : status === 'rejected' ? '#c33' : status === 'superseded' ? '#888' : '#c80';
  return { background: color, color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 12 };
}
