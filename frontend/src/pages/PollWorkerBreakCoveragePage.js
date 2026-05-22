import React, { useEffect, useState } from 'react';
import { getToken } from '../services/api';

export default function PollWorkerBreakCoveragePage() {
  const [data, setData] = useState({ summary: {}, coverage: [] });
  const [result, setResult] = useState(null);

  const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

  useEffect(() => {
    fetch('/api/poll-worker-break-coverage', { headers: authHeaders() }).then((res) => res.json()).then(setData);
  }, []);

  const rebalance = async (id) => {
    const res = await fetch('/api/poll-worker-break-coverage/rebalance', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ id }),
    });
    setResult(await res.json());
  };

  return (
    <section>
      <h1>Poll Worker Break Coverage</h1>
      <p>Find uncovered statutory break windows and assign floaters without leaving critical stations empty.</p>
      <div className="cards">
        {Object.entries(data.summary).map(([key, value]) => <div className="card" key={key}><span>{key}</span><strong>{value}</strong></div>)}
      </div>
      {data.coverage.map((item) => (
        <div className="card" key={item.id}>
          <strong>{item.precinct}</strong> · {item.role} · {item.window}
          <p>{item.gapMinutes} minute gap · backup {item.backup}</p>
          <button className="btn primary" onClick={() => rebalance(item.id)}>Rebalance</button>
        </div>
      ))}
      {result && <div className="card">{result.recommendation} {result.signoff}</div>}
    </section>
  );
}
