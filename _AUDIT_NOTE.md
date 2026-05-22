# Audit Note — AIElectionPollWorkerOps

Domain: election poll worker operations — recruitment, training, assignment, equipment chain-of-custody, incident reporting. Tone: neutral; election integrity is sensitive.

## Inventory

- CRUD resources (factory-backed, 6-line stubs): 18
  - `pollWorkers`, `precincts`, `trainingSessions`, `equipment`, `chainOfCustody`, `incidentReports`, `voterLines`, `ballots`, `ballotDropBoxes`, `electionJudges`, `observers`, `recounts`, `supplies`, `vehicles`, `transmissions`, `languageSupport`, `accessibilityAudits`, `auditLog`
- Support routes: `auth`, `dashboard`, `notifications`, `webhooks`, `attachments`, `customViews`
- AI endpoints in `backend/routes/ai.js`: 17 POST + `/samples`, `/history`
  - `line-wait-forecast`, `equipment-reallocate`, `incident-triage`, `recount-readiness-brief`, `chain-of-custody-anomaly`, `executive-brief`, `poll-worker-schedule`, `language-support-plan`, `accessibility-gap-analyze`, `observer-coordination`, `supply-resupply-plan`, `transmission-anomaly`, `ballot-routing`, `training-gap-analysis`, `voter-communication-draft`, `post-election-report`

## Requested Gap Coverage

### AI counterparts
- Assignment optimizer (skills/availability/proximity) — COVERED by `poll-worker-schedule` (verify proximity input).
- Training Q&A copilot — MISSING (only gap-analysis exists).
- Incident-report drafter — PARTIAL; `incident-triage` triages but does not draft narrative report.
- Voter-line surge predictor — COVERED by `line-wait-forecast`.
- Accessibility issue triage — COVERED by `accessibility-gap-analyze`.

### Non-AI features
- Poll worker CRUD — PRESENT.
- Training records — PRESENT (`trainingSessions`).
- Equipment chain-of-custody — PRESENT (`equipment`, `chainOfCustody`).
- Communications — PRESENT (`notifications`, `webhooks`, `voter-communication-draft`).

### Custom features
- Anti-disinformation training quizzes — MISSING.
- Multilingual rules translation — PARTIAL; `language-support-plan` plans coverage but does not translate rule text.
- Post-election lessons-learned synthesizer — COVERED by `post-election-report`.

## Backlog (prioritized)

1. **MECHANICAL** `POST /api/ai/training-qa-copilot` — answer poll-worker procedure questions grounded in jurisdiction handbook.
2. **MECHANICAL** `POST /api/ai/incident-report-draft` — convert triage notes + structured fields into formal incident narrative (sensitive; require human review flag).
3. **MECHANICAL** `POST /api/ai/disinformation-quiz-generate` — scenario-based quiz items; emphasize official-source citations.
4. **MECHANICAL** `POST /api/ai/rules-translate` — translate procedural rules across supported languages with disclaimer + back-translation check.
5. **NEEDS-PRODUCT-DECISION** Human-in-the-loop sign-off workflow for any AI output touching incident records or voter-facing comms.

## Implemented (this round)

None — audit-only.

## Status

Audit-only. No code changes. 17 AI endpoints + 18 CRUD resources catalogued; 4 mechanical AI gaps and 1 governance decision queued.

## Apply pass 7 (full backlog implementation)

All 4 MECHANICAL items and the NEEDS-PRODUCT-DECISION governance item are now wired end-to-end. No new dependencies. Tone is neutral throughout; every AI output that flows into voter-facing comms or incident records carries `requires_review: true` and lands in an `ai_approvals` row that cannot transition to `approved` without a named `approver_id` and a server-stamped `approval_timestamp`.

### New AI endpoints (4) — `backend/routes/ai.js` + `backend/services/ai.js`
- `POST /api/ai/training-qa-copilot` — handbook-grounded poll-worker Q&A. Refuses + escalates when handbook excerpt is empty.
- `POST /api/ai/incident-report-draft` — formal narrative drafter. Sensitive: auto-opens pending `ai_approvals` row (`resource_type=incident_report`).
- `POST /api/ai/disinformation-quiz-generate` — scenario-based quiz items; each item requires an official-source citation (EAC / state SoS / CISA / NIST).
- `POST /api/ai/rules-translate` — multilingual rule translation with back-translation drift notes + unofficial-translation disclaimer. Sensitive: auto-opens pending `ai_approvals` row (`resource_type=rules_translation`).

