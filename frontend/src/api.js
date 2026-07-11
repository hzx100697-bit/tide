const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `请求失败 (${res.status})`);
  }
  return res.json();
}

export const api = {
  // 聊天
  listSessions: () => request('/chat/sessions'),
  createSession: () => request('/chat/sessions', { method: 'POST' }),
  getMessages: (id) => request(`/chat/sessions/${id}/messages`),
  sendMessage: (id, content, apiKey) =>
    request(`/chat/sessions/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, apiKey })
    }),
  deleteSession: (id) => request(`/chat/sessions/${id}`, { method: 'DELETE' }),

  // 日记
  listJournal: () => request('/journal'),
  addJournal: (data) => request('/journal', { method: 'POST', body: JSON.stringify(data) }),
  deleteJournal: (id) => request(`/journal/${id}`, { method: 'DELETE' }),
  journalTrend: (days = 14) => request(`/journal/stats/trend?days=${days}`),

  // 测评
  getPhq9Questions: () => request('/assessment/phq9/questions'),
  submitPhq9: (answers) => request('/assessment/phq9', { method: 'POST', body: JSON.stringify({ answers }) }),
  assessmentHistory: () => request('/assessment/history'),

  // 呼吸练习
  getTechniques: () => request('/breathing/techniques'),
  completeBreathing: (technique, durationSeconds) =>
    request('/breathing/complete', { method: 'POST', body: JSON.stringify({ technique, durationSeconds }) }),
  breathingStats: () => request('/breathing/stats')
};
