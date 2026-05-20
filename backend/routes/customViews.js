// Custom Views — 4 analytics endpoints supporting the
// "Election Analytics" dashboard on the frontend. All endpoints
// shape the underlying CRUD tables for charting and grid widgets.

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 1) PRECINCT WAIT-TIME HEATMAP
// For every precinct, return the latest voter_lines wait_minutes.
router.get('/wait-heatmap', async (req, res) => {
  try {
    const r = await pool.query(`
      WITH latest AS (
        SELECT DISTINCT ON (precinct_id)
          precinct_id, wait_minutes, queue_length, ts, status
        FROM voter_lines
        WHERE precinct_id IS NOT NULL
        ORDER BY precinct_id, ts DESC NULLS LAST, id DESC
      )
      SELECT
        p.precinct_id,
        p.name           AS precinct_name,
        p.ward,
        p.status         AS precinct_status,
        COALESCE(l.wait_minutes, 0)  AS wait_minutes,
        COALESCE(l.queue_length, 0)  AS queue_length,
        l.ts             AS sampled_at,
        l.status         AS line_status,
        CASE
          WHEN COALESCE(l.wait_minutes, 0) < 10 THEN 'green'
          WHEN COALESCE(l.wait_minutes, 0) <= 30 THEN 'amber'
          ELSE 'red'
        END              AS color_band
      FROM precincts p
      LEFT JOIN latest l ON l.precinct_id = p.precinct_id
      ORDER BY p.precinct_id ASC
    `);
    res.json({
      total: r.rows.length,
      green: r.rows.filter((x) => x.color_band === 'green').length,
      amber: r.rows.filter((x) => x.color_band === 'amber').length,
      red:   r.rows.filter((x) => x.color_band === 'red').length,
      cells: r.rows,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2) CHAIN-OF-CUSTODY TRAIL
// Group every chain_of_custody transfer by `item`, sorted oldest-first
// so the frontend can render a vertical timeline per item.
router.get('/custody-trail', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT id, custody_id, item, from_actor, to_actor, ts, location, notes
      FROM chain_of_custody
      ORDER BY item ASC NULLS LAST, ts ASC NULLS LAST, id ASC
    `);
    const groups = {};
    for (const row of r.rows) {
      const key = row.item || '(unspecified item)';
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    }
    const items = Object.entries(groups).map(([item, transfers]) => ({
      item,
      transfer_count: transfers.length,
      first_ts: transfers[0]?.ts || null,
      last_ts: transfers[transfers.length - 1]?.ts || null,
      transfers,
    }));
    // most-active items first
    items.sort((a, b) => b.transfer_count - a.transfer_count);
    res.json({
      total_items: items.length,
      total_transfers: r.rows.length,
      items,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3) EQUIPMENT STATUS GRID
// Each equipment row, normalized to one of three buckets.
router.get('/equipment-grid', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT id, eq_id, type, sn, precinct_id, status,
             last_calibration, notes
      FROM equipment
      ORDER BY precinct_id ASC NULLS LAST, eq_id ASC
    `);
    const bucketed = r.rows.map((row) => {
      const s = String(row.status || '').toLowerCase();
      let bucket = 'operational';
      if (['down', 'offline', 'broken', 'failed', 'error'].includes(s)) {
        bucket = 'down';
      } else if (['maint', 'maintenance', 'repair', 'calibrating', 'service'].includes(s)) {
        bucket = 'maint';
      } else if (['ready', 'operational', 'active', 'online', 'ok'].includes(s)) {
        bucket = 'operational';
      } else if (s) {
        bucket = 'maint';
      }
      return { ...row, bucket };
    });
    res.json({
      total: bucketed.length,
      operational: bucketed.filter((x) => x.bucket === 'operational').length,
      maint:       bucketed.filter((x) => x.bucket === 'maint').length,
      down:        bucketed.filter((x) => x.bucket === 'down').length,
      cells: bucketed,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4) BALLOT FLOW SANKEY
// Roll up ballot counts by canonical lifecycle stage so the
// frontend can render a vertical funnel (printed → delivered →
// cast → counted → certified).
router.get('/ballot-sankey', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT LOWER(COALESCE(status, '')) AS status,
             COALESCE(SUM(count), 0)::int AS total
      FROM ballots
      GROUP BY LOWER(COALESCE(status, ''))
    `);
    const buckets = {
      printed:    0,
      delivered:  0,
      cast:       0,
      counted:    0,
      certified:  0,
    };
    for (const row of r.rows) {
      const s = row.status;
      if (!s) { buckets.printed += row.total; continue; }
      if (s.includes('print'))            buckets.printed   += row.total;
      else if (s.includes('deliver')
            || s.includes('shipped')
            || s.includes('transit')
            || s.includes('received'))    buckets.delivered += row.total;
      else if (s.includes('cast')
            || s.includes('voted')
            || s.includes('returned'))    buckets.cast      += row.total;
      else if (s.includes('count')
            || s.includes('tally')
            || s.includes('scan'))        buckets.counted   += row.total;
      else if (s.includes('certif')
            || s.includes('final')
            || s.includes('audit')
            || s.includes('complete'))    buckets.certified += row.total;
      else                                buckets.printed   += row.total;
    }
    // Funnel monotonically narrows — never let a downstream stage
    // exceed the total of upstream stages. Backfill the largest
    // upstream from observed downstream so the funnel renders.
    const order = ['printed','delivered','cast','counted','certified'];
    for (let i = order.length - 1; i > 0; i--) {
      const cur = order[i];
      const prev = order[i - 1];
      if (buckets[cur] > buckets[prev]) {
        buckets[prev] = buckets[cur];
      }
    }
    const stages = order.map((name) => ({ stage: name, value: buckets[name] }));
    const printed = buckets.printed || 0;
    const certified = buckets.certified || 0;
    res.json({
      stages,
      totals: buckets,
      yield_pct: printed > 0 ? +((certified * 100) / printed).toFixed(1) : 0,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
