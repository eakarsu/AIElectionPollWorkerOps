const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const ai = require('../services/ai');

async function record(feature, input, output) {
  try {
    await pool.query(
      'INSERT INTO ai_results (feature, input, output) VALUES ($1, $2, $3)',
      [feature, input || {}, output || {}]
    );
  } catch (e) {
    console.warn(`[ai] failed to record ${feature}:`, e.message);
  }
}

// ──────────────────────────────────────────────────────────────
// Sample fills (5 per verb) — realistic election scenarios.
// ──────────────────────────────────────────────────────────────
const SAMPLES = {
  'line-wait-forecast': [
    { label: 'Default — all precincts', values: { notes: '' } },
    { label: 'Focus high-turnout PCT-013 / PCT-009', values: { notes: 'Weight forecast toward Harrison Sports Complex (PCT-013) and Hayes High School (PCT-009) with historical peak surges 5-7pm.' } },
    { label: 'Rainy weather scenario', values: { notes: 'Heavy rain expected 4-7pm; voters bunching at sheltered precincts (PCT-008 Truman Civic Hall, PCT-004 Roosevelt Middle).' } },
    { label: 'Equipment-degraded PCT-014', values: { notes: 'PCT-014 Arthur Community Church on generator after power outage; one fewer scanner online; redirect overflow risk to PCT-013.' } },
    { label: 'Lunch-rush bias', values: { notes: 'Downtown commuter precincts (PCT-001 Lincoln, PCT-002 Madison) likely to spike 11:30-1:30pm.' } },
  ],

  'equipment-reallocate': [
    { label: 'Default — current snapshot', values: { notes: '' } },
    { label: 'Scanner failure at PCT-008', values: { notes: 'Ballot scanner BSN-A-0294 at PCT-008 Truman Civic Hall offline; need replacement from nearest precinct or central warehouse within 45 min.' } },
    { label: 'EPollbook sync failure PCT-004', values: { notes: 'EPollbook EPB-C-4409 at PCT-004 unable to sync to county registration db; swap with calibrated spare.' } },
    { label: 'Surge prep for PCT-013', values: { notes: 'PCT-013 Harrison Sports Complex needs additional ballot marking device to handle 4200-voter surge precinct.' } },
    { label: 'ADA unit shortage', values: { notes: 'PCT-005 Adams Senior Center reports ADA audio unit nonfunctional; relocate ADA-D-0034 from PCT-009 if redundant.' } },
  ],

  'incident-triage': [
    { label: 'Default — open incidents', values: { notes: '' } },
    { label: 'Prioritize voter-intimidation cases', values: { notes: 'Weight rank toward voter_intimidation type and incidents at PCT-003.' } },
    { label: 'Prioritize accessibility blockers', values: { notes: 'Weight rank toward accessibility_barrier and ADA-related incidents.' } },
    { label: 'Equipment first (keep voting going)', values: { notes: 'Weight rank toward equipment_malfunction, scanner_jam, epollbook_offline.' } },
    { label: 'Power / facilities critical', values: { notes: 'Weight rank toward power_outage, parking_overflow, facilities-related issues.' } },
  ],

  'recount-readiness-brief': [
    { label: 'Default — all in-progress + requested recounts', values: { notes: '' } },
    { label: 'Focus Mayor race recount', values: { notes: 'Focus on Mayor — City of Springfield recount (RC-9001, RC-9007, RC-9012).' } },
    { label: 'Focus ballot-measure recounts', values: { notes: 'Focus on Ballot Measure 1, 2, 3 recounts.' } },
    { label: 'Council District recounts', values: { notes: 'Focus on Council District 2, 4, 6, 7 recounts.' } },
    { label: 'Tight-margin priority', values: { notes: 'Order races by margin tightness; flag any under 0.5 percent.' } },
  ],

  'chain-of-custody-anomaly': [
    { label: 'Default — all custody events', values: { notes: '' } },
    { label: 'Focus ballot bag transfers', values: { notes: 'Focus on sealed ballot bag transfers from Central Warehouse to precincts.' } },
    { label: 'Focus memory card transfers', values: { notes: 'Focus on memory card lot transfers (M-101, M-102).' } },
    { label: 'Focus equipment handoffs', values: { notes: 'Focus on equipment handoffs (ePollbook tablets, ADA audio units).' } },
    { label: 'Focus post-close recount transport', values: { notes: 'Focus on Recount transport bag transfers from chief judges to County Board.' } },
  ],

  'executive-brief': [
    { label: 'Default — full snapshot', values: { notes: '' } },
    { label: 'Bias toward incidents', values: { notes: 'Bias the brief toward open and investigating incidents and risk posture.' } },
    { label: 'Bias toward accessibility', values: { notes: 'Bias the brief toward accessibility audit scores and ADA-related issues.' } },
    { label: 'Bias toward recounts', values: { notes: 'Bias the brief toward recount workload and chain-of-custody status.' } },
    { label: 'Bias toward turnout / wait', values: { notes: 'Bias the brief toward turnout, voter line waits, and surge capacity.' } },
  ],

  'poll-worker-schedule': [
    { label: 'Default — all precincts', values: { notes: '' } },
    { label: 'Replace no-show at PCT-005', values: { notes: 'Worker PW-1007 Sarah Johansson at PCT-005 reported no_show; backfill from training pool.' } },
    { label: 'Surge staffing PCT-013', values: { notes: 'Add 2 additional clerks at PCT-013 Harrison Sports Complex to absorb expected 4200-voter surge.' } },
    { label: 'Spanish coverage gap', values: { notes: 'Ensure every precinct above 25 percent Spanish-speaking voters has at least one bilingual ES worker.' } },
    { label: 'Mandarin coverage at PCT-013', values: { notes: 'Mei Lin (PW-1014) at PCT-013 is sole ZH worker; need backup for split shifts.' } },
  ],

  'language-support-plan': [
    { label: 'Default — current snapshot', values: { notes: '' } },
    { label: 'Add Vietnamese coverage', values: { notes: 'New demographic shift: add Vietnamese (vi) coverage at PCT-006 and PCT-008.' } },
    { label: 'Add Tagalog at PCT-008', values: { notes: 'PCT-008 Truman Civic Hall serves growing Filipino-American population; need Tagalog (tl) interpreters and materials.' } },
    { label: 'Polish coverage at PCT-011', values: { notes: 'PCT-011 Garfield VFW Post 12 has historic Polish-American community; ensure pl materials and one interpreter.' } },
    { label: 'Russian coverage at PCT-014', values: { notes: 'PCT-014 Arthur Community Church serves Russian-speaking residents; add ru materials and interpreter.' } },
  ],

  'accessibility-gap-analyze': [
    { label: 'Default — all audits', values: { notes: '' } },
    { label: 'Critical-only (score < 70)', values: { notes: 'Focus on precincts with audit score below 70 (PCT-005, PCT-011, PCT-014).' } },
    { label: 'Focus entrance / ramp issues', values: { notes: 'Focus on physical entrance, ramp, curb-cut, and walkway issues.' } },
    { label: 'Focus audio / ADA booth issues', values: { notes: 'Focus on ADA audio unit availability and tactile signage.' } },
    { label: 'Focus parking and path-of-travel', values: { notes: 'Focus on ADA parking spots and accessible path-of-travel from lot to entrance.' } },
  ],

  'observer-coordination': [
    { label: 'Default — all observers', values: { notes: '' } },
    { label: 'Ensure partisan parity', values: { notes: 'Each precinct should have at least one D-leaning and one R-leaning observer where possible.' } },
    { label: 'Press credentialing focus', values: { notes: 'Focus on press observers and confirm press_pass status for each.' } },
    { label: 'Civil-rights org coverage', values: { notes: 'Ensure civil-rights organizations (NAACP, ACLU, NALEO, AAAJ, MFV) have at least one observer at high-traffic precincts.' } },
    { label: 'Uncovered precincts fill', values: { notes: 'Identify precincts with zero observers assigned and propose reassignment.' } },
  ],

  'supply-resupply-plan': [
    { label: 'Default — current low-stock items', values: { notes: '' } },
    { label: 'Provisional envelope emergency', values: { notes: 'Provisional envelopes at low (1200 with reorder_point 400); plan emergency dispatch to PCT-003 and PCT-010 which issued most provisionals.' } },
    { label: 'Toner cartridge run', values: { notes: 'Toner cartridges low (22 with reorder_point 10); plan toner top-up to precincts running printers.' } },
    { label: 'ADA magnifier replenishment', values: { notes: 'ADA magnifying sheets low (180 with reorder_point 80); priority to PCT-005, PCT-009, PCT-014.' } },
    { label: 'Stickers + pens normal cycle', values: { notes: 'Routine cycle: ensure stickers and pens replenished mid-day.' } },
  ],

  'transmission-anomaly': [
    { label: 'Default — all transmissions', values: { notes: '' } },
    { label: 'Focus failed transmissions', values: { notes: 'Focus on failed status (TX-1804 PCT-004, TX-1813 PCT-014).' } },
    { label: 'Focus pending overdue', values: { notes: 'Focus on pending transmissions that are overdue (TX-1809 PCT-009).' } },
    { label: 'Focus results-only', values: { notes: 'Focus only on unofficial_results transmissions to County Election Board.' } },
    { label: 'Focus audit_log_batch + incident_summary', values: { notes: 'Focus on audit_log_batch and incident_summary transmissions to the State Board of Elections.' } },
  ],

  'ballot-routing': [
    { label: 'Default — current snapshot', values: { notes: '' } },
    { label: 'Drop-box pickup priority', values: { notes: 'Prioritize drop-box pickups for boxes above 70 percent capacity.' } },
    { label: 'Provisional ballot reserves', values: { notes: 'Increase provisional ballot allocations at PCT-003 and PCT-010 where disputes opened.' } },
    { label: 'Absentee return surge', values: { notes: 'Absentee returns surging at DBX-1401 City Hall Plaza and DBX-1409 Downtown Transit Hub; plan extra pickup runs.' } },
    { label: 'Mid-day rebalance', values: { notes: 'Rebalance in-person ballot stock between PCT-013 (high turnout) and PCT-007 (low turnout).' } },
  ],

  'training-gap-analysis': [
    { label: 'Default — current pool', values: { notes: '' } },
    { label: 'Chief judge certification gap', values: { notes: 'Focus on chief_judge role and EJ-CERT certification requirement.' } },
    { label: 'ADA / accessibility training', values: { notes: 'Focus on ADA / accessibility compliance training topic.' } },
    { label: 'Cybersecurity awareness gap', values: { notes: 'Focus on cybersecurity awareness session attendance.' } },
    { label: 'Recount procedure training', values: { notes: 'Focus on recount procedure training completion before election night.' } },
  ],

  'voter-communication-draft': [
    {
      label: 'Polling place change',
      values: {
        audience: 'Voters assigned to PCT-014 Arthur Community Church',
        situation: 'Due to a power outage at the original location, voting for PCT-014 has been temporarily relocated to PCT-013 Harrison Sports Complex for the remainder of the day. Ballots cast at the new site are valid.',
        channels: 'sms, email, public_notice',
      },
    },
    {
      label: 'Long wait notice',
      values: {
        audience: 'Voters at PCT-009 Hayes High School and PCT-013 Harrison Sports Complex',
        situation: 'Lines at both precincts currently exceed 45 minutes due to high turnout. Voters in line by 7:00 PM will be allowed to vote; consider visiting earlier or trying nearby PCT-010 McKinley Church Annex which has shorter lines.',
        channels: 'sms, public_dashboard, social_media',
      },
    },
    {
      label: 'Drop box closure',
      values: {
        audience: 'Voters who use ballot drop boxes',
        situation: 'Drop box DBX-1413 at Industrial Park Gate 4 is temporarily out of service for maintenance. Nearest alternate boxes are DBX-1410 Riverside Community Center and DBX-1409 Downtown Transit Hub.',
        channels: 'email, public_notice, website',
      },
    },
    {
      label: 'Provisional ballot guidance',
      values: {
        audience: 'Voters who cast provisional ballots today',
        situation: 'If you cast a provisional ballot, you have 7 days to verify your eligibility at the County Election Board. Bring photo ID and proof of residency. Your vote will be counted once eligibility is confirmed.',
        channels: 'sms, email, multilingual_print',
      },
    },
    {
      label: 'Recount notification',
      values: {
        audience: 'General public and press',
        situation: 'A mandatory recount has been initiated for the Mayor — City of Springfield race covering precincts PCT-001, PCT-002, PCT-003, PCT-007, PCT-012, PCT-015. Recount is open to credentialed observers and begins at 8:00 AM tomorrow at the County Election Board.',
        channels: 'press_release, website, social_media',
      },
    },
  ],

  'post-election-report': [
    { label: 'Default — full report', values: { notes: '' } },
    { label: 'Focus on incidents', values: { notes: 'Lead with incident counts, severity distribution, and resolution times.' } },
    { label: 'Focus on wait times', values: { notes: 'Lead with wait-time distribution, p50/p95/p99, and worst-precinct narratives.' } },
    { label: 'Focus on accessibility outcomes', values: { notes: 'Lead with accessibility audit scores and ADA-related incidents/resolutions.' } },
    { label: 'Focus on recount throughput', values: { notes: 'Lead with recount initiation, completion times, and chain-of-custody integrity.' } },
  ],
};

