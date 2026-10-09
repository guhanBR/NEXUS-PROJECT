/**
 * RebalanceX — Adaptive Project Intelligence
 * Master Application Controller, State Manager & Visualizer
 */

window.RebalanceApp = (function() {
  const API_BASE = '/api';

  // Application State
  const state = {
    activeProjectId: 1,
    projects: [],
    currentProject: null,
    candidates: [],
    currentProposal: null,
    skillChartInstance: null,
    activeTab: 'overview'
  };

  // ------------------- INITIALIZATION -------------------

  async function init() {
    setupTabNavigation();
    await loadProjects();
    await loadCandidates();
    await loadActiveProjectData();
    lucide.createIcons();
  }

  function setupTabNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
      });
    });
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.workspace-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${tabId}`);
    });

    if (tabId === 'resource-matrix') {
      renderSkillDistributionChart();
    }
    lucide.createIcons();
  }

  // ------------------- API DATA LOADERS -------------------

  async function loadProjects() {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      state.projects = await res.json();
      renderProjectSelector();
    } catch (err) {
      console.error('Error fetching projects:', err);
      showToast('Failed to load projects list', 'error');
    }
  }

  async function loadCandidates() {
    try {
      const res = await fetch(`${API_BASE}/candidates`);
      state.candidates = await res.json();
      renderSettingsCandidates();
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  }

  async function loadActiveProjectData() {
    if (!state.activeProjectId) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${state.activeProjectId}`);
      state.currentProject = await res.json();

      renderOverviewMetrics();
      renderOverviewCriticalPath();
      renderOverviewTeamBars();
      renderTeamFormationWorkspace();
      renderGanttChart();
      renderTasksTable();
      renderResourceHeatmap();
      loadDecisionHistory();
      renderScenarioParams();
      lucide.createIcons();
    } catch (err) {
      console.error('Error loading project details:', err);
    }
  }

  // ------------------- RENDERERS -------------------

  function renderProjectSelector() {
    const sel = document.getElementById('projectSelector');
    if (!sel) return;
    sel.innerHTML = state.projects.map(p => `
      <option value="${p.id}" ${p.id === state.activeProjectId ? 'selected' : ''}>
        ${p.name} (${p.deadline_days}d deadline)
      </option>
    `).join('');
  }

  function onProjectChange(newId) {
    state.activeProjectId = parseInt(newId);
    loadActiveProjectData();
    showToast(`Switched to project #${newId}`);
  }

  // 1. OVERVIEW
  function renderOverviewMetrics() {
    const p = state.currentProject;
    if (!p) return;

    const sm = p.schedule_metrics || {};
    document.getElementById('metric-makespan').innerText = `${sm.project_duration_days || 0} days`;
    document.getElementById('metric-makespan-sub').innerText = `Target Deadline: ${p.deadline_days} days`;

    const teamSize = p.team_members ? p.team_members.length : 0;
    document.getElementById('metric-team-size').innerText = `${teamSize} Specialists`;

    const critCount = sm.critical_path_task_ids ? sm.critical_path_task_ids.length : 0;
    document.getElementById('metric-critical-count').innerText = `${critCount} Tasks`;

    // Calculate avg team load
    let avgUtil = 0;
    const resUtils = Object.values(sm.resource_utilization || {});
    if (resUtils.length > 0) {
      avgUtil = Math.round(resUtils.reduce((acc, u) => acc + (u.utilization_pct || 0), 0) / resUtils.length);
    }
    document.getElementById('metric-team-load').innerText = `${avgUtil}%`;

    const statusBadge = document.getElementById('badge-schedule-status');
    if (sm.deadline_breached) {
      statusBadge.className = 'badge badge-danger';
      statusBadge.innerText = `Deadline Breached (+${sm.delay_days}d)`;
    } else {
      statusBadge.className = 'badge badge-success';
      statusBadge.innerText = 'Feasible Baseline';
    }
  }

  function renderOverviewCriticalPath() {
    const container = document.getElementById('overview-critical-list');
    if (!container || !state.currentProject) return;

    const tasks = state.currentProject.tasks || [];
    const critIds = new Set(state.currentProject.schedule_metrics?.critical_path_task_ids || []);
    const critTasks = tasks.filter(t => critIds.has(t.id));

    if (critTasks.length === 0) {
      container.innerHTML = `<div style="font-size:13px; color:var(--text-muted);">No critical path tasks identified.</div>`;
      return;
    }

    container.innerHTML = critTasks.map(t => {
      const assignedCand = state.candidates.find(c => c.id === t.assigned_candidate_id);
      const assigneeName = assignedCand ? assignedCand.name : 'Unassigned';
      return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background-color:var(--bg-surface-subtle); border-radius:var(--radius-md); border-left:3px solid var(--color-danger);">
          <div>
            <div style="font-weight:600; font-size:13.5px;">#${t.id}: ${t.title}</div>
            <div style="font-size:11.5px; color:var(--text-secondary); margin-top:2px;">
              Skill: <strong>${t.required_skill} (L${t.min_skill_level})</strong> &bull; Assignee: <strong>${assigneeName}</strong>
            </div>
          </div>
          <div style="text-align:right;">
            <span class="badge badge-critical-path">Day ${t.start_day} - ${t.end_day}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderOverviewTeamBars() {
    const container = document.getElementById('overview-team-bars');
    if (!container || !state.currentProject) return;

    const members = state.currentProject.team_members || [];
    const sm = state.currentProject.schedule_metrics?.resource_utilization || {};

    if (members.length === 0) {
      container.innerHTML = `<div style="font-size:13px; color:var(--text-muted);">No team members confirmed yet.</div>`;
      return;
    }

    container.innerHTML = members.map(m => {
      const util = sm[m.candidate_id] || { utilization_pct: 0, assigned_hours: 0, capacity_hours: 160 };
      const pct = Math.min(100, util.utilization_pct || 0);
      let fillClass = 'optimal';
      if (pct > 95) fillClass = 'overloaded';
      else if (pct < 40) fillClass = 'underutilized';

      return `
        <div>
          <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
            <span style="font-weight:600;">${m.name} <span style="font-weight:400; color:var(--text-muted);">(${m.role_in_project})</span></span>
            <span style="font-weight:600; color:var(--text-secondary);">${util.assigned_hours}h / ${util.capacity_hours}h (${util.utilization_pct}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill ${fillClass}" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. TEAM FORMATION WORKSPACE (PROBLEM STATEMENT #11)
  function renderTeamFormationWorkspace() {
    const p = state.currentProject;
    if (!p) return;

    // Set requirements input
    document.getElementById('tf-target-size').value = p.target_team_size || 4;
    document.getElementById('tf-domains-input').value = (p.domains || []).join(', ');

    const skillsContainer = document.getElementById('tf-skills-container');
    skillsContainer.innerHTML = (p.required_skills || []).map((req, idx) => `
      <div style="display:flex; gap:6px; align-items:center;">
        <input type="text" class="form-control req-skill-name" value="${req.skill}" style="flex:2;">
        <input type="number" class="form-control req-skill-lvl" value="${req.min_level}" min="1" max="5" style="width:60px;" title="Min Level">
        <label style="font-size:11px; display:flex; align-items:center; gap:4px; white-space:nowrap;">
          <input type="checkbox" class="req-skill-mand" ${req.mandatory ? 'checked' : ''}> Mand.
        </label>
        <button class="btn btn-secondary btn-sm" onclick="this.parentElement.remove()" style="padding:4px 8px;">&times;</button>
      </div>
    `).join('');

    // Render current confirmed team members
    const roster = document.getElementById('tf-team-roster');
    if (p.team_members && p.team_members.length > 0) {
      roster.innerHTML = p.team_members.map(m => {
        const cand = state.candidates.find(c => c.id === m.candidate_id) || {};
        const skillBadges = Object.entries(cand.skills || {}).map(([s, lvl]) => `
          <span class="badge badge-neutral" style="font-size:11px;">${s} L${lvl}</span>
        `).join('');

        return `
          <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; background-color:var(--bg-surface);">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
              <div style="width:36px; height:36px; border-radius:var(--radius-full); background-color:${m.avatar_color || '#2563EB'}; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px;">
                ${m.name.charAt(0)}
              </div>
              <div>
                <div style="font-weight:700; font-size:14px;">${m.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${m.role_in_project}</div>
              </div>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:10px;">
              ${skillBadges}
            </div>
            <div style="margin-top:12px; padding-top:10px; border-top:1px solid var(--border-subtle); font-size:12px; color:var(--text-secondary);">
              Match Score: <strong style="color:var(--color-primary);">${m.match_score || 95}%</strong>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function addSkillRequirementRow() {
    const container = document.getElementById('tf-skills-container');
    const div = document.createElement('div');
    div.style = 'display:flex; gap:6px; align-items:center;';
    div.innerHTML = `
      <input type="text" class="form-control req-skill-name" placeholder="Skill Name" style="flex:2;">
      <input type="number" class="form-control req-skill-lvl" value="3" min="1" max="5" style="width:60px;">
      <label style="font-size:11px; display:flex; align-items:center; gap:4px; white-space:nowrap;">
        <input type="checkbox" class="req-skill-mand" checked> Mand.
      </label>
      <button class="btn btn-secondary btn-sm" onclick="this.parentElement.remove()" style="padding:4px 8px;">&times;</button>
    `;
    container.appendChild(div);
  }

  async function runTeamFormation() {
    // Gather requirements from inputs
    const targetSize = parseInt(document.getElementById('tf-target-size').value) || 4;
    const domains = document.getElementById('tf-domains-input').value.split(',').map(s => s.trim()).filter(Boolean);

    const reqRows = document.querySelectorAll('#tf-skills-container > div');
    const requiredSkills = [];
    reqRows.forEach(row => {
      const name = row.querySelector('.req-skill-name').value.trim();
      const lvl = parseInt(row.querySelector('.req-skill-lvl').value) || 2;
      const mand = row.querySelector('.req-skill-mand').checked;
      if (name) {
        requiredSkills.push({ skill: name, min_level: lvl, mandatory: mand });
      }
    });

    showToast('Executing Multi-Objective Team Formation Algorithm...');

    try {
      const res = await fetch(`${API_BASE}/team-formation/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: state.activeProjectId,
          target_team_size: targetSize,
          required_skills: requiredSkills,
          domains: domains
        })
      });

      const data = await res.json();
      state.teamRecommendation = data;

      // Update scorecard
      document.getElementById('tf-compat-score').innerHTML = `${data.compatibility_score}<span style="font-size:20px; font-weight:500; color:var(--text-secondary);">/100</span>`;
      document.getElementById('tf-compat-summary').innerText = (data.selection_reasons || []).join(' ');

      // Render recommended team cards
      const roster = document.getElementById('tf-team-roster');
      roster.innerHTML = (data.recommended_team || []).map(cand => {
        const matchInfo = (data.individual_breakdowns || []).find(b => b.candidate_id === cand.id) || {};
        const skillBadges = Object.entries(cand.skills || {}).map(([s, lvl]) => `
          <span class="badge badge-neutral" style="font-size:11px;">${s} L${lvl}</span>
        `).join('');

        const reasonList = (matchInfo.reasons || []).map(r => `<li>${r}</li>`).join('');

        return `
          <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; background-color:var(--bg-surface); box-shadow:var(--shadow-sm);">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
              <div style="width:38px; height:38px; border-radius:var(--radius-full); background-color:${cand.avatar_color || '#2563EB'}; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:15px;">
                ${cand.name.charAt(0)}
              </div>
              <div>
                <div style="font-weight:700; font-size:14.5px;">${cand.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${cand.role_title}</div>
              </div>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:8px;">
              ${skillBadges}
            </div>
            <ul style="margin-top:10px; font-size:11.5px; color:var(--text-secondary); padding-left:16px; line-height:1.4;">
              ${reasonList}
            </ul>
            <div style="margin-top:12px; padding-top:10px; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; font-size:12px;">
              <span>Fit Score: <strong style="color:var(--color-primary);">${matchInfo.score || 90}%</strong></span>
              <span class="badge badge-success">Candidate Selected</span>
            </div>
          </div>
        `;
      }).join('');

      // Render coverage matrix table
      const tbody = document.getElementById('tf-coverage-tbody');
      tbody.innerHTML = Object.entries(data.coverage_matrix || {}).map(([skill, info]) => {
        let statusBadge = '<span class="badge badge-success">100% Covered</span>';
        if (info.status === 'missing') statusBadge = '<span class="badge badge-danger">Missing</span>';
        else if (info.status === 'partial') statusBadge = '<span class="badge badge-warning">Partial Level</span>';

        return `
          <tr>
            <td style="font-weight:600;">${skill} ${info.mandatory ? '<span style="color:var(--color-danger); font-size:11px;">*Mandatory</span>' : ''}</td>
            <td>Level ${info.required_level}+</td>
            <td>${statusBadge}</td>
            <td><strong>${info.lead_expert}</strong> (Level ${info.best_level})</td>
            <td>${info.qualified_count} candidate(s) in team</td>
          </tr>
        `;
      }).join('');

      // Render alternatives
      const altList = document.getElementById('tf-alternatives-list');
      altList.innerHTML = (data.alternative_candidates || []).map(alt => `
        <div style="padding:10px 14px; background-color:var(--bg-surface-subtle); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center; font-size:13px;">
          <div>
            <strong>${alt.name}</strong> (${alt.role_title}) &bull; <span style="color:var(--text-secondary);">${alt.experience_years} yrs exp</span>
            <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">${(alt.reasons || []).join(', ')}</div>
          </div>
          <span class="badge badge-neutral">Match Score: ${alt.match_score}%</span>
        </div>
      `).join('');

      showToast('Team recommendation generated successfully!', 'success');
      lucide.createIcons();
    } catch (err) {
      console.error('Error in team formation:', err);
      showToast('Team formation calculation failed', 'error');
    }
  }

  async function confirmRecommendedTeam() {
    if (!state.teamRecommendation || !state.teamRecommendation.recommended_team) {
      showToast('Please calculate a team recommendation first', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/projects/${state.activeProjectId}/confirm-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_members: state.teamRecommendation.recommended_team
        })
      });
      const data = await res.json();
      showToast(data.message || 'Team confirmed!', 'success');
      await loadActiveProjectData();
    } catch (err) {
      showToast('Failed to confirm team', 'error');
    }
  }

  // 3. TASK PLANNING & GANTT SCHEDULER
  function renderGanttChart() {
    const wrapper = document.getElementById('gantt-chart-wrapper');
    if (!wrapper || !state.currentProject) return;

    const tasks = state.currentProject.tasks || [];
    const maxDays = Math.max(25, Math.ceil(state.currentProject.schedule_metrics?.project_duration_days || 25));

    // Header days (0 to maxDays)
    let headerDaysHtml = '';
    for (let d = 0; d <= maxDays; d += 2) {
      headerDaysHtml += `<div class="gantt-day-mark">D${d}</div>`;
    }

    let rowsHtml = tasks.map(t => {
      const cand = state.candidates.find(c => c.id === t.assigned_candidate_id);
      const assignee = cand ? cand.name : 'Unassigned';
      const leftPct = ((t.start_day || 0) / maxDays) * 100;
      const dur = Math.max(0.5, (t.end_day || 1) - (t.start_day || 0));
      const widthPct = Math.min(100 - leftPct, (dur / maxDays) * 100);

      const isCrit = t.is_critical_path;
      const barClass = isCrit ? 'gantt-bar critical' : 'gantt-bar';

      return `
        <div class="gantt-row">
          <div class="gantt-task-meta">
            <div>#${t.id}: ${t.title}</div>
            <div class="assignee-tag">${assignee} (${t.required_skill})</div>
          </div>
          <div class="gantt-bar-area">
            <div class="${barClass}" style="left: ${leftPct}%; width: ${widthPct}%;" title="#${t.id} ${t.title}: Day ${t.start_day} - ${t.end_day}">
              ${dur}d
            </div>
          </div>
        </div>
      `;
    }).join('');

    wrapper.innerHTML = `
      <div class="gantt-header">
        <div class="gantt-label-col">Task & Assignee</div>
        <div class="gantt-timeline-col">${headerDaysHtml}</div>
      </div>
      <div class="gantt-body">
        ${rowsHtml}
      </div>
    `;
  }

  function renderTasksTable() {
    const tbody = document.getElementById('tasks-tbody');
    if (!tbody || !state.currentProject) return;

    const tasks = state.currentProject.tasks || [];
    tbody.innerHTML = tasks.map(t => {
      const cand = state.candidates.find(c => c.id === t.assigned_candidate_id);
      const assigneeName = cand ? cand.name : 'Unassigned';
      const deps = (t.dependencies || []).length > 0 ? t.dependencies.map(d => `#${d}`).join(', ') : 'None';

      const critBadge = t.is_critical_path ? '<span class="badge badge-critical-path">Critical Path</span>' : '<span class="badge badge-neutral">Standard</span>';

      return `
        <tr>
          <td style="font-weight:700;">#${t.id}</td>
          <td style="font-weight:600;">${t.title}</td>
          <td><span class="badge badge-neutral">${t.required_skill} (L${t.min_skill_level})</span></td>
          <td>${t.estimated_hours}h</td>
          <td><strong>${assigneeName}</strong></td>
          <td>Day ${t.start_day} - ${t.end_day}</td>
          <td>${t.slack_days || 0}d</td>
          <td style="font-size:12px; color:var(--text-secondary);">${deps}</td>
          <td><span class="badge badge-${t.priority === 'critical' ? 'danger' : 'primary'}">${t.priority}</span></td>
          <td>${critBadge}</td>
        </tr>
      `;
    }).join('');
  }

  async function recomputeSchedule() {
    showToast('Recomputing CPM Schedule...');
    try {
      const res = await fetch(`${API_BASE}/projects/${state.activeProjectId}/generate-schedule`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast('CPM Schedule successfully recalculated!', 'success');
        await loadActiveProjectData();
      }
    } catch (err) {
      showToast('Schedule calculation failed', 'error');
    }
  }

  // 4. RESOURCE MATRIX & HEATMAP
  function renderResourceHeatmap() {
    const container = document.getElementById('resource-heatmap-container');
    if (!container || !state.currentProject) return;

    const members = state.currentProject.team_members || [];
    const sm = state.currentProject.schedule_metrics?.resource_utilization || {};

    if (members.length === 0) {
      container.innerHTML = `<div style="padding:20px; color:var(--text-muted);">No active team members.</div>`;
      return;
    }

    container.innerHTML = members.map(m => {
      const util = sm[m.candidate_id] || { utilization_pct: 0, assigned_hours: 0, capacity_hours: 160, assigned_tasks_count: 0 };
      const pct = Math.min(100, util.utilization_pct || 0);

      let fillClass = 'optimal';
      let statusTag = '<span class="badge badge-success">Optimal Load</span>';
      if (pct > 95) {
        fillClass = 'overloaded';
        statusTag = '<span class="badge badge-danger">Overloaded</span>';
      } else if (pct < 40) {
        fillClass = 'underutilized';
        statusTag = '<span class="badge badge-primary">High Headroom</span>';
      }

      return `
        <div class="heatmap-member-row">
          <div class="member-info-col">
            <div class="member-name">${m.name}</div>
            <div class="member-role">${m.role_in_project} &bull; ${util.assigned_tasks_count} task(s)</div>
          </div>
          <div class="utilization-bar-container">
            <div class="progress-track">
              <div class="progress-fill ${fillClass}" style="width: ${pct}%;"></div>
            </div>
            <div style="width:140px; font-size:13px; font-weight:600; text-align:right;">
              ${util.assigned_hours}h / ${util.capacity_hours}h (${util.utilization_pct}%)
            </div>
            <div style="width:110px; text-align:right;">
              ${statusTag}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderSkillDistributionChart() {
    const canvas = document.getElementById('skillDistChart');
    if (!canvas || !state.currentProject) return;

    const tasks = state.currentProject.tasks || [];
    const skillHours = {};
    tasks.forEach(t => {
      const s = t.required_skill || 'General';
      skillHours[s] = (skillHours[s] || 0) + (t.estimated_hours || 0);
    });

    if (state.skillChartInstance) {
      state.skillChartInstance.destroy();
    }

    state.skillChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(skillHours),
        datasets: [{
          data: Object.values(skillHours),
          backgroundColor: ['#2563EB', '#0D9488', '#7C3AED', '#D97706', '#E11D48', '#059669']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  // 5. CRISIS SIMULATOR (PROBLEM STATEMENT #18)
  function renderScenarioParams() {
    const type = document.getElementById('sim-scenario-type').value;
    const container = document.getElementById('sim-dynamic-params');
    if (!container || !state.currentProject) return;

    const members = state.currentProject.team_members || [];
    const tasks = state.currentProject.tasks || [];

    if (type === 'member_unavailable') {
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Select Unavailable Team Member</label>
          <select id="sim-param-cand" class="form-control">
            ${members.map(m => `<option value="${m.candidate_id}" ${m.candidate_id === 2 ? 'selected' : ''}>${m.name} (${m.role_in_project})</option>`).join('')}
          </select>
          <p style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
            This member will become completely unavailable. All their tasks will be reallocated.
          </p>
        </div>
      `;
    } else if (type === 'deadline_shortened') {
      const curDeadline = state.currentProject.deadline_days || 25;
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">New Accelerated Deadline (Days): <strong id="val-deadline">${curDeadline - 7}</strong></label>
          <input type="range" id="sim-param-deadline" class="form-control" min="10" max="${curDeadline}" value="${curDeadline - 7}" oninput="document.getElementById('val-deadline').innerText = this.value">
        </div>
      `;
    } else if (type === 'urgent_task_added') {
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Emergency Task Title</label>
          <input type="text" id="sim-param-tasktitle" class="form-control" value="Critical Security Patch & Zero-Day Fix">
        </div>
        <div class="grid-2col">
          <div class="form-group">
            <label class="form-label">Required Skill</label>
            <select id="sim-param-taskskill" class="form-control">
              <option value="Python">Python</option>
              <option value="CyberSecurity" selected>CyberSecurity</option>
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="React">React</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Effort Hours</label>
            <input type="number" id="sim-param-taskhrs" class="form-control" value="24">
          </div>
        </div>
      `;
    } else if (type === 'duration_overrun') {
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Select Overrunning Task</label>
          <select id="sim-param-taskid" class="form-control">
            ${tasks.map(t => `<option value="${t.id}">#${t.id}: ${t.title} (${t.estimated_hours}h)</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Scope Multiplier: <strong>+100% (2.0x Duration)</strong></label>
          <input type="hidden" id="sim-param-mult" value="2.0">
        </div>
      `;
    } else if (type === 'priority_escalation') {
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Select Task to Escalate to Critical</label>
          <select id="sim-param-esctaskid" class="form-control">
            ${tasks.map(t => `<option value="${t.id}">#${t.id}: ${t.title} (${t.priority})</option>`).join('')}
          </select>
        </div>
      `;
    }
  }

  function onScenarioTypeChange(newVal) {
    renderScenarioParams();
  }

  async function executeCrisisSimulation() {
    const type = document.getElementById('sim-scenario-type').value;
    let params = {};

    if (type === 'member_unavailable') {
      params.candidate_id = parseInt(document.getElementById('sim-param-cand').value);
    } else if (type === 'deadline_shortened') {
      params.new_deadline_days = parseFloat(document.getElementById('sim-param-deadline').value);
    } else if (type === 'urgent_task_added') {
      params.urgent_task = {
        title: document.getElementById('sim-param-tasktitle').value,
        required_skill: document.getElementById('sim-param-taskskill').value,
        min_skill_level: 3,
        estimated_hours: parseFloat(document.getElementById('sim-param-taskhrs').value),
        dependencies: []
      };
    } else if (type === 'duration_overrun') {
      params.task_id = parseInt(document.getElementById('sim-param-taskid').value);
      params.duration_multiplier = parseFloat(document.getElementById('sim-param-mult').value || 2.0);
    } else if (type === 'priority_escalation') {
      params.escalated_task_id = parseInt(document.getElementById('sim-param-esctaskid').value);
    }

    showToast('Executing Autonomous Resource Rebalancer...');

    try {
      const res = await fetch(`${API_BASE}/projects/${state.activeProjectId}/simulate-crisis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, params })
      });

      const result = await res.json();
      state.currentProposal = result;

      renderRebalanceDiffWorkspace(result);
      switchTab('rebalance-diff');
      showToast('Rebalancing proposal generated!', 'success');
    } catch (err) {
      console.error('Error simulating crisis:', err);
      showToast('Simulation failed', 'error');
    }
  }

  // 6. REBALANCING PLAN & DIFF WORKSPACE
  function renderRebalanceDiffWorkspace(data) {
    if (!data) return;

    // Solver status banner
    document.getElementById('diff-solver-status').innerText = `Solver: ${data.solver_status?.toUpperCase()}`;
    document.getElementById('diff-plan-headline').innerText = `Proposal #${data.proposal_id}: Reallocated ${data.reassigned_count} task(s) with ${data.objective_score}/100 Objective Score`;
    
    const origDur = data.original_schedule?.project_duration_days || 0;
    const newDur = data.proposed_schedule?.project_duration_days || 0;
    document.getElementById('diff-plan-sub').innerText = `Original Duration: ${origDur}d &rarr; Proposed Duration: ${newDur}d &bull; Churn: ${data.reassigned_count} task(s)`;

    // Original plan summary list
    const origTasks = data.original_schedule?.tasks || [];
    document.getElementById('diff-original-metrics').innerText = `Makespan: ${origDur} days &bull; Tasks: ${origTasks.length}`;
    document.getElementById('diff-original-tasks').innerHTML = origTasks.map(t => {
      const cand = state.candidates.find(c => c.id === t.assigned_candidate_id);
      return `
        <div style="font-size:12.5px; padding:6px 10px; background-color:white; border:1px solid var(--border-subtle); border-radius:var(--radius-sm); display:flex; justify-content:space-between;">
          <span>#${t.id}: ${t.title}</span>
          <strong>${cand ? cand.name : 'Unassigned'}</strong>
        </div>
      `;
    }).join('');

    // Proposed plan summary list
    const propTasks = data.proposed_schedule?.tasks || [];
    document.getElementById('diff-proposed-metrics').innerText = `Makespan: ${newDur} days &bull; Tasks: ${propTasks.length}`;
    document.getElementById('diff-proposed-tasks').innerHTML = propTasks.map(t => {
      const cand = state.candidates.find(c => c.id === t.assigned_candidate_id);
      const isMoved = (data.reassigned_tasks || []).some(r => r.task_id === t.id);
      return `
        <div style="font-size:12.5px; padding:6px 10px; background-color:${isMoved ? '#ECFDF5' : 'white'}; border:1px solid ${isMoved ? '#86EFAC' : 'var(--border-subtle)'}; border-radius:var(--radius-sm); display:flex; justify-content:space-between;">
          <span>#${t.id}: ${t.title} ${isMoved ? '<span class="badge badge-success" style="font-size:10px;">REASSIGNED</span>' : ''}</span>
          <strong style="color:${isMoved ? 'var(--color-success)' : 'inherit'};">${cand ? cand.name : 'Unassigned'}</strong>
        </div>
      `;
    }).join('');

    // Reassigned Tasks Table
    const tbody = document.getElementById('diff-reassignments-tbody');
    tbody.innerHTML = (data.reassigned_tasks || []).map(r => `
      <tr>
        <td style="font-weight:600;">${r.title}</td>
        <td><span class="badge badge-neutral">${r.required_skill}</span></td>
        <td><span style="color:var(--color-danger); text-decoration:line-through;">${r.from_candidate_name}</span></td>
        <td><strong style="color:var(--color-success);">${r.to_candidate_name}</strong></td>
        <td>Day ${r.orig_start_day} - ${r.orig_end_day}</td>
        <td>Day ${r.new_start_day} - ${r.new_end_day}</td>
        <td><span class="badge badge-primary">Shifted to D${r.new_start_day}</span></td>
      </tr>
    `).join('');

    // Explanations Cards
    const expContainer = document.getElementById('diff-explanations-container');
    expContainer.innerHTML = (data.explanations || []).map(exp => `
      <div class="explanation-card">
        <div class="explanation-title">${exp.title}</div>
        <div class="explanation-text">${exp.text}</div>
      </div>
    `).join('');

    // Risks
    const risksContainer = document.getElementById('diff-risks-container');
    risksContainer.innerHTML = (data.risks || []).map(rk => `
      <div style="font-size:13px; color:var(--text-secondary); margin-bottom:6px; display:flex; align-items:center; gap:8px;">
        <i data-lucide="alert-triangle" style="width:14px; height:14px; color:var(--color-warning);"></i>
        <span>${rk}</span>
      </div>
    `).join('');

    lucide.createIcons();
  }

  async function approveProposal() {
    if (!state.currentProposal || !state.currentProposal.proposal_id) {
      showToast('No active proposal to approve', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/projects/${state.activeProjectId}/decisions/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: state.currentProposal.proposal_id })
      });

      const data = await res.json();
      showToast(data.message || 'Plan approved and persisted!', 'success');
      await loadActiveProjectData();
      switchTab('overview');
    } catch (err) {
      showToast('Approval failed', 'error');
    }
  }

  async function rejectProposal() {
    if (!state.currentProposal || !state.currentProposal.proposal_id) return;

    try {
      const res = await fetch(`${API_BASE}/projects/${state.activeProjectId}/decisions/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_id: state.currentProposal.proposal_id })
      });

      const data = await res.json();
      showToast(data.message || 'Proposal rejected. Baseline retained.', 'warning');
      switchTab('overview');
    } catch (err) {
      showToast('Rejection failed', 'error');
    }
  }

  // 7. DECISION AUDIT TRAIL
  async function loadDecisionHistory() {
    try {
      const res = await fetch(`${API_BASE}/projects/${state.activeProjectId}/decisions/history`);
      const logs = await res.json();
      
      const container = document.getElementById('decision-history-timeline');
      const overviewContainer = document.getElementById('overview-decision-logs');

      if (logs.length === 0) {
        if (container) container.innerHTML = `<div style="color:var(--text-muted);">No decision records yet.</div>`;
        if (overviewContainer) overviewContainer.innerHTML = `<div style="color:var(--text-muted); font-size:13px;">No decision records yet.</div>`;
        return;
      }

      const html = logs.map(l => {
        const actionBadge = l.action_taken === 'APPROVED' 
          ? '<span class="badge badge-success">Approved</span>' 
          : '<span class="badge badge-danger">Rejected</span>';

        return `
          <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:14px 18px; background-color:var(--bg-surface);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="font-size:14px;">${l.event_title}</strong>
              <div style="display:flex; align-items:center; gap:8px;">
                ${actionBadge}
                <span style="font-size:11.5px; color:var(--text-muted);">${l.timestamp}</span>
              </div>
            </div>
            <p style="font-size:13px; color:var(--text-secondary); margin-top:6px;">${l.summary}</p>
          </div>
        `;
      }).join('');

      if (container) container.innerHTML = html;
      if (overviewContainer) overviewContainer.innerHTML = html;
    } catch (err) {
      console.error('Error fetching decision history:', err);
    }
  }

  // 8. SETTINGS CANDIDATES
  function renderSettingsCandidates() {
    const container = document.getElementById('settings-candidates-list');
    if (!container) return;

    container.innerHTML = state.candidates.map(c => `
      <div style="padding:10px 14px; background-color:var(--bg-surface-subtle); border-radius:var(--radius-md); font-size:13px;">
        <div style="display:flex; justify-content:space-between;">
          <strong>${c.name}</strong>
          <span style="color:var(--text-secondary);">${c.role_title}</span>
        </div>
        <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">
          ${Object.entries(c.skills || {}).map(([s, l]) => `${s}: L${l}`).join(', ')} &bull; ${c.weekly_capacity_hours}h/wk
        </div>
      </div>
    `).join('');
  }

  // ------------------- MODALS & ACTIONS -------------------

  function openAddTaskModal() { document.getElementById('modal-add-task').classList.add('open'); }
  function openAddCandidateModal() { document.getElementById('modal-add-candidate').classList.add('open'); }
  function openNewProjectModal() { document.getElementById('modal-new-project').classList.add('open'); }

  function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
  }

  async function submitNewTask() {
    const title = document.getElementById('modal-task-title').value.trim();
    const desc = document.getElementById('modal-task-desc').value.trim();
    const skill = document.getElementById('modal-task-skill').value;
    const minLvl = parseInt(document.getElementById('modal-task-min-lvl').value) || 2;
    const hours = parseFloat(document.getElementById('modal-task-hours').value) || 16;
    const prio = document.getElementById('modal-task-priority').value;
    const depsStr = document.getElementById('modal-task-deps').value.trim();
    const deps = depsStr ? depsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];

    if (!title) {
      showToast('Please enter a task title', 'warning');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/projects/${state.activeProjectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description: desc, required_skill: skill, min_skill_level: minLvl,
          estimated_hours: hours, priority: prio, dependencies: deps
        })
      });
      closeModal('modal-add-task');
      showToast('Task created successfully!', 'success');
      await recomputeSchedule();
    } catch (err) {
      showToast('Failed to create task', 'error');
    }
  }

  async function submitNewCandidate() {
    const name = document.getElementById('modal-cand-name').value.trim();
    const role = document.getElementById('modal-cand-role').value.trim();
    const skillsStr = document.getElementById('modal-cand-skills').value.trim();
    const exp = parseFloat(document.getElementById('modal-cand-exp').value) || 2.0;
    const cap = parseFloat(document.getElementById('modal-cand-cap').value) || 40.0;

    let skills = {};
    try { skills = JSON.parse(skillsStr); } catch (e) { skills = { Python: 3 }; }

    try {
      await fetch(`${API_BASE}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, role_title: role, skills, experience_years: exp, weekly_capacity_hours: cap
        })
      });
      closeModal('modal-add-candidate');
      showToast('Candidate added to talent pool!', 'success');
      await loadCandidates();
    } catch (err) {
      showToast('Failed to add candidate', 'error');
    }
  }

  async function submitNewProject() {
    const name = document.getElementById('modal-proj-name').value.trim();
    const desc = document.getElementById('modal-proj-desc').value.trim();
    const teamSize = parseInt(document.getElementById('modal-proj-teamsize').value) || 4;
    const deadline = parseInt(document.getElementById('modal-proj-deadline').value) || 30;

    if (!name) return;

    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, description: desc, target_team_size: teamSize, deadline_days: deadline,
          required_skills: [
            { skill: 'Python', min_level: 3, mandatory: true },
            { skill: 'React', min_level: 2, mandatory: true }
          ],
          domains: ['SaaS', 'Cloud']
        })
      });
      const data = await res.json();
      closeModal('modal-new-project');
      showToast('Project created!', 'success');
      await loadProjects();
      onProjectChange(data.project_id);
    } catch (err) {
      showToast('Failed to create project', 'error');
    }
  }

  async function resetSeedData() {
    showToast('Resetting demo dataset to baseline...');
    try {
      await fetch(`${API_BASE}/demo/seed`, { method: 'POST' });
      await loadProjects();
      await loadCandidates();
      state.activeProjectId = 1;
      await loadActiveProjectData();
      showToast('Demo environment reset successfully!', 'success');
    } catch (err) {
      showToast('Reset failed', 'error');
    }
  }

  // ------------------- HACKATHON LIVE DEMO SEQUENCE -------------------

  async function runLiveDemoSequence() {
    showToast('🚀 Launching Hackathon Demo Sequence (Step 1/4)...', 'primary');
    
    // Step 1: Open Team Formation
    switchTab('team-formation');
    await new Promise(r => setTimeout(r, 1200));
    await runTeamFormation();

    await new Promise(r => setTimeout(r, 2000));
    showToast('📊 Step 2/4: Reviewing Critical Path Gantt Schedule...', 'primary');
    switchTab('task-planning');

    await new Promise(r => setTimeout(r, 2200));
    showToast('🚨 Step 3/4: Simulating Backend Lead Outage Disruption...', 'warning');
    switchTab('crisis-simulator');
    document.getElementById('sim-scenario-type').value = 'member_unavailable';
    renderScenarioParams();

    await new Promise(r => setTimeout(r, 1800));
    showToast('⚡ Step 4/4: Executing Autonomous Constraint Rebalancer...', 'primary');
    await executeCrisisSimulation();
  }

  // Toast Utility
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  // Public Interface
  return {
    init,
    switchTab,
    onProjectChange,
    openAddTaskModal,
    openAddCandidateModal,
    openNewProjectModal,
    closeModal,
    submitNewTask,
    submitNewCandidate,
    submitNewProject,
    addSkillRequirementRow,
    runTeamFormation,
    confirmRecommendedTeam,
    recomputeSchedule,
    onScenarioTypeChange,
    executeCrisisSimulation,
    approveProposal,
    rejectProposal,
    resetSeedData,
    runLiveDemoSequence
  };
})();

// Start App on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.RebalanceApp.init();
});
