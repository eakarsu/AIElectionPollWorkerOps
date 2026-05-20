import React from 'react';

// EQUIPMENT STATUS GRID
// CSS grid of equipment colored by status: operational / maint / down.
function bucketColor(bucket) {
  if (bucket === 'operational') return { bg: '#065f46', fg: '#d1fae5', border: '#10b981', label: 'OPERATIONAL' };
  if (bucket === 'maint')       return { bg: '#78350f', fg: '#fde68a', border: '#f59e0b', label: 'MAINTENANCE' };
  if (bucket === 'down')        return { bg: '#7f1d1d', fg: '#fecaca', border: '#ef4444', label: 'DOWN' };
  return { bg: '#1e293b', fg: '#cbd5e1', border: '#334155', label: '—' };
}

export default function EquipmentGrid({ data, loading, error }) {
  if (loading) return <div className="card">Loading equipment status…</div>;
  if (error)   return <div className="card" style={{ color: '#fecaca' }}>Error: {error}</div>;
  if (!data)   return null;

  const cells = data.cells || [];

  return (
    <div className="card" data-testid="equipment-grid">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, color: '#f1f5f9' }}>Equipment Status Grid</h3>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 12.5 }}>
            Scanners, ePollbooks, markers and ADA units · {data.total} total
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#cbd5e1' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#10b981', marginRight: 6 }} />op {data.operational}</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#f59e0b', marginRight: 6 }} />maint {data.maint}</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#ef4444', marginRight: 6 }} />down {data.down}</span>
        </div>
      </div>

      {cells.length === 0 ? (
        <div style={{ color: '#94a3b8', padding: 24, textAlign: 'center' }}>No equipment registered.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 10,
          }}
        >
          {cells.map((c) => {
            const col = bucketColor(c.bucket);
            return (
              <div
                key={c.id}
                className="equipment-cell"
                style={{
                  background: col.bg,
                  color: col.fg,
                  border: `1px solid ${col.border}`,
                  borderRadius: 8,
                  padding: '12px 12px 10px',
                  minHeight: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                title={`${c.eq_id} · ${c.type || ''} · status=${c.status || 'n/a'}`}
              >
                <div>
                  <div style={{ fontSize: 11, opacity: 0.9, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {c.eq_id || '—'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                    {c.type || 'Unknown'}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                    SN: {c.sn || '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <div style={{ fontSize: 10, opacity: 0.85 }}>
                    {c.precinct_id || '—'}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px',
                    borderRadius: 4, background: 'rgba(0,0,0,0.3)',
                  }}>
                    {col.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