// GET /api/ai/samples?feature=<verb>
router.get('/samples', (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    if (!feature) {
      return res.json({ features: Object.keys(SAMPLES) });
    }
    const samples = SAMPLES[feature];
    if (!samples) {
      return res.status(404).json({ error: `unknown feature: ${feature}` });
    }
    res.json({ feature, samples });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/ai/history?feature=<name>&limit=<n>
router.get('/history', async (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 200);
    let r;
    if (feature) {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results WHERE feature = $1 ORDER BY created_at DESC LIMIT $2',
        [feature, limit]
      );
    } else {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
    }
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// Helpers — assemble snapshots from DB.
// ──────────────────────────────────────────────────────────────
async function snapshotPrecincts() {
  const r = await pool.query('SELECT * FROM precincts ORDER BY id ASC LIMIT 30');
  return r.rows;
}
async function snapshotEquipment() {
  const r = await pool.query('SELECT * FROM equipment ORDER BY id ASC LIMIT 50');
  return r.rows;
}
async function snapshotVoterLines() {
  const r = await pool.query('SELECT * FROM voter_lines ORDER BY ts DESC LIMIT 30');
  return r.rows;
}
async function snapshotIncidents() {
  const r = await pool.query("SELECT * FROM incident_reports WHERE status IN ('open','investigating','mitigated') ORDER BY opened_at DESC LIMIT 30");
  return r.rows;
}
async function snapshotRecounts() {
  const r = await pool.query("SELECT * FROM recounts WHERE status IN ('requested','in_progress') ORDER BY id ASC LIMIT 30");
  return r.rows;
}
async function snapshotCustody() {
  const r = await pool.query('SELECT * FROM chain_of_custody ORDER BY ts DESC LIMIT 50');
  return r.rows;
}
async function snapshotWorkers() {
  const r = await pool.query('SELECT * FROM poll_workers ORDER BY id ASC LIMIT 50');
  return r.rows;
}
async function snapshotLanguage() {
  const r = await pool.query('SELECT * FROM language_support ORDER BY id ASC LIMIT 50');
  return r.rows;
}
async function snapshotAccessibility() {
  const r = await pool.query('SELECT * FROM accessibility_audits ORDER BY id ASC LIMIT 50');
  return r.rows;
}
async function snapshotObservers() {
  const r = await pool.query('SELECT * FROM observers ORDER BY id ASC LIMIT 50');
  return r.rows;
}
async function snapshotSupplies() {
  const r = await pool.query('SELECT * FROM supplies ORDER BY id ASC LIMIT 50');
  return r.rows;
}
async function snapshotVehicles() {
  const r = await pool.query('SELECT * FROM vehicles ORDER BY id ASC LIMIT 50');
  return r.rows;
}
async function snapshotTransmissions() {
  const r = await pool.query('SELECT * FROM transmissions ORDER BY sent_at DESC LIMIT 50');
  return r.rows;
}
async function snapshotBallots() {
  const r = await pool.query('SELECT * FROM ballots ORDER BY id ASC LIMIT 50');
  return r.rows;
}
async function snapshotDropBoxes() {
  const r = await pool.query('SELECT * FROM ballot_drop_boxes ORDER BY id ASC LIMIT 50');
  return r.rows;
}
async function snapshotTraining() {
  const r = await pool.query('SELECT * FROM training_sessions ORDER BY id ASC LIMIT 50');
  return r.rows;
}

// ──────────────────────────────────────────────────────────────
// 1. POST /api/ai/line-wait-forecast
// ──────────────────────────────────────────────────────────────
router.post('/line-wait-forecast', async (req, res) => {
  try {
    const [precincts, lines] = await Promise.all([snapshotPrecincts(), snapshotVoterLines()]);
    const snap = { precincts, recent_voter_lines: lines, ...(req.body?.notes ? { notes: req.body.notes } : {}) };
    const result = await ai.lineWaitForecast(snap);
    await record('line-wait-forecast', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. POST /api/ai/equipment-reallocate
router.post('/equipment-reallocate', async (req, res) => {
  try {
    const [precincts, equipment] = await Promise.all([snapshotPrecincts(), snapshotEquipment()]);
    const snap = { precincts, equipment, ...(req.body?.notes ? { notes: req.body.notes } : {}) };
    const result = await ai.equipmentReallocate(snap);
    await record('equipment-reallocate', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. POST /api/ai/incident-triage
router.post('/incident-triage', async (req, res) => {
  try {
    let incidents = req.body?.incidents;
    if (!incidents) incidents = await snapshotIncidents();
    const result = await ai.incidentTriage(incidents);
    await record('incident-triage', { count: incidents.length, notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. POST /api/ai/recount-readiness-brief
router.post('/recount-readiness-brief', async (req, res) => {
  try {
    const [recounts, custody, judges] = await Promise.all([
      snapshotRecounts(),
      snapshotCustody(),
      pool.query("SELECT * FROM election_judges WHERE status = 'active' ORDER BY id ASC LIMIT 30").then(r => r.rows),
    ]);
    const snap = { recounts, custody, judges, ...(req.body?.notes ? { notes: req.body.notes } : {}) };
    const result = await ai.recountReadinessBrief(snap);
    await record('recount-readiness-brief', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. POST /api/ai/chain-of-custody-anomaly
router.post('/chain-of-custody-anomaly', async (req, res) => {
  try {
    let events = req.body?.events;
    if (!events) events = await snapshotCustody();
    const result = await ai.chainOfCustodyAnomaly(events);
    await record('chain-of-custody-anomaly', { count: events.length, notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. POST /api/ai/executive-brief
router.post('/executive-brief', async (req, res) => {
  try {
    const [precincts, incidents, lines, recounts, tx] = await Promise.all([
      pool.query("SELECT COUNT(*) FILTER (WHERE status='open') AS open, COUNT(*) FILTER (WHERE status != 'open') AS issues, COUNT(*) AS total FROM precincts").then(r => r.rows[0]),
      pool.query("SELECT COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) FILTER (WHERE severity='high') AS high, COUNT(*) AS total FROM incident_reports").then(r => r.rows[0]),
      pool.query("SELECT COALESCE(MAX(wait_minutes),0) AS max_wait, COALESCE(AVG(wait_minutes),0)::int AS avg_wait FROM voter_lines").then(r => r.rows[0]),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='in_progress') AS in_progress, COUNT(*) FILTER (WHERE status='requested') AS requested, COUNT(*) AS total FROM recounts").then(r => r.rows[0]),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='failed') AS failed, COUNT(*) FILTER (WHERE status='pending') AS pending, COUNT(*) AS total FROM transmissions").then(r => r.rows[0]),
    ]);
    const snapshot = {
      precincts, incidents, voter_lines: lines, recounts, transmissions: tx,
      ...(req.body?.notes ? { notes: req.body.notes } : {}),
    };
    const result = await ai.execBrief(snapshot);
    const out = { snapshot, brief: result };
    await record('executive-brief', { notes: req.body?.notes || null }, out);
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 7. POST /api/ai/poll-worker-schedule
router.post('/poll-worker-schedule', async (req, res) => {
  try {
    const [workers, precincts] = await Promise.all([snapshotWorkers(), snapshotPrecincts()]);
    const snap = { workers, precincts, ...(req.body?.notes ? { notes: req.body.notes } : {}) };
    const result = await ai.pollWorkerSchedule(snap);
    await record('poll-worker-schedule', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 8. POST /api/ai/language-support-plan
router.post('/language-support-plan', async (req, res) => {
  try {
    const [lang, precincts, workers] = await Promise.all([
      snapshotLanguage(), snapshotPrecincts(), snapshotWorkers(),
    ]);
    const snap = { language_support: lang, precincts, workers, ...(req.body?.notes ? { notes: req.body.notes } : {}) };
    const result = await ai.languageSupportPlan(snap);
    await record('language-support-plan', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 9. POST /api/ai/accessibility-gap-analyze
router.post('/accessibility-gap-analyze', async (req, res) => {
  try {
    const [audits, precincts] = await Promise.all([snapshotAccessibility(), snapshotPrecincts()]);
    const snap = { audits, precincts, ...(req.body?.notes ? { notes: req.body.notes } : {}) };
    const result = await ai.accessibilityGapAnalyze(snap);
    await record('accessibility-gap-analyze', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 10. POST /api/ai/observer-coordination
router.post('/observer-coordination', async (req, res) => {
  try {
    const [observers, precincts] = await Promise.all([snapshotObservers(), snapshotPrecincts()]);
    const snap = { observers, precincts, ...(req.body?.notes ? { notes: req.body.notes } : {}) };
    const result = await ai.observerCoordination(snap);
    await record('observer-coordination', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 11. POST /api/ai/supply-resupply-plan
router.post('/supply-resupply-plan', async (req, res) => {
  try {
    const [supplies, precincts, vehicles] = await Promise.all([
      snapshotSupplies(), snapshotPrecincts(), snapshotVehicles(),
    ]);
    const snap = { supplies, precincts, vehicles, ...(req.body?.notes ? { notes: req.body.notes } : {}) };
    const result = await ai.supplyResupplyPlan(snap);
    await record('supply-resupply-plan', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 12. POST /api/ai/transmission-anomaly
router.post('/transmission-anomaly', async (req, res) => {
  try {
    let transmissions = req.body?.transmissions;
    if (!transmissions) transmissions = await snapshotTransmissions();
    const result = await ai.transmissionAnomaly(transmissions);
    await record('transmission-anomaly', { count: transmissions.length, notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 13. POST /api/ai/ballot-routing
router.post('/ballot-routing', async (req, res) => {
  try {
    const [ballots, boxes, precincts, vehicles] = await Promise.all([
      snapshotBallots(), snapshotDropBoxes(), snapshotPrecincts(), snapshotVehicles(),
    ]);
    const snap = { ballots, ballot_drop_boxes: boxes, precincts, vehicles, ...(req.body?.notes ? { notes: req.body.notes } : {}) };
    const result = await ai.ballotRouting(snap);
    await record('ballot-routing', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 14. POST /api/ai/training-gap-analysis
router.post('/training-gap-analysis', async (req, res) => {
  try {
    const [training, workers] = await Promise.all([snapshotTraining(), snapshotWorkers()]);
    const snap = { training_sessions: training, workers, ...(req.body?.notes ? { notes: req.body.notes } : {}) };
    const result = await ai.trainingGapAnalysis(snap);
    await record('training-gap-analysis', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 15. POST /api/ai/voter-communication-draft
router.post('/voter-communication-draft', async (req, res) => {
  try {
    const { audience, situation, channels } = req.body || {};
    if (!audience || !situation) {
      return res.status(400).json({ error: 'audience and situation are required' });
    }
    const chList = Array.isArray(channels)
      ? channels
      : (typeof channels === 'string' ? channels.split(',').map(s => s.trim()).filter(Boolean) : []);
    const result = await ai.voterCommunicationDraft(audience, situation, chList);
    await record('voter-communication-draft', { audience, situation, channels: chList }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 16. POST /api/ai/post-election-report
router.post('/post-election-report', async (req, res) => {
  try {
    const [precincts, incidents, lines, recounts, tx, custody, observers] = await Promise.all([
      snapshotPrecincts(),
      pool.query('SELECT * FROM incident_reports ORDER BY id ASC LIMIT 50').then(r => r.rows),
      pool.query('SELECT * FROM voter_lines ORDER BY id ASC LIMIT 50').then(r => r.rows),
      pool.query('SELECT * FROM recounts ORDER BY id ASC LIMIT 50').then(r => r.rows),
      snapshotTransmissions(),
      snapshotCustody(),
      snapshotObservers(),
    ]);
    const snap = {
      precincts, incidents, voter_lines: lines, recounts, transmissions: tx, custody, observers,
      ...(req.body?.notes ? { notes: req.body.notes } : {}),
    };
    const result = await ai.postElectionReport(snap);
    await record('post-election-report', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
