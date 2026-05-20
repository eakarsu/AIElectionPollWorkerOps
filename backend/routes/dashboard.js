const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [
      precincts, poll_workers, equipment, ballots, chain_of_custody, training_sessions,
      voter_lines, incident_reports, election_judges, recounts, observers, supplies,
      vehicles, ballot_drop_boxes, accessibility_audits, language_support, audit_log, transmissions,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='open') AS open, COUNT(*) FILTER (WHERE status NOT IN ('open','')) AS issues FROM precincts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='no_show') AS no_show FROM poll_workers"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='ready') AS ready, COUNT(*) FILTER (WHERE status='offline') AS offline FROM equipment"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(count),0) AS total_count FROM ballots"),
      pool.query("SELECT COUNT(*) AS total FROM chain_of_custody"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='completed') AS completed, COUNT(*) FILTER (WHERE status='scheduled') AS scheduled FROM training_sessions"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='long_wait') AS long_wait, COALESCE(MAX(wait_minutes),0) AS max_wait FROM voter_lines"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) FILTER (WHERE severity='high') AS high, COUNT(*) FILTER (WHERE status='open') AS open FROM incident_reports"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM election_judges"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='in_progress') AS in_progress, COUNT(*) FILTER (WHERE status='requested') AS requested FROM recounts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='accredited') AS accredited FROM observers"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='low') AS low FROM supplies"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='available') AS available, COUNT(*) FILTER (WHERE status='en_route') AS en_route FROM vehicles"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='operational') AS operational FROM ballot_drop_boxes"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(AVG(score),0)::int AS avg_score FROM accessibility_audits"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='staffed') AS staffed FROM language_support"),
      pool.query("SELECT COUNT(*) AS total FROM audit_log"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='failed') AS failed, COUNT(*) FILTER (WHERE status='pending') AS pending FROM transmissions"),
    ]);
    res.json({
      precincts: precincts.rows[0],
      poll_workers: poll_workers.rows[0],
      equipment: equipment.rows[0],
      ballots: ballots.rows[0],
      chain_of_custody: chain_of_custody.rows[0],
      training_sessions: training_sessions.rows[0],
      voter_lines: voter_lines.rows[0],
      incident_reports: incident_reports.rows[0],
      election_judges: election_judges.rows[0],
      recounts: recounts.rows[0],
      observers: observers.rows[0],
      supplies: supplies.rows[0],
      vehicles: vehicles.rows[0],
      ballot_drop_boxes: ballot_drop_boxes.rows[0],
      accessibility_audits: accessibility_audits.rows[0],
      language_support: language_support.rows[0],
      audit_log: audit_log.rows[0],
      transmissions: transmissions.rows[0],
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
