// AI helper service for AIElectionPollWorkerOps
// Reads OPENROUTER_API_KEY and OPENROUTER_MODEL from:
//   1. this project's .env (already loaded by server.js)
//   2. fallback: /Users/erolakarsu/projects/beauty-wellness-ai/.env (canonical source)
// Never overwrites or wipes credentials.

const fs = require('fs');
const path = require('path');

const FALLBACK_ENV = '/Users/erolakarsu/projects/beauty-wellness-ai/.env';

function readFallbackEnv() {
  try {
    if (!fs.existsSync(FALLBACK_ENV)) return {};
    const raw = fs.readFileSync(FALLBACK_ENV, 'utf8');
    const out = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      out[m[1]] = val;
    }
    return out;
  } catch (e) {
    console.warn('[ai] fallback env read failed:', e.message);
    return {};
  }
}

function getOpenRouterCreds() {
  const fb = readFallbackEnv();
  const key = process.env.OPENROUTER_API_KEY || fb.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || fb.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  return { key, model };
}

const SYSTEM_PROMPT =
  'You are a senior election administration analyst supporting a county election office. ' +
  'You provide rigorous, non-partisan reasoning on precinct operations, poll-worker staffing, equipment, ' +
  'chain-of-custody, voter line management, accessibility, language support, recounts and post-election ' +
  'reporting. Always return strict JSON in the exact schema requested. Be neutral, evidence-driven, and ' +
  'avoid partisan language. Treat all scenarios as tabletop / training exercises.';

function callOpenRouter(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const { key, model } = getOpenRouterCreds();
    if (!key) {
      return resolve({ error: 'OPENROUTER_API_KEY not configured' });
    }
    const https = require('https');
    const payload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:3086',
        'X-Title': 'AI Election Poll-Worker Ops',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            return resolve({ error: parsed.error.message || 'OpenRouter error', raw: body });
          }
          const content = parsed.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (e) {
          resolve({ error: 'AI response parse failed', raw: body });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

function safeJsonParse(response, fallback) {
  if (response && typeof response === 'object' && response.error) {
    return { ...fallback, error: response.error };
  }
  if (response == null) return { ...fallback, summary: '' };
  if (typeof response === 'object') return response;
  const text = String(response).trim();
  try { return JSON.parse(text); } catch (_) {}
  try {
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0, inStr = false, esc = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return JSON.parse(text.slice(start, i + 1)); }
      }
    }
  } catch (_) {}
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) return JSON.parse(fenced[1].trim());
  } catch (_) {}
  return { ...fallback, summary: text };
}

// ──────────────────────────────────────────────────────────────
// 1. Line wait forecast
// ──────────────────────────────────────────────────────────────
async function lineWaitForecast(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Forecast voter line wait times. Return strict JSON:
{
  "forecast_window_hours": number,
  "forecasts": [{
    "precinct_id": string,
    "current_wait_minutes": number,
    "forecast_peak_wait_minutes": number,
    "peak_time_local": string,
    "drivers": [string],
    "risk_level": "low"|"medium"|"high"|"critical"
  }],
  "system_wide_alerts": [string],
  "recommended_actions": [{ "precinct_id": string, "action": string, "priority": "low"|"medium"|"high" }],
  "summary": string
}`;
  const usr = `Operational snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', forecasts: [] });
}

// ──────────────────────────────────────────────────────────────
// 2. Equipment reallocate
// ──────────────────────────────────────────────────────────────
async function equipmentReallocate(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Recommend equipment reallocation across precincts. Return strict JSON:
{
  "moves": [{
    "eq_id": string,
    "type": string,
    "from_precinct_id": string,
    "to_precinct_id": string,
    "reason": string,
    "urgency": "routine"|"urgent"|"critical",
    "est_eta_minutes": number
  }],
  "blocked_precincts": [{ "precinct_id": string, "issue": string }],
  "net_capacity_change": [{ "precinct_id": string, "delta_units": number }],
  "summary": string
}`;
  const usr = `Equipment + precinct snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', moves: [] });
}

