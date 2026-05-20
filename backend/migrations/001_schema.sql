-- AIElectionPollWorkerOps schema (part 1: 18 domain entities)

CREATE TABLE IF NOT EXISTS precincts (
  id                  SERIAL PRIMARY KEY,
  precinct_id         VARCHAR(50) UNIQUE,
  name                VARCHAR(200) NOT NULL,
  ward                VARCHAR(60),
  address             VARCHAR(300),
  registered_voters   INTEGER DEFAULT 0,
  status              VARCHAR(30) DEFAULT 'open',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_workers (
  id                  SERIAL PRIMARY KEY,
  worker_id           VARCHAR(50) UNIQUE,
  name                VARCHAR(150),
  role                VARCHAR(80),
  precinct_id         VARCHAR(50),
  language            VARCHAR(60),
  status              VARCHAR(30) DEFAULT 'active',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment (
  id                  SERIAL PRIMARY KEY,
  eq_id               VARCHAR(50) UNIQUE,
  type                VARCHAR(80),
  sn                  VARCHAR(100),
  precinct_id         VARCHAR(50),
  status              VARCHAR(30) DEFAULT 'ready',
  last_calibration    DATE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ballots (
  id                  SERIAL PRIMARY KEY,
  ballot_id           VARCHAR(50) UNIQUE,
  precinct_id         VARCHAR(50),
  type                VARCHAR(60),
  count               INTEGER DEFAULT 0,
  period              VARCHAR(40),
  status              VARCHAR(30) DEFAULT 'pending',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chain_of_custody (
  id                  SERIAL PRIMARY KEY,
  custody_id          VARCHAR(50) UNIQUE,
  item                VARCHAR(200),
  from_actor          VARCHAR(150),
  to_actor            VARCHAR(150),
  ts                  TIMESTAMPTZ,
  location            VARCHAR(200),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_sessions (
  id                  SERIAL PRIMARY KEY,
  session_id          VARCHAR(50) UNIQUE,
  topic               VARCHAR(200),
  instructor          VARCHAR(150),
  attendees_count     INTEGER DEFAULT 0,
  date                DATE,
  status              VARCHAR(30) DEFAULT 'scheduled',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voter_lines (
  id                  SERIAL PRIMARY KEY,
  line_id             VARCHAR(50) UNIQUE,
  precinct_id         VARCHAR(50),
  ts                  TIMESTAMPTZ,
  wait_minutes        INTEGER DEFAULT 0,
  queue_length        INTEGER DEFAULT 0,
  status              VARCHAR(30) DEFAULT 'normal',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_reports (
  id                  SERIAL PRIMARY KEY,
  incident_id         VARCHAR(50) UNIQUE,
  precinct_id         VARCHAR(50),
  type                VARCHAR(80),
  severity            VARCHAR(20) DEFAULT 'low',
  opened_at           TIMESTAMPTZ,
  status              VARCHAR(30) DEFAULT 'open',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS election_judges (
  id                  SERIAL PRIMARY KEY,
  judge_id            VARCHAR(50) UNIQUE,
  name                VARCHAR(150),
  precinct_id         VARCHAR(50),
  party_affiliation   VARCHAR(60),
  certifications      VARCHAR(200),
  status              VARCHAR(30) DEFAULT 'active',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recounts (
  id                  SERIAL PRIMARY KEY,
  recount_id          VARCHAR(50) UNIQUE,
  race                VARCHAR(200),
  precinct_id         VARCHAR(50),
  status              VARCHAR(30) DEFAULT 'pending',
  started_at          TIMESTAMPTZ,
  ended_at            TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS observers (
  id                  SERIAL PRIMARY KEY,
  observer_id         VARCHAR(50) UNIQUE,
  name                VARCHAR(150),
  org                 VARCHAR(150),
  precinct_id         VARCHAR(50),
  accredited_at       TIMESTAMPTZ,
  status              VARCHAR(30) DEFAULT 'accredited',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplies (
  id                  SERIAL PRIMARY KEY,
  supply_id           VARCHAR(50) UNIQUE,
  item                VARCHAR(200),
  qty                 INTEGER DEFAULT 0,
  location            VARCHAR(200),
  reorder_point       INTEGER DEFAULT 0,
  status              VARCHAR(30) DEFAULT 'ok',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id                  SERIAL PRIMARY KEY,
  vehicle_id          VARCHAR(50) UNIQUE,
  type                VARCHAR(80),
  plate               VARCHAR(40),
  fuel_status         VARCHAR(40),
  location            VARCHAR(200),
  status              VARCHAR(30) DEFAULT 'available',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ballot_drop_boxes (
  id                  SERIAL PRIMARY KEY,
  box_id              VARCHAR(50) UNIQUE,
  location            VARCHAR(200),
  capacity            INTEGER DEFAULT 0,
  last_emptied        TIMESTAMPTZ,
  status              VARCHAR(30) DEFAULT 'operational',
  observer            VARCHAR(150),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accessibility_audits (
  id                  SERIAL PRIMARY KEY,
  audit_id            VARCHAR(50) UNIQUE,
  precinct_id         VARCHAR(50),
  auditor             VARCHAR(150),
  score               INTEGER DEFAULT 0,
  conducted_at        TIMESTAMPTZ,
  findings            TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS language_support (
  id                  SERIAL PRIMARY KEY,
  support_id          VARCHAR(50) UNIQUE,
  precinct_id         VARCHAR(50),
  language            VARCHAR(60),
  interpreter_count   INTEGER DEFAULT 0,
  materials_count     INTEGER DEFAULT 0,
  status              VARCHAR(30) DEFAULT 'planned',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id                  SERIAL PRIMARY KEY,
  entry_id            VARCHAR(50) UNIQUE,
  actor               VARCHAR(150),
  target              VARCHAR(200),
  action              VARCHAR(120),
  result              VARCHAR(80),
  ts                  TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transmissions (
  id                  SERIAL PRIMARY KEY,
  tx_id               VARCHAR(50) UNIQUE,
  precinct_id         VARCHAR(50),
  type                VARCHAR(80),
  sent_at             TIMESTAMPTZ,
  status              VARCHAR(30) DEFAULT 'pending',
  recipient           VARCHAR(150),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_results (
  id                  SERIAL PRIMARY KEY,
  feature             VARCHAR(80) NOT NULL,
  input               JSONB,
  output              JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_results_feature_created
  ON ai_results (feature, created_at DESC);
