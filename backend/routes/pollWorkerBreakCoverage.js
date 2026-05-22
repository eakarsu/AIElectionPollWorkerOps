const express = require('express');

const router = express.Router();

const coverage = [
  { id: 1, precinct: 'P-101', role: 'check-in desk', window: '10:00-10:30', gapMinutes: 15, backup: 'Floater A' },
  { id: 2, precinct: 'P-204', role: 'ballot scanner', window: '12:30-13:00', gapMinutes: 0, backup: 'Judge Malik' },
  { id: 3, precinct: 'P-309', role: 'curbside voting', window: '15:00-15:30', gapMinutes: 20, backup: 'Floater C' },
];

router.get('/', (req, res) => {
  res.json({
    summary: {
      windowsTracked: coverage.length,
      uncoveredWindows: coverage.filter((item) => item.gapMinutes > 0).length,
      maxGapMinutes: Math.max(...coverage.map((item) => item.gapMinutes)),
    },
    coverage,
  });
});

router.post('/rebalance', (req, res) => {
  const item = coverage.find((entry) => entry.id === Number(req.body?.id)) || coverage[0];
  res.json({
    precinct: item.precinct,
    recommendation: item.gapMinutes > 0 ? `Assign ${item.backup} to ${item.role} during ${item.window}.` : 'Coverage is already complete.',
    signoff: 'Election judge approval required before schedule publication.',
  });
});

module.exports = router;