// ──────────────────────────────────────────────────────────────
// 3. Incident triage
// ──────────────────────────────────────────────────────────────
async function incidentTriage(incidents = []) {
  const sys = `${SYSTEM_PROMPT} Triage open election incidents. Return strict JSON:
{
  "triaged": [{
    "incident_id": string,
    "precinct_id": string,
    "type": string,
    "severity": "low"|"medium"|"high"|"critical",
    "priority_rank": number,
    "owner": string,
    "recommended_action": string,
    "sla_minutes": number
  }],
  "escalations": [{ "incident_id": string, "escalate_to": string, "reason": string }],
  "summary": string
}`;
  const usr = `Incidents:\n${JSON.stringify(incidents, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', triaged: [] });
}

// ──────────────────────────────────────────────────────────────
// 4. Recount readiness brief
// ──────────────────────────────────────────────────────────────
async function recountReadinessBrief(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a recount readiness brief. Return strict JSON:
{
  "races_in_scope": [{ "race": string, "precincts": [string], "margin_pct": number, "status": string }],
  "readiness_score": number,
  "gaps": [{ "area": string, "shortfall": string, "impact": "low"|"medium"|"high"|"critical" }],
  "staffing_needs": [{ "role": string, "count": number, "where": string }],
  "chain_of_custody_status": string,
  "estimated_completion_hours": number,
  "summary": string
}`;
  const usr = `Recount snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', gaps: [] });
}

// ──────────────────────────────────────────────────────────────
// 5. Chain-of-custody anomaly
// ──────────────────────────────────────────────────────────────
async function chainOfCustodyAnomaly(events = []) {
  const sys = `${SYSTEM_PROMPT} Detect anomalies in chain-of-custody events. Return strict JSON:
{
  "anomalies": [{
    "custody_id": string,
    "item": string,
    "anomaly_type": "gap"|"out_of_sequence"|"unauthorized_actor"|"location_mismatch"|"time_drift"|"missing_handoff",
    "severity": "low"|"medium"|"high"|"critical",
    "narrative": string,
    "recommended_action": string
  }],
  "clean_chains": number,
  "summary": string
}`;
  const usr = `Custody events:\n${JSON.stringify(events, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', anomalies: [] });
}

// ──────────────────────────────────────────────────────────────
// 6. Executive brief
// ──────────────────────────────────────────────────────────────
async function execBrief(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a county-level executive operational brief. Return strict JSON:
{
  "headline": string,
  "operational_picture": string,
  "precinct_readiness": { "open_pct": number, "issues_pct": number, "narrative": string },
  "active_incidents_summary": [{ "incident_id": string, "type": string, "status": string, "notes": string }],
  "top_risks": [{ "risk": string, "severity": "low"|"medium"|"high"|"critical", "owner": string }],
  "decisions_required": [{ "decision": string, "deadline": string, "options": [string], "recommendation": string }],
  "next_4h_outlook": string,
  "summary": string
}`;
  const usr = `Operational snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// ──────────────────────────────────────────────────────────────
// 7. Poll-worker schedule
// ──────────────────────────────────────────────────────────────
async function pollWorkerSchedule(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Recommend a poll-worker schedule. Return strict JSON:
{
  "shifts": [{
    "precinct_id": string,
    "shift": "open"|"mid"|"close"|"all_day",
    "required_roles": [{ "role": string, "count": number }],
    "assigned": [{ "worker_id": string, "name": string, "role": string }],
    "language_coverage": [string],
    "gap_warning": string
  }],
  "overall_coverage_pct": number,
  "actions": [{ "precinct_id": string, "action": string, "priority": "low"|"medium"|"high" }],
  "summary": string
}`;
  const usr = `Workers + precincts + shifts:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', shifts: [] });
}

// ──────────────────────────────────────────────────────────────
// 8. Language support plan
// ──────────────────────────────────────────────────────────────
async function languageSupportPlan(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a language-access plan that complies with VRA Section 203 spirit. Return strict JSON:
{
  "covered_languages": [string],
  "precinct_plans": [{
    "precinct_id": string,
    "languages": [string],
    "interpreters_required": number,
    "interpreters_assigned": number,
    "materials_required": [string],
    "gap_score": number
  }],
  "gaps": [{ "precinct_id": string, "language": string, "shortfall": string }],
  "recommended_actions": [{ "action": string, "priority": "low"|"medium"|"high" }],
  "summary": string
}`;
  const usr = `Language-support snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', precinct_plans: [] });
}

// ──────────────────────────────────────────────────────────────
// 9. Accessibility gap analyze
// ──────────────────────────────────────────────────────────────
async function accessibilityGapAnalyze(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Analyze accessibility gaps under ADA / HAVA guidance. Return strict JSON:
{
  "overall_score": number,
  "precincts": [{
    "precinct_id": string,
    "score": number,
    "blockers": [{ "issue": string, "severity": "low"|"medium"|"high"|"critical", "mitigation": string, "fix_eta_hours": number }],
    "compliant_areas": [string]
  }],
  "system_wide_recommendations": [string],
  "non_compliant_precincts": [string],
  "summary": string
}`;
  const usr = `Audits + precincts:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', precincts: [] });
}

// ──────────────────────────────────────────────────────────────
// 10. Observer coordination
// ──────────────────────────────────────────────────────────────
async function observerCoordination(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Plan observer coordination so coverage is balanced and partisan parity preserved where possible. Return strict JSON:
{
  "precinct_coverage": [{ "precinct_id": string, "observers_assigned": number, "orgs_present": [string], "balance_score": number, "notes": string }],
  "uncovered_precincts": [string],
  "rules_briefing_topics": [string],
  "recommended_actions": [{ "action": string, "owner": string }],
  "summary": string
}`;
  const usr = `Observers + precincts:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', precinct_coverage: [] });
}

// ──────────────────────────────────────────────────────────────
// 11. Supply resupply plan
// ──────────────────────────────────────────────────────────────
async function supplyResupplyPlan(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a resupply plan for poll-worker and voter supplies. Return strict JSON:
{
  "low_items": [{ "supply_id": string, "item": string, "qty": number, "reorder_point": number, "priority": "low"|"medium"|"high" }],
  "deliveries": [{ "from": string, "to_precinct_id": string, "items": [{ "item": string, "qty": number }], "vehicle_id": string, "eta_minutes": number }],
  "stockout_risks": [{ "item": string, "risk": "low"|"medium"|"high" }],
  "summary": string
}`;
  const usr = `Supplies + precincts + vehicles:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', deliveries: [] });
}

// ──────────────────────────────────────────────────────────────
// 12. Transmission anomaly
// ──────────────────────────────────────────────────────────────
async function transmissionAnomaly(transmissions = []) {
  const sys = `${SYSTEM_PROMPT} Detect anomalies across precinct transmissions of results / audit / incident data. Return strict JSON:
{
  "anomalies": [{
    "tx_id": string,
    "precinct_id": string,
    "anomaly_type": "late"|"failed"|"duplicate"|"out_of_order"|"unexpected_recipient"|"size_outlier",
    "severity": "low"|"medium"|"high"|"critical",
    "narrative": string,
    "recommended_action": string
  }],
  "clean_count": number,
  "summary": string
}`;
  const usr = `Transmissions:\n${JSON.stringify(transmissions, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', anomalies: [] });
}

// ──────────────────────────────────────────────────────────────
// 13. Ballot routing
// ──────────────────────────────────────────────────────────────
async function ballotRouting(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Recommend ballot routing (allocations + drop-box pickups + courier runs). Return strict JSON:
{
  "allocations": [{ "precinct_id": string, "ballot_type": string, "current_count": number, "recommended_count": number, "delta": number, "rationale": string }],
  "drop_box_pickups": [{ "box_id": string, "fullness_pct": number, "priority": "low"|"medium"|"high", "vehicle_id": string }],
  "courier_runs": [{ "from": string, "to": string, "items": [string], "eta_minutes": number }],
  "summary": string
}`;
  const usr = `Ballots + drop boxes + precincts:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', allocations: [] });
}

// ──────────────────────────────────────────────────────────────
// 14. Training gap analysis
// ──────────────────────────────────────────────────────────────
async function trainingGapAnalysis(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Analyze poll-worker training coverage and gaps. Return strict JSON:
{
  "topic_coverage": [{ "topic": string, "trained_count": number, "required_count": number, "gap": number }],
  "untrained_workers": [{ "worker_id": string, "name": string, "missing_topics": [string] }],
  "recommended_sessions": [{ "topic": string, "audience": string, "date": string, "instructor": string }],
  "compliance_score": number,
  "summary": string
}`;
  const usr = `Training + workers snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', topic_coverage: [] });
}

// ──────────────────────────────────────────────────────────────
// 15. Voter communication draft
// ──────────────────────────────────────────────────────────────
async function voterCommunicationDraft(audience, situation, channels = []) {
  const sys = `${SYSTEM_PROMPT} Draft a neutral, plain-language voter communication. Return strict JSON:
{
  "audience": string,
  "channels": [string],
  "messages": [{ "channel": string, "subject": string, "body": string, "language": string, "max_chars": number }],
  "translation_needed": [string],
  "approval_routing": [string],
  "summary": string
}`;
  const usr = `Audience: ${audience}\nSituation: ${situation}\nChannels: ${JSON.stringify(channels)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', messages: [] });
}

// ──────────────────────────────────────────────────────────────
// 16. Post-election report
// ──────────────────────────────────────────────────────────────
async function postElectionReport(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Generate a post-election operational report. Return strict JSON:
{
  "election_summary": { "precincts_reporting": number, "incidents_total": number, "incidents_critical": number, "wait_p95_minutes": number },
  "what_went_well": [string],
  "what_went_wrong": [string],
  "recommendations": [{ "area": string, "recommendation": string, "owner": string, "priority": "low"|"medium"|"high" }],
  "metrics_to_track": [string],
  "narrative": string,
  "summary": string
}`;
  const usr = `Full operational snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', recommendations: [] });
}

// ──────────────────────────────────────────────────────────────
// Pass 7 — Backlog AI verbs
// ──────────────────────────────────────────────────────────────

// 17. Training Q&A copilot — answer poll-worker procedure questions grounded in handbook.
async function trainingQaCopilot(question, handbookContext = '', role = 'poll_worker') {
  const sys = `${SYSTEM_PROMPT} You answer poll-worker procedure questions grounded ONLY in the supplied jurisdiction handbook excerpt. If the handbook does not cover the question, say so plainly and route to a chief judge. Return strict JSON:
{
  "question": string,
  "role": string,
  "answer": string,
  "citations": [{ "section": string, "excerpt": string }],
  "confidence": "low"|"medium"|"high",
  "escalate_to_chief_judge": boolean,
  "follow_up_questions": [string],
  "disclaimer": string,
  "summary": string
}`;
  const usr = `Role: ${role}\nQuestion: ${question}\n\nHandbook excerpt (authoritative):\n${handbookContext || '(no handbook excerpt provided — answer must indicate this and escalate)'}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', answer: '', citations: [] });
}

// 18. Incident report draft — convert triage notes + structured fields into formal narrative.
// Sensitive: caller wraps with requires_review:true and an ai_approvals row.
async function incidentReportDraft(fields = {}) {
  const sys = `${SYSTEM_PROMPT} You draft a FORMAL, NEUTRAL incident-report narrative for an election office. Use only the supplied structured facts; do NOT invent voters, motivations, partisan framing, or legal conclusions. State facts, observed actions, and operational impact. Return strict JSON:
{
  "incident_id": string,
  "precinct_id": string,
  "type": string,
  "severity": "low"|"medium"|"high"|"critical",
  "headline": string,
  "narrative": string,
  "structured_facts": [{ "field": string, "value": string }],
  "witnesses": [string],
  "operational_impact": string,
  "actions_taken": [string],
  "open_questions": [string],
  "neutrality_check": string,
  "summary": string
}`;
  const usr = `Structured incident fields + triage notes:\n${JSON.stringify(fields, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', narrative: '', structured_facts: [] });
}

// 19. Disinformation quiz generate — scenario-based items with official-source citations.
async function disinformationQuizGenerate(topic = '', count = 5, audience = 'poll_workers') {
  const sys = `${SYSTEM_PROMPT} You generate scenario-based anti-disinformation quiz items for poll-worker training. Each item must include an OFFICIAL source citation (EAC, state SoS, county election office, NIST, CISA). Do not promote any candidate, party, or policy position. Return strict JSON:
{
  "topic": string,
  "audience": string,
  "items": [{
    "id": string,
    "scenario": string,
    "question": string,
    "options": [{ "label": string, "text": string, "is_correct": boolean }],
    "rationale": string,
    "official_source": { "agency": string, "url_or_doc": string, "year": number },
    "skill_practiced": string
  }],
  "facilitator_notes": string,
  "summary": string
}`;
  const usr = `Topic: ${topic || 'general election misinformation'}\nDesired item count: ${count}\nAudience: ${audience}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', items: [] });
}

// 20. Rules translate — translate procedural rules across supported languages.
// Sensitive (voter-facing): caller wraps with requires_review:true + ai_approvals row.
async function rulesTranslate(sourceText = '', sourceLang = 'en', targetLangs = []) {
  const sys = `${SYSTEM_PROMPT} You translate procedural election rules into the requested languages. Preserve precise meaning of legal/procedural terms. After each translation, produce a back-translation to English for verification. Always include a disclaimer that translations are unofficial and the English source governs. Return strict JSON:
{
  "source_language": string,
  "source_text": string,
  "translations": [{
    "language": string,
    "translated_text": string,
    "back_translation_en": string,
    "back_translation_drift_notes": string,
    "translator_confidence": "low"|"medium"|"high",
    "needs_human_review": boolean
  }],
  "disclaimer": string,
  "summary": string
}`;
  const usr = `Source language: ${sourceLang}\nTarget languages: ${JSON.stringify(targetLangs)}\nSource text:\n${sourceText}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', translations: [] });
}

module.exports = {
  callOpenRouter,
  safeJsonParse,
  lineWaitForecast,
  equipmentReallocate,
  incidentTriage,
  recountReadinessBrief,
  chainOfCustodyAnomaly,
  execBrief,
  pollWorkerSchedule,
  languageSupportPlan,
  accessibilityGapAnalyze,
  observerCoordination,
  supplyResupplyPlan,
  transmissionAnomaly,
  ballotRouting,
  trainingGapAnalysis,
  voterCommunicationDraft,
  postElectionReport,
  trainingQaCopilot,
  incidentReportDraft,
  disinformationQuizGenerate,
  rulesTranslate,
};
