// AI Approvals — human-in-the-loop sign-off workflow for sensitive AI outputs.
// Pass 7: any AI output touching incident records or voter-facing comms enters
// ai_approvals as pending. An authorized approver must supply approver_id; the
// server stamps approval_timestamp on transition to approved.

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const SENSITIVE_FEATURES = new Set([
  'voter-communication-draft',
  'incident-report-draft',
  'rules-translate',
]);

// GET /api/ai-approvals?status=pending&feature=<f>&limit=<n>
router.get('/', async (req, res) => {
  try {
    const status = (req.query.status || '').toString();
    const feature = (req.query.feature || '').toString();
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
    const where = [];
    const args = [];
    if (status) { args.push(status); where.push(`status = $${args.length}`); }
    if (feature) { args.push(feature); where.push(`feature = $${args.length}`); }
    args.push(limit);
    const sql = `SELECT id, feature, ai_result_id, resource_type, resource_id, status,
                        requires_review, requested_by, approver_id, approval_timestamp,
                        rejection_reason, notes, created_at, updated_at
                 FROM ai_approvals
                 ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY created_at DESC
                 LIMIT $${args.length}`;
    const r = await pool.query(sql, args);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/ai-approvals/:id  — full payload
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM ai_approvals WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai-approvals  — manually open an approval ticket (rare; usually auto-created)
router.post('/', async (req, res) => {
  try {
    const {
      feature, ai_result_id, resource_type, resource_id, payload, notes,
    } = req.body || {};
    if (!feature) return res.status(400).json({ error: 'feature is required' });
    const requires_review = SENSITIVE_FEATURES.has(feature) ? true : !!req.body?.requires_review;
    const requested_by = req.user?.email || req.user?.id || req.body?.requested_by || null;
    const r = await pool.query(
      `INSERT INTO ai_approvals
         (feature, ai_result_id, resource_type, resource_id, payload, status, requires_review, requested_by, notes)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8)
       RETURNING *`,
      [feature, ai_result_id || null, resource_type || null, resource_id || null,
       payload || {}, requires_review, requested_by, notes || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai-approvals/:id/approve  — body: { approver_id, notes? }
router.post('/:id/approve', async (req, res) => {
  try {
    const approver_id = req.body?.approver_id || req.user?.email || req.user?.id;
    if (!approver_id) {
      return res.status(400).json({ error: 'approver_id is required (named approver, no anonymous sign-off)' });
    }
    const notes = req.body?.notes || null;
    const r = await pool.query(
      `UPDATE ai_approvals
         SET status = 'approved',
             approver_id = $1,
             approval_timestamp = NOW(),
             notes = COALESCE($2, notes),
             updated_at = NOW()
       WHERE id = $3 AND status = 'pending'
       RETURNING *`,
      [approver_id, notes, req.params.id]
    );
    if (r.rows.length === 0) {
      return res.status(409).json({ error: 'approval not pending or not found' });
    }
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/ai-approvals/:id/reject  — body: { approver_id, rejection_reason }
router.post('/:id/reject', async (req, res) => {
  try {
    const approver_id = req.body?.approver_id || req.user?.email || req.user?.id;
    const rejection_reason = req.body?.rejection_reason;
    if (!approver_id) return res.status(400).json({ error: 'approver_id is required' });
    if (!rejection_reason) return res.status(400).json({ error: 'rejection_reason is required' });
    const r = await pool.query(
      `UPDATE ai_approvals
         SET status = 'rejected',
             approver_id = $1,
             approval_timestamp = NOW(),
             rejection_reason = $2,
             updated_at = NOW()
       WHERE id = $3 AND status = 'pending'
       RETURNING *`,
      [approver_id, rejection_reason, req.params.id]
    );
    if (r.rows.length === 0) {
      return res.status(409).json({ error: 'approval not pending or not found' });
    }
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
