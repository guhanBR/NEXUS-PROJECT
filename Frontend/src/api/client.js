/**
 * Centralized API Client for Ryzen Matrix & RebalanceX Backend
 * Connected to Production Cloud Backend: https://nexus-project-y2eb.onrender.com
 */

import { Capacitor } from '@capacitor/core';

export const PRODUCTION_API_BASE_URL = 'https://nexus-project-y2eb.onrender.com';
const STORAGE_KEY_API_BASE = 'rebalancex_custom_api_base';

export function isNativeApp() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return typeof window !== 'undefined' && (
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:' ||
      (window.location.hostname === 'localhost' && window.navigator.userAgent.includes('Android'))
    );
  }
}

/**
 * Automatically migrate and clear obsolete PC/LAN development endpoints from localStorage
 * so previously installed apps cleanly switch to production cloud backend without manual reset.
 */
function sanitizeCustomUrl(url) {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (
    lower.includes('10.128.') ||
    lower.includes('10.0.2.2') ||
    lower.includes('127.0.0.1') ||
    lower.includes('localhost:8000') ||
    lower.includes('192.168.') ||
    lower.includes('0.0.0.0')
  ) {
    try {
      localStorage.removeItem(STORAGE_KEY_API_BASE);
    } catch {
      // ignore
    }
    return null;
  }
  return url;
}

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(STORAGE_KEY_API_BASE);
    if (custom && custom.trim()) {
      const valid = sanitizeCustomUrl(custom.trim().replace(/\/+$/, ''));
      if (valid) return valid;
    }
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, '');

  // Default to deployed production cloud backend
  return PRODUCTION_API_BASE_URL;
}

export function setApiBaseUrl(url) {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim() || url.trim() === PRODUCTION_API_BASE_URL) {
      localStorage.removeItem(STORAGE_KEY_API_BASE);
    } else {
      let formatted = url.trim().replace(/\/+$/, '');
      if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = `https://${formatted}`;
      }
      localStorage.setItem(STORAGE_KEY_API_BASE, formatted);
    }
  }
}

export async function testConnection(customUrl) {
  let target = (customUrl !== undefined ? customUrl : getApiBaseUrl()).trim().replace(/\/+$/, '');
  if (target && !target.startsWith('http://') && !target.startsWith('https://')) {
    target = `https://${target}`;
  }

  const testUrl = target ? `${target}/health` : `${PRODUCTION_API_BASE_URL}/health`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s for cloud cold-start

  try {
    const res = await fetch(testUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: true, url: target, data };
    }
    return {
      success: false,
      url: target,
      message: `Server returned HTTP ${res.status}: ${res.statusText}`,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const msg = err.name === 'AbortError'
      ? 'Connection timed out. The cloud server may be waking up.'
      : (err.message || 'Unable to reach backend');
    return { success: false, url: target, message: msg };
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
    if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch'))) {
      throw new Error(
        'Unable to reach the server. Please verify your mobile data or Wi-Fi connection. (If the server is waking up, please retry in a few moments).'
      );
    }
    throw err;
  }
}

export const api = {
  // Base configuration helpers
  getBaseUrl: getApiBaseUrl,
  setBaseUrl: setApiBaseUrl,
  isNative: isNativeApp,
  testConnection,

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
  updateTask: (arg1, arg2, arg3) => {
    // Supports both api.updateTask(taskId, data) and api.updateTask(projectId, taskId, data)
    const taskId = typeof arg2 === 'object' && arg2 !== null ? arg1 : arg2;
    const data = typeof arg2 === 'object' && arg2 !== null ? arg2 : (arg3 || {});
    return request(`/api/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
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
