/**
 * Centralized API Client for Ryzen Matrix & RebalanceX Backend
 * Native Capacitor & Web adaptive configuration
 */

import { Capacitor } from '@capacitor/core';

const STORAGE_KEY_API_BASE = 'rebalancex_custom_api_base';

export function isNativeApp() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return typeof window !== 'undefined' && (
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:' ||
      window.location.hostname === 'localhost' && window.navigator.userAgent.includes('Android')
    );
  }
}

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(STORAGE_KEY_API_BASE);
    if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, '');

  // If running inside native Android WebView / Emulator and no URL provided
  if (isNativeApp()) {
    // 10.0.2.2 is the default Android emulator loopback to host machine
    return 'http://10.0.2.2:8000';
  }

  // Standard web relative path (proxied by Vite in dev or served on same domain)
  return '';
}

export function setApiBaseUrl(url) {
  if (typeof window !== 'undefined') {
    if (!url) {
      localStorage.removeItem(STORAGE_KEY_API_BASE);
    } else {
      localStorage.setItem(STORAGE_KEY_API_BASE, url.trim().replace(/\/+$/, ''));
    }
  }
}

async function request(url, options = {}) {
  const base = getApiBaseUrl();
  const fullUrl = `${base}${url}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = `API request failed with status ${response.status}`;
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errJson.message || errorDetail;
      } catch {
        // fallback
      }
      throw new Error(errorDetail);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const hint = isNativeApp()
        ? ` Cannot reach backend at ${fullUrl}. If using an emulator, ensure backend is running at http://127.0.0.1:8000 on your PC. If on a physical phone, set your PC's LAN IP in Settings.`
        : '';
      throw new Error(`Network connection error.${hint}`);
    }
    throw err;
  }
}

export const api = {
  // Base configuration helpers
  getBaseUrl: getApiBaseUrl,
  setBaseUrl: setApiBaseUrl,
  isNative: isNativeApp,

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
  formTeam: (projectId, data) => request(`/api/projects/${projectId}/team/recommend`, { method: 'POST', body: JSON.stringify(data) }),
  recommendTeam: (projectId, data) => request(`/api/projects/${projectId}/team/recommend`, { method: 'POST', body: JSON.stringify(data) }),
  confirmTeam: (projectId, data) => request(`/api/projects/${projectId}/team/confirm`, { method: 'POST', body: JSON.stringify(data) }),

  // Tasks & CPM Schedule
  createTask: (projectId, data) => request(`/api/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (taskId, data) => request(`/api/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  generateSchedule: (projectId) => request(`/api/projects/${projectId}/schedule`, { method: 'POST' }),

  // Crisis Simulator & Rebalancing (PS#18)
  simulateCrisis: (projectId, data) => request(`/api/projects/${projectId}/scenarios`, { method: 'POST', body: JSON.stringify(data) }),
  simulateWhatIf: (projectId, data) => {
    const payload = data.type ? data : {
      type: data.disruption_scenario === 'developer_outage' ? 'member_unavailable' :
            data.disruption_scenario === 'deadline_compression' ? 'deadline_shortened' :
            data.disruption_scenario === 'scope_expansion' ? 'urgent_task_added' :
            data.disruption_scenario || 'member_unavailable',
      params: data.params || {
        candidate_id: data.unavailable_candidate_ids?.[0] ? Number(data.unavailable_candidate_ids[0]) : undefined,
        new_deadline_days: data.compressed_deadline_days ? Number(data.compressed_deadline_days) : undefined,
      }
    };
    return request(`/api/projects/${projectId}/scenarios`, { method: 'POST', body: JSON.stringify(payload) });
  },
  getProposal: (id) => request(`/api/proposals/${id}`),
  approveProposal: (id) => request(`/api/proposals/${id}/approve`, { method: 'POST' }),
  approvePlan: (projectId, data) => {
    const proposalId = typeof data === 'object' ? data.proposal_id : data;
    return request(`/api/proposals/${proposalId}/approve`, { method: 'POST' });
  },
  rejectProposal: (id) => request(`/api/proposals/${id}/reject`, { method: 'POST' }),

  // Decision Audit History
  getHistory: (projectId) => request(`/api/projects/${projectId}/history`),

  // Demo Seed
  seedDemo: () => request('/api/demo/seed', { method: 'POST' }),
};