Existing `POST /api/ai/voter-communication-draft` is also patched to auto-open a pending `ai_approvals` row (`resource_type=voter_comm`) and return `requires_review: true` with `approval_id`. No breaking changes — fields are additive.

`SAMPLES` extended with 5 fixtures per new verb so `/api/ai/samples?feature=<verb>` works in the UI.

### New approvals API — `backend/routes/aiApprovals.js`, mounted at `/api/ai-approvals`
- `GET /api/ai-approvals?status=&feature=&limit=` — queue (default 50, max 500).
- `GET /api/ai-approvals/:id` — full row including JSONB payload.
- `POST /api/ai-approvals` — manually open a ticket (rare; usually auto-created).
- `POST /api/ai-approvals/:id/approve` — body `{ approver_id, notes? }`. Server stamps `approval_timestamp = NOW()`. 409 if not pending. 400 if `approver_id` missing (no anonymous sign-off).
- `POST /api/ai-approvals/:id/reject` — body `{ approver_id, rejection_reason }`. Both required.

Mount point in `backend/server.js` placed under the `authenticateToken` fence, alongside the other AI routes (no 404 handler exists — last `app.use` wins).

### Schema — `backend/migrations/003_schema.sql`
- New table `ai_approvals (id, feature, ai_result_id, resource_type, resource_id, payload JSONB, status, requires_review, requested_by, approver_id, approval_timestamp, rejection_reason, notes, created_at, updated_at)` with two indexes (`(feature, status, created_at DESC)`, `(resource_type, resource_id)`).
- `backend/seed/seed.js` extended to read `003_schema.sql` and to `DROP TABLE IF EXISTS ai_approvals CASCADE` on its destructive reset.

### Frontend pages (5) — `frontend/src/pages/`
- `AITrainingQaCopilotPage.js` — handbook-grounded Q&A.
- `AIIncidentReportDraftPage.js` — drafter with structured fields + triage notes.
- `AIDisinformationQuizPage.js` — quiz generator (topic / count / audience).
- `AIRulesTranslatePage.js` — translator with source text + comma-sep target languages.
- `AIApprovalsPage.js` — sign-off queue with status / feature filter, modal review pane, approver-id field, approve/reject actions, server-rendered `approval_timestamp`.

All AI pages use the existing `AIPage` shell (samples / history dialog / generic input renderer), so they inherit fixture-driven onboarding for free. App.js routes + Sidebar links added (AI Ops gets Training Q&A Copilot + Disinformation Quiz + Rules Translate; AI Reporting gets Incident Report Draft; Governance gets AI Approvals).

### API client — `frontend/src/services/api.js`
- 4 new POST helpers: `aiTrainingQaCopilot`, `aiIncidentReportDraft`, `aiDisinformationQuizGen`, `aiRulesTranslate`.
- `aiApprovalsApi` object with `list / get / approve / reject`.

### Syntax check
`node --check` clean on every modified backend / shared `.js` file (`server.js`, `routes/ai.js`, `routes/aiApprovals.js`, `services/ai.js`, `seed/seed.js`, `frontend/src/services/api.js`). React JSX page files are not checked with `node --check` (they require Babel); they follow the established `AIPage` pattern used by the 16 existing AI pages.

### Skips
- No new npm dependencies. Approval UI uses inline styles; no new component library or icon set introduced.
- No backfill of `requires_review` on historical `ai_results` rows — sign-off applies prospectively from this pass forward.
- No automatic webhook fan-out on approval transitions — left to a future pass once webhook event taxonomy is agreed.

### Status

Backlog fully implemented. 17 → 21 AI POST endpoints. 18 CRUD entities unchanged. New `ai_approvals` table + `/api/ai-approvals` CRUD + governance UI close the human-in-the-loop loop for voter-facing and incident-record AI outputs.
