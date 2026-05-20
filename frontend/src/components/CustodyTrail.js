import React, { useState } from 'react';

// CHAIN-OF-CUSTODY TRAIL
// Vertical timeline of chain_of_custody transfers, grouped by item.
function fmt(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString();
  } catch (_) { return String(ts); }
}

export default function CustodyTrail({ data, loading, error }) {
  const [expanded, setExpanded] = useState({});

  if (loading) return <div className="card">Loading chain-of-custody trail…</div>;
  if (error)   return <div className="card" style={{ color: '#fecaca' }}>Error: {error}</div>;
  if (!data)   return null;

  const items = data.items || [];
  const toggle = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="card" data-testid="custody-trail">
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0, color: '#f1f5f9' }}>Chain-of-Custody Trail</h3>
        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 12.5 }}>
          {data.total_items} item{data.total_items === 1 ? '' : 's'} ·
          {' '}{data.total_transfers} transfer{data.total_transfers === 1 ? '' : 's'}
        </p>
      </div>

      {items.length === 0 ? (
        <div style={{ color: '#94a3b8', padding: 24, textAlign: 'center' }}>
          No custody transfers logged.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.slice(0, 25).map((grp) => {
            const open = expanded[grp.item] ?? true;
            const visible = open ? grp.transfers : grp.transfers.slice(-1);
            return (
              <div
                key={grp.item}
                style={{
                  background: '#0f1a2e',
                  border: '1px solid #1e293b',
                  borderRadius: 10,
                  padding: '14px 16px',
                }}
              >
                <div
                  onClick={() => toggle(grp.item)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                      {grp.item}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                      {grp.transfer_count} transfer{grp.transfer_count === 1 ? '' : 's'} ·
                      {' '}first {fmt(grp.first_ts)} → last {fmt(grp.last_ts)}
                    </div>
                  </div>
                  <span className="badge">{open ? 'collapse' : 'expand'}</span>
                </div>

                <ol
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    borderLeft: '2px solid #334155',
                    paddingLeft: 18,
                    position: 'relative',
                  }}
                >
                  {visible.map((t, idx) => (
                    <li
                      key={t.id}
                      style={{
                        position: 'relative',
                        paddingBottom: idx === visible.length - 1 ? 0 : 16,
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: -25,
                          top: 4,
                          width: 10,
                          height: 10,
                          background: '#38bdf8',
                          borderRadius: '50%',
                          border: '2px solid #0f1a2e',
                        }}
                      />
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{fmt(t.ts)}</div>
                      <div style={{ fontSize: 13.5, color: '#e2e8f0', margin: '2px 0' }}>
                        <span style={{ color: '#fbbf24' }}>{t.from_actor || '—'}</span>
                        {' → '}
                        <span style={{ color: '#34d399' }}>{t.to_actor || '—'}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {t.location ? `@ ${t.location}` : ''}
                        {t.custody_id ? ` · ${t.custody_id}` : ''}
                      </div>
                      {t.notes && (
                        <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4, fontStyle: 'italic' }}>
                          {t.notes}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
