import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LabelList, CartesianGrid,
} from 'recharts';

// BALLOT FLOW SANKEY (vertical funnel)
// Stages: printed -> delivered -> cast -> counted -> certified.
// Implemented with a recharts vertical BarChart (layout="vertical")
// so the visualization reads top-to-bottom like a funnel.
const STAGE_COLORS = {
  printed:   '#60a5fa',
  delivered: '#a78bfa',
  cast:      '#fbbf24',
  counted:   '#34d399',
  certified: '#10b981',
};

export default function BallotSankey({ data, loading, error }) {
  if (loading) return <div className="card">Loading ballot flow…</div>;
  if (error)   return <div className="card" style={{ color: '#fecaca' }}>Error: {error}</div>;
  if (!data)   return null;

  const stages = (data.stages || []).map((s) => ({
    stage: s.stage.charAt(0).toUpperCase() + s.stage.slice(1),
    value: Number(s.value) || 0,
    fill: STAGE_COLORS[s.stage] || '#64748b',
  }));

  const maxVal = stages.reduce((m, s) => Math.max(m, s.value), 0) || 1;

  return (
    <div className="card" data-testid="ballot-sankey">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, color: '#f1f5f9' }}>Ballot Flow Funnel</h3>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 12.5 }}>
            Printed → Delivered → Cast → Counted → Certified
            {' · '}yield {data.yield_pct}%
          </p>
        </div>
        <div style={{ fontSize: 12, color: '#cbd5e1' }}>
          <span>peak {maxVal.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stages}
            layout="vertical"
            margin={{ top: 10, right: 60, bottom: 10, left: 20 }}
          >
            <CartesianGrid stroke="#1e293b" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={[0, maxVal]}
            />
            <YAxis
              type="category"
              dataKey="stage"
              stroke="#64748b"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              width={90}
            />
            <Tooltip
              contentStyle={{
                background: '#0f1a2e',
                border: '1px solid #1e293b',
                borderRadius: 8,
                color: '#e2e8f0',
              }}
              formatter={(v) => [Number(v).toLocaleString(), 'ballots']}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {stages.map((s) => (
                <Cell key={s.stage} fill={s.fill} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v) => Number(v).toLocaleString()}
                style={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 8, marginTop: 14,
      }}>
        {stages.map((s) => (
          <div key={s.stage} style={{
            background: '#0f1a2e',
            border: `1px solid ${s.fill}33`,
            borderTop: `2px solid ${s.fill}`,
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {s.stage}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginTop: 2 }}>
              {s.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
