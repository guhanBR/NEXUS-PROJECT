import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  CalendarDays,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Users,
  Layers,
  ArrowRight,
  Info,
  CheckSquare,
  Sparkles,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AddTaskModal } from '../components/modals/AddTaskModal';

export function AdminTaskPlanningPage() {
  const {
    activeProject,
    activeProjectId,
    showToast,
  } = useProject();

  const { role } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' (default) or 'schedule'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [ganttMode, setGanttMode] = useState('bars'); // 'bars' or 's-curve'

  const tasks = activeProject?.tasks || [];
  const teamMembers = activeProject?.team_members || [];
  const sm = activeProject?.schedule_metrics || {};
  const critIds = new Set(sm.critical_path_task_ids || []);

  const totalDuration = sm.project_duration_days || 0;
  const deadlineDays = activeProject?.deadline_days || 30;
  const totalEffort = tasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0);
  const unassignedTasks = tasks.filter((t) => !t.assigned_candidate_id);
  const critTasks = tasks.filter((t) => critIds.has(t.id));
  const isOverDeadline = totalDuration > deadlineDays;

  // Generate CPM Schedule Action
  const handleGenerateSchedule = async () => {
    setIsScheduling(true);
    try {
      await api.generateSchedule(activeProjectId);
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast('Critical Path schedule calculated and synchronized!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to generate schedule.', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  // Direct status update
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.updateTask(activeProjectId, taskId, { status: newStatus });
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast('Task status updated.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  // Filtered tasks for planning table
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.required_skill && t.required_skill.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status
      const matchesStatus = statusFilter === 'all' || (t.status || 'todo') === statusFilter;

      // Assignee
      const matchesAssignee =
        assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' && !t.assigned_candidate_id) ||
        (t.assigned_candidate_id && t.assigned_candidate_id.toString() === assigneeFilter);

      // Priority
      const matchesPriority = priorityFilter === 'all' || (t.priority || 'medium') === priorityFilter;

      return matchesSearch && matchesStatus && matchesAssignee && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, assigneeFilter, priorityFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. ADMIN HEADER BANNER */}
      <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2.5 py-0.5 rounded-full">
              Lead / Admin Planning
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {activeProject?.name || 'Active Workspace'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Task planning
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Organize project deliverables, assign team capabilities, calculate critical-path schedules, and manage execution prerequisites.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold shadow-2xs transition"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>Add task</span>
          </button>

          <button
            onClick={handleGenerateSchedule}
            disabled={isScheduling || tasks.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScheduling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Computing CPM...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-amber-300" />
                <span>Generate schedule</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. ADMIN PORTFOLIO & WORKLOAD TELEMETRY CHIPS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Deliverables */}
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8E4] shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Deliverables
          </div>
          <div className="text-2xl font-bold font-tabular text-slate-900">
            {tasks.length} tasks
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {totalEffort} planned hours
          </div>
        </div>

        {/* Unassigned Work */}
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8E4] shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Unassigned Work
          </div>
          <div className={`text-2xl font-bold font-tabular ${unassignedTasks.length > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
            {unassignedTasks.length} unassigned
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {unassignedTasks.length > 0 ? 'Requires specialist assignment' : 'All deliverables allocated'}
          </div>
        </div>

        {/* Critical Path Duration */}
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8E4] shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-red-700">
            Critical Path (CPM)
          </div>
          <div className="text-2xl font-bold font-tabular text-red-900">
            {totalDuration} Days
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {critTasks.length} zero-slack tasks
          </div>
        </div>

        {/* Deadline vs Planned Finish */}
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8E4] shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Deadline Margin
          </div>
          <div className={`text-2xl font-bold font-tabular ${isOverDeadline ? 'text-amber-800' : 'text-emerald-800'}`}>
            {deadlineDays - totalDuration}d buffer
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Target: {deadlineDays} Days limit
          </div>
        </div>
      </div>

      {/* Deadline Warning Banner */}
      {isOverDeadline && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">Delivery Risk: Target Deadline Exceeded</span>
            <p className="mt-0.5 text-amber-800">
              The computed critical path finish is <strong>{totalDuration} days</strong>, which exceeds the authorized limit of <strong>{deadlineDays} days</strong>. Use What-If Simulation to explore automated rebalancing options.
            </p>
          </div>
        </div>
      )}

      {/* 3. NAVIGATION TABS: PLANNING TABLE & SCHEDULE */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'tasks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Planning Table ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'schedule'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          View Schedule &amp; Timeline {totalDuration > 0 && `(${totalDuration}d)`}
        </button>
      </div>

      {/* 4. PLANNING TABLE (DEFAULT TAB) */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-3xl border border-[#E2E8E4] p-5 sm:p-6 shadow-xs space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks or skills..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option value="all">All Members</option>
                <option value="unassigned">Unassigned Only</option>
                {teamMembers.map((m) => (
                  <option key={m.candidate_id} value={m.candidate_id.toString()}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Planning Table */}
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500 space-y-3">
              <p>No deliverables match the selected filters.</p>
              {tasks.length === 0 && (
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="btn-primary text-xs"
                >
                  Create first deliverable
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Task</th>
                    <th className="px-4 py-3">Assigned Member</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3 font-tabular">Estimated Effort</th>
                    <th className="px-4 py-3 font-tabular">Planned Window</th>
                    <th className="px-4 py-3">Depends On</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTasks.map((t) => {
                    const isCritical = critIds.has(t.id) || t.is_critical_path;
                    const assignedMember = teamMembers.find((m) => m.candidate_id === t.assigned_candidate_id);
                    const isExpanded = expandedTaskId === t.id;

                    const depIds = t.dependencies || [];
                    const depTasks = tasks.filter((dep) => depIds.includes(dep.id));

                    return (
                      <React.Fragment key={t.id}>
                        <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/60' : ''}`}>
                          {/* 1. Task */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">#{t.id}: {t.title}</span>
                              {isCritical && (
                                <span className="px-2 py-0.2 rounded-full bg-red-100 text-red-800 font-bold text-[10px] border border-red-200 shrink-0">
                                  Critical Path
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Skill: {t.required_skill} (L{t.min_skill_level})
                            </div>
                          </td>

                          {/* 2. Assigned Member */}
                          <td className="px-4 py-3.5 text-xs">
                            {assignedMember ? (
                              <div>
                                <div className="font-bold text-slate-900">{assignedMember.name}</div>
                                <div className="text-[11px] text-slate-500">{assignedMember.role_title}</div>
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                                Unassigned
                              </span>
                            )}
                          </td>

                          {/* 3. Status Dropdown */}
                          <td className="px-4 py-3.5">
                            <select
                              value={t.status || 'todo'}
                              onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
                              className="px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>

                          {/* 4. Priority */}
                          <td className="px-4 py-3.5 text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                t.priority === 'critical'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : t.priority === 'high'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {t.priority || 'medium'}
                            </span>
                          </td>

                          {/* 5. Estimated Effort */}
                          <td className="px-4 py-3.5 font-tabular text-slate-900 font-bold text-xs">
                            {t.estimated_hours} hrs
                          </td>

                          {/* 6. Planned Window */}
                          <td className="px-4 py-3.5 font-tabular text-xs">
                            {t.start_day !== undefined && t.end_day !== undefined ? (
                              <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                                Day {t.start_day} &rarr; Day {t.end_day}
                              </span>
                            ) : (
                              <span className="text-slate-400">Unscheduled</span>
                            )}
                          </td>

                          {/* 7. Depends On */}
                          <td className="px-4 py-3.5 text-xs">
                            {depTasks.length > 0 ? (
                              <span className="text-slate-700 font-medium">
                                {depTasks.map((d) => `#${d.id}`).join(', ')}
                              </span>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>

                          {/* 8. Actions Toggle */}
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition"
                            >
                              <span>{isExpanded ? 'Less' : 'Details'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Plain-Language Details */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90 border-b border-slate-200">
                            <td colSpan={8} className="px-6 py-4 space-y-3 text-xs text-slate-700">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <div className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                                    Prerequisite Chain
                                  </div>
                                  <p className="text-slate-600 text-xs">
                                    {depTasks.length > 0 ? (
                                      <span>
                                        This task starts after{' '}
                                        <strong className="text-slate-900">
                                          {depTasks.map((d) => `"${d.title}" (finishes Day ${d.end_day || 0})`).join(', ')}
                                        </strong>.
                                      </span>
                                    ) : (
                                      <span className="text-emerald-800 font-semibold">
                                        No prerequisites — ready to begin at Day 0.
                                      </span>
                                    )}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <div className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                                    Buffer &amp; Critical Slack
                                  </div>
                                  <p className="text-slate-600 text-xs">
                                    {isCritical ? (
                                      <span className="text-red-700 font-semibold">
                                        Critical Path: 0 days of slack buffer. Any delay directly postpones the project completion.
                                      </span>
                                    ) : (
                                      <span className="text-slate-700">
                                        Flexible buffer available — non-critical deliverable.
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {t.description && (
                                <div className="pt-2 border-t border-slate-200/60">
                                  <div className="font-bold uppercase tracking-wider text-[10px] text-slate-500 mb-0.5">
                                    Requirements &amp; Scope
                                  </div>
                                  <p className="text-slate-800 leading-relaxed">{t.description}</p>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. VIEW SCHEDULE & TIMELINE TAB */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gantt Schedule &amp; CPM Timeline</h2>
              <p className="text-xs text-slate-500">
                Topological Critical Path timeline computed from work estimates and dependency constraints.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setGanttMode('bars')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  ganttMode === 'bars' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Gantt Timeline
              </button>
              <button
                onClick={() => setGanttMode('s-curve')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  ganttMode === 's-curve' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Burnup S-Curve
              </button>
            </div>
          </div>

          {totalDuration === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500 space-y-3">
              <p>No schedule generated yet. Click below to compute the critical path.</p>
              <button
                onClick={handleGenerateSchedule}
                disabled={isScheduling || tasks.length === 0}
                className="btn-primary text-xs"
              >
                Generate schedule now
              </button>
            </div>
          ) : (
            <>
              {ganttMode === 'bars' && (
                <div className="space-y-4">
                  {/* Time Ruler */}
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 font-semibold px-1 pb-1 border-b border-slate-100">
                    <span>Day 0 (Start)</span>
                    <span>Day {Math.round(totalDuration * 0.25)}</span>
                    <span>Day {Math.round(totalDuration * 0.5)} (Midpoint)</span>
                    <span>Day {Math.round(totalDuration * 0.75)}</span>
                    <span className="text-amber-800 font-bold">Day {totalDuration} (Target Finish)</span>
                  </div>

                  {/* Task Bar Rows */}
                  <div className="space-y-3">
                    {tasks.map((t) => {
                      const isCritical = critIds.has(t.id) || t.is_critical_path;
                      const startPct = Math.max(0, Math.min(100, ((t.start_day || 0) / totalDuration) * 100));
                      const widthPct = Math.max(8, Math.min(100 - startPct, (((t.end_day || (t.start_day || 0) + 1) - (t.start_day || 0)) / totalDuration) * 100));
                      const assignedMember = teamMembers.find((m) => m.candidate_id === t.assigned_candidate_id);

                      return (
                        <div key={t.id} className="space-y-1 p-2 rounded-xl hover:bg-slate-50 transition">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-bold text-slate-900 truncate">#{t.id}: {t.title}</span>
                              {isCritical && (
                                <span className="px-2 py-0.2 rounded-full bg-red-100 text-red-800 font-bold text-[10px] border border-red-200">
                                  Critical
                                </span>
                              )}
                            </div>
                            <span className="font-tabular font-semibold text-slate-800 text-[11px]">
                              Day {t.start_day || 0} &rarr; {t.end_day || 0} ({t.estimated_hours}h)
                            </span>
                          </div>

                          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
                            <div
                              className={`h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2 text-[9px] font-bold text-white ${
                                isCritical ? 'gantt-bar-critical' : 'gantt-bar-standard'
                              }`}
                              style={{
                                marginLeft: `${startPct}%`,
                                width: `${widthPct}%`,
                              }}
                            >
                              <span className="opacity-90">{t.estimated_hours}h</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-600 inline-block" />
                        <span className="font-semibold text-slate-700">Critical Path (0 Slack)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-700 inline-block" />
                        <span className="font-semibold text-slate-700">Standard Deliverable</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Topological CPM Engine</span>
                  </div>
                </div>
              )}

              {ganttMode === 's-curve' && (
                <div className="space-y-4">
                  <div className="w-full h-56 bg-slate-50 rounded-2xl border border-slate-200 p-4 relative flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="30" x2="500" y2="30" stroke="#E2EAE5" strokeDasharray="3,3" />
                      <line x1="0" y1="75" x2="500" y2="75" stroke="#E2EAE5" strokeDasharray="3,3" />
                      <path d="M 0 140 Q 150 120, 250 60 T 500 15 L 500 150 L 0 150 Z" fill="url(#planGrad)" />
                      <path d="M 0 140 Q 150 120, 250 60 T 500 15" fill="none" stroke="#D97706" strokeWidth="3" />
                      <circle cx="500" cy="15" r="5" fill="#D97706" stroke="#fff" strokeWidth="2" />
                    </svg>
                    <div className="absolute top-4 right-6 bg-slate-900 text-white text-[10px] font-mono px-2.5 py-1 rounded-xl">
                      Target Completion: Day {totalDuration}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isAddTaskOpen && <AddTaskModal onClose={() => setIsAddTaskOpen(false)} />}
    </div>
  );
}
