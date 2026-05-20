import React, { useEffect, useState, useCallback } from 'react';
import WaitHeatmap from '../components/WaitHeatmap';
import CustodyTrail from '../components/CustodyTrail';
import EquipmentGrid from '../components/EquipmentGrid';
import BallotSankey from '../components/BallotSankey';
import { API_BASE, getToken } from '../services/api';

async function fetchView(path) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export default function CustomViewsPage() {
  const [state, setState] = useState({
    heatmap:   { loading: true, data: null, error: null },
    custody:   { loading: true, data: null, error: null },
    equipment: { loading: true, data: null, error: null },
    sankey:    { loading: true, data: null, error: null },
  });

  const loadAll = useCallback(() => {
    setState((s) => ({
      heatmap:   { ...s.heatmap,   loading: true, error: null },
      custody:   { ...s.custody,   loading: true, error: null },
      equipment: { ...s.equipment, loading: true, error: null },
      sankey:    { ...s.sankey,    loading: true, error: null },
    }));
    fetchView('/custom-views/wait-heatmap')
      .then((data) => setState((s) => ({ ...s, heatmap: { loading: false, data, error: null } })))
      .catch((e) => setState((s) => ({ ...s, heatmap: { loading: false, data: null, error: e.message } })));
    fetchView('/custom-views/custody-trail')
      .then((data) => setState((s) => ({ ...s, custody: { loading: false, data, error: null } })))
      .catch((e) => setState((s) => ({ ...s, custody: { loading: false, data: null, error: e.message } })));
    fetchView('/custom-views/equipment-grid')
      .then((data) => setState((s) => ({ ...s, equipment: { loading: false, data, error: null } })))
      .catch((e) => setState((s) => ({ ...s, equipment: { loading: false, data: null, error: e.message } })));
    fetchView('/custom-views/ballot-sankey')
      .then((data) => setState((s) => ({ ...s, sankey: { loading: false, data, error: null } })))
      .catch((e) => setState((s) => ({ ...s, sankey: { loading: false, data: null, error: e.message } })));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <div data-testid="custom-views-page">
      <div className="page-header">
        <div>
          <h2>Election Analytics</h2>
          <p>Live operational analytics across precincts, custody, equipment and ballots.</p>
        </div>
        <button className="btn secondary" onClick={loadAll}>Refresh</button>
      </div>

      <WaitHeatmap
        data={state.heatmap.data}
        loading={state.heatmap.loading}
        error={state.heatmap.error}
      />

      <BallotSankey
        data={state.sankey.data}
        loading={state.sankey.loading}
        error={state.sankey.error}
      />

      <EquipmentGrid
        data={state.equipment.data}
        loading={state.equipment.loading}
        error={state.equipment.error}
      />

      <CustodyTrail
        data={state.custody.data}
        loading={state.custody.loading}
        error={state.custody.error}
      />
    </div>
  );
}
