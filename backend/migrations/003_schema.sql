-- AIElectionPollWorkerOps schema (part 3: human-in-the-loop sign-off for sensitive AI outputs)
--
-- Pass 7 (full backlog) — adds approval workflow for any AI output that touches
-- voter-facing communications or incident records. Sign-off requires a named
-- approver_id and an approval_timestamp; nothing is "approved" by default.

CREATE TABLE IF NOT EXISTS ai_approvals (
  id                  SERIAL PRIMARY KEY,
  feature             VARCHAR(80) NOT NULL,        -- e.g. incident-report-draft, voter-communication-draft, rules-translate
  ai_result_id        INTEGER,                     -- optional pointer to ai_results.id
  resource_type       VARCHAR(60),                 -- incident_report | voter_comm | rules_translation | quiz | training_qa
  resource_id         VARCHAR(80),                 -- domain id (free-form; not all targets are SERIAL)
  payload             JSONB DEFAULT '{}'::jsonb,   -- snapshot of AI output under review
  status              VARCHAR(20) DEFAULT 'pending', -- pending | approved | rejected | superseded
  requires_review     BOOLEAN DEFAULT TRUE,        -- always true for incident/voter-facing AI
  requested_by        VARCHAR(150),                -- user email / id who triggered AI run
  approver_id         VARCHAR(150),                -- set only when an approver signs off
  approval_timestamp  TIMESTAMPTZ,                 -- set only when status flips to approved
  rejection_reason    TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_approvals_feature_status
  ON ai_approvals (feature, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_approvals_resource
  ON ai_approvals (resource_type, resource_id);
