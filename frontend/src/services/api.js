const API_BASE =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  'http://localhost:3087/api';

export { API_BASE };

const TOKEN_KEY = 'epw_token';
const USER_KEY  = 'epw_user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (_) {}
}
export function logout() {
  setToken(null);
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

// Role helpers
export function getRole() {
  return (getStoredUser()?.role || 'viewer').toLowerCase();
}
export function canWrite() {
  return ['admin', 'judge'].includes(getRole());
}
export function isCommander() {
  return getRole() === 'admin';
}
export function isAdmin() {
  return getRole() === 'admin';
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  } catch (e) {
    throw new Error(`Network error: ${e.message}`);
  }

  if (res.status === 401) {
    if (!url.startsWith('/auth/login')) {
      logout();
      throw new Error('Session expired');
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Generic CRUD factory
function crud(base) {
  return {
    list:   ()       => request(`/${base}`),
    get:    (id)     => request(`/${base}/${id}`),
    create: (data)   => request(`/${base}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, d)  => request(`/${base}/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id)     => request(`/${base}/${id}`, { method: 'DELETE' }),
    bulkImport: (csv) => request(`/${base}/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    }),
    listAttachments: (id) => request(`/${base}/${id}/attachments`),
    uploadAttachment: async (id, file) => {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/${base}/${id}/attachments`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      return data;
    },
  };
}

// 18 entities
export const precinctsApi             = crud('precincts');
export const pollWorkersApi           = crud('poll-workers');
export const equipmentApi             = crud('equipment');
export const ballotsApi               = crud('ballots');
export const chainOfCustodyApi        = crud('chain-of-custody');
export const trainingSessionsApi      = crud('training-sessions');
export const voterLinesApi            = crud('voter-lines');
export const incidentReportsApi       = crud('incident-reports');
export const electionJudgesApi        = crud('election-judges');
export const recountsApi              = crud('recounts');
export const observersApi             = crud('observers');
export const suppliesApi              = crud('supplies');
export const vehiclesApi              = crud('vehicles');
export const ballotDropBoxesApi       = crud('ballot-drop-boxes');
export const accessibilityAuditsApi   = crud('accessibility-audits');
export const languageSupportApi       = crud('language-support');
export const auditLogApi              = crud('audit-log');
export const transmissionsApi         = crud('transmissions');

// Dashboard
export const getDashboardStats = () => request('/dashboard');

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/auth/me');

// AI — 16 verbs
export const aiLineWaitForecast       = (body) => request('/ai/line-wait-forecast',       { method: 'POST', body: JSON.stringify(body || {}) });
export const aiEquipmentReallocate    = (body) => request('/ai/equipment-reallocate',     { method: 'POST', body: JSON.stringify(body || {}) });
export const aiIncidentTriage         = (body) => request('/ai/incident-triage',          { method: 'POST', body: JSON.stringify(body || {}) });
export const aiRecountReadinessBrief  = (body) => request('/ai/recount-readiness-brief',  { method: 'POST', body: JSON.stringify(body || {}) });
export const aiChainOfCustodyAnomaly  = (body) => request('/ai/chain-of-custody-anomaly', { method: 'POST', body: JSON.stringify(body || {}) });
export const aiExecutiveBrief         = (body) => request('/ai/executive-brief',          { method: 'POST', body: JSON.stringify(body || {}) });
export const aiPollWorkerSchedule     = (body) => request('/ai/poll-worker-schedule',     { method: 'POST', body: JSON.stringify(body || {}) });
export const aiLanguageSupportPlan    = (body) => request('/ai/language-support-plan',    { method: 'POST', body: JSON.stringify(body || {}) });
export const aiAccessibilityGap       = (body) => request('/ai/accessibility-gap-analyze',{ method: 'POST', body: JSON.stringify(body || {}) });
export const aiObserverCoordination   = (body) => request('/ai/observer-coordination',    { method: 'POST', body: JSON.stringify(body || {}) });
export const aiSupplyResupplyPlan     = (body) => request('/ai/supply-resupply-plan',     { method: 'POST', body: JSON.stringify(body || {}) });
export const aiTransmissionAnomaly    = (body) => request('/ai/transmission-anomaly',     { method: 'POST', body: JSON.stringify(body || {}) });
export const aiBallotRouting          = (body) => request('/ai/ballot-routing',           { method: 'POST', body: JSON.stringify(body || {}) });
export const aiTrainingGapAnalysis    = (body) => request('/ai/training-gap-analysis',    { method: 'POST', body: JSON.stringify(body || {}) });
export const aiVoterCommunicationDraft= (body) => request('/ai/voter-communication-draft',{ method: 'POST', body: JSON.stringify(body || {}) });
export const aiPostElectionReport     = (body) => request('/ai/post-election-report',     { method: 'POST', body: JSON.stringify(body || {}) });

// AI history
export const getAIHistory = (feature, limit = 25) => {
  const qs = new URLSearchParams({
    ...(feature ? { feature } : {}),
    limit: String(limit),
  }).toString();
  return request(`/ai/history?${qs}`);
};

// AI samples
export const getAISamples = (feature) => {
  const qs = new URLSearchParams({ feature: feature || '' }).toString();
  return request(`/ai/samples?${qs}`);
};

// Notifications
export const getNotifications       = () => request('/notifications');
export const getUnreadNotifications = () => request('/notifications/unread');
export const markNotificationRead   = (id) => request(`/notifications/${id}/read`, { method: 'POST' });
export const markAllNotificationsRead = () => request('/notifications/mark-all-read', { method: 'POST' });

// Webhooks
export const webhooksApi = {
  list:    ()         => request('/webhooks'),
  create:  (d)        => request('/webhooks',          { method: 'POST', body: JSON.stringify(d) }),
  update:  (id, d)    => request(`/webhooks/${id}`,    { method: 'PUT',  body: JSON.stringify(d) }),
  remove:  (id)       => request(`/webhooks/${id}`,    { method: 'DELETE' }),
  test:    (event, payload) => request('/webhooks/test', {
    method: 'POST',
    body: JSON.stringify({ event, payload }),
  }),
  deliveries: (id)    => request(`/webhooks/${id}/deliveries`),
};
