/**
 * Centralized API Client for RebalanceX Backend
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => request('/health'),
  getDatabaseHealth: () => request('/health/database'),

  // Projects
  getProjects: () => request('/api/projects'),
  getProject: (id) => request(`/api/projects/${id}`),
  createProject: (data) => request('/api/projects', { method: 'POST', body: JSON.stringify(data) }),

  // Members / Candidates
  getMembers: () => request('/api/members'),
  createMember: (data) => request('/api/members', { method: 'POST', body: JSON.stringify(data) }),

  // Team Formation (PS#11)
  recommendTeam: (projectId, data) => request(`/api/projects/${projectId}/team/recommend`, { method: 'POST', body: JSON.stringify(data) }),
  confirmTeam: (projectId, data) => request(`/api/projects/${projectId}/team/confirm`, { method: 'POST', body: JSON.stringify(data) }),

  // Tasks & CPM Schedule
  createTask: (projectId, data) => request(`/api/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (taskId, data) => request(`/api/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  generateSchedule: (projectId) => request(`/api/projects/${projectId}/schedule`, { method: 'POST' }),

  // Crisis Simulator & Rebalancing (PS#18)
  simulateCrisis: (projectId, data) => request(`/api/projects/${projectId}/scenarios`, { method: 'POST', body: JSON.stringify(data) }),
  getProposal: (id) => request(`/api/proposals/${id}`),
  approveProposal: (id) => request(`/api/proposals/${id}/approve`, { method: 'POST' }),
  rejectProposal: (id) => request(`/api/proposals/${id}/reject`, { method: 'POST' }),

  // Decision Audit History
  getHistory: (projectId) => request(`/api/projects/${projectId}/history`),

  // Demo Seed
  seedDemo: () => request('/api/demo/seed', { method: 'POST' }),
};
