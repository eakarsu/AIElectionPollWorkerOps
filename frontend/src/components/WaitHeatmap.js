import React from 'react';

// PRECINCT WAIT-TIME HEATMAP
// CSS grid of precincts colored by latest voter_lines wait_minutes.
// green < 10, amber 10-30, red > 30
function bandColor(band) {
  if (band === 'green') return { bg: '#065f46', fg: '#d1fae5', border: '#10b981' };
  if (band === 'amber') return { bg: '#78350f', fg: '#fde68a', border: '#f59e0b' };
  if (band === 'red')   return { bg: '#7f1d1d', fg: '#fecaca', border: '#ef4444' };
  return { bg: '#1e293b', fg: '#cbd5e1', border: '#334155' };
}

export default function WaitHeatmap({ data, loading, error }) {
  if (loading) return <div className="card">Loading precinct wait times…</div>;
  if (error)   return <div className="card" style={{ color: '#fecaca' }}>Error: {error}</div>;
  if (!data)   return null;

  const cells = data.cells || [];

  return (
    <div className="card" data-testid="wait-heatmap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, color: '#f1f5f9' }}>Precinct Wait-Time Heatmap</h3>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 12.5 }}>
            Latest voter-line wait per precinct · green &lt; 10 min · amber 10-30 · red &gt; 30
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#cbd5e1' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#10b981', marginRight: 6 }} />{data.green}</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#f59e0b', marginRight: 6 }} />{data.amber}</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#ef4444', marginRight: 6 }} />{data.red}</span>
        </div>
      </div>

      {cells.length === 0 ? (
        <div style={{ color: '#94a3b8', padding: 24, textAlign: 'center' }}>No precincts found.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 10,
          }}
        >
          {cells.map((c) => {
            const col = bandColor(c.color_band);
            return (
              <div
                key={c.precinct_id || c.precinct_name}
                className="heatmap-cell"
                style={{
                  background: col.bg,
                  color: col.fg,
                  border: `1px solid ${col.border}`,
                  borderRadius: 8,
                  padding: '12px 12px 10px',
                  minHeight: 92,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                title={`${c.precinct_name || c.precinct_id} · ${c.wait_minutes} min · queue ${c.queue_length}`}
              >
                <div style={{ fontSize: 11, opacity: 0.9, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {c.precinct_id || '—'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2, margin: '4px 0 6px' }}>
                  {c.precinct_name || 'Unnamed'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>
                    {c.wait_minutes}
                    <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 3 }}>min</span>
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>q:{c.queue_length}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
