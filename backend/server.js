const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { authenticateToken } = require('./middleware/auth');
const pool = require('./config/database');
const { fireWebhook } = require('./services/webhooks');

const app = express();
const PORT = process.env.BACKEND_PORT || 3087;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3086,http://localhost:3087,http://localhost:3000')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Everything below requires a Bearer token.
app.use('/api', authenticateToken);

// 18 CRUD entities
app.use('/api/precincts',             require('./routes/precincts'));
app.use('/api/poll-workers',          require('./routes/pollWorkers'));
app.use('/api/equipment',             require('./routes/equipment'));
app.use('/api/ballots',               require('./routes/ballots'));
app.use('/api/chain-of-custody',      require('./routes/chainOfCustody'));
app.use('/api/training-sessions',     require('./routes/trainingSessions'));
app.use('/api/voter-lines',           require('./routes/voterLines'));
app.use('/api/incident-reports',      require('./routes/incidentReports'));
app.use('/api/election-judges',       require('./routes/electionJudges'));
app.use('/api/recounts',              require('./routes/recounts'));
app.use('/api/observers',             require('./routes/observers'));
app.use('/api/supplies',              require('./routes/supplies'));
app.use('/api/vehicles',              require('./routes/vehicles'));
app.use('/api/ballot-drop-boxes',     require('./routes/ballotDropBoxes'));
app.use('/api/accessibility-audits',  require('./routes/accessibilityAudits'));
app.use('/api/language-support',      require('./routes/languageSupport'));
app.use('/api/audit-log',             require('./routes/auditLog'));
app.use('/api/transmissions',         require('./routes/transmissions'));

// AI routes (16 verbs + history + samples; pass 7 adds 4 backlog verbs)
app.use('/api/ai', require('./routes/ai'));

// AI human-in-the-loop sign-off (pass 7)
app.use('/api/ai-approvals', require('./routes/aiApprovals'));

// Cross-cutting
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/attachments',   require('./routes/attachments'));
app.use('/api/webhooks',      require('./routes/webhooks'));

// Dashboard stats
app.use('/api/dashboard', require('./routes/dashboard'));

// Custom analytics views (heatmap, custody trail, equipment grid, ballot sankey)
app.use('/api/custom-views', require('./routes/customViews'));
app.use('/api/poll-worker-break-coverage', require('./routes/pollWorkerBreakCoverage'));

app.listen(PORT, () => {
  console.log(`\nAI Election Poll-Worker Ops API running on http://localhost:${PORT}\n`);
});
