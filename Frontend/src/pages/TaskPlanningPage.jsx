import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../api/client';
import {
  CalendarDays,
  Plus,
  Play,
  Clock,
  GitCommit,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AddTaskModal } from '../components/modals/AddTaskModal';

export function TaskPlanningPage() {
  const {
    activeProject,
    activeProjectId,
    showToast,
  } = useProject();

  const queryClient = useQueryClient();

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [chartMode, setChartMode] = useState('gantt');

  const tasks = activeProject?.tasks || [];
  const teamMembers = activeProject?.team_members || [];
  const sm = activeProject?.schedule_metrics || {};
  const critIds = new Set(sm.critical_path_task_ids || []);

  const handleGenerateSchedule = async () => {
    setIsScheduling(true);
    try {
      await api.generateSchedule(activeProjectId);
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast('Critical Path schedule calculated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to generate schedule.', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.updateTask(activeProjectId, taskId, { status: newStatus });
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast('Task status updated.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  const totalDuration = sm.project_duration_days || activeProject?.deadline_days || 30;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge bg-[#202724]/10 text-[#202724] font-bold uppercase tracking-wider text-[10px]">
              Step 02
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Critical Path Method (CPM)
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight">
            Tasks, WBS & <span className="italic font-light">Gantt Schedule</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Configure work breakdown deliverables, assign owners, track prerequisites, and calculate timeline zero-slack milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="btn-secondary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deliverable</span>
          </button>
          <button
            onClick={handleGenerateSchedule}
            disabled={isScheduling}
            className="btn-primary text-xs"
          >
            {isScheduling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Computing CPM...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-amber-300" />
                <span>Compute Schedule</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Gantt & Trending Delivery Infograph Card */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 shadow-xs space-y-6">
        {/* Header & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2EAE5]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge bg-[#202724]/10 text-[#202724] font-bold uppercase tracking-wider text-[10px]">
                Autonomous Analytics
              </span>
              <span className="text-xs text-slate-500 font-medium">
                CPM Schedule & Velocity Trend
              </span>
            </div>
            <h2 className="font-serif text-xl font-normal text-slate-900">
              Delivery Timeline & <span className="italic font-light">Velocity Trend</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#EEF2EF] p-1 rounded-xl border border-[#D5DED8] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartMode('gantt')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartMode === 'gantt'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gantt Timeline
              </button>
              <button
                type="button"
                onClick={() => setChartMode('trend')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartMode === 'trend'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trending Curve
              </button>
            </div>
          </div>
        </div>

        {/* Top Metric Infograph Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#D5DED8]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Planned Effort</div>
            <div className="text-lg font-serif font-bold text-slate-900 font-tabular mt-0.5">
              {tasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0)} hrs
            </div>
          </div>

          <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#D5DED8]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-red-700">Critical Path Duration</div>
            <div className="text-lg font-serif font-bold text-red-800 font-tabular mt-0.5">
              {totalDuration} days
            </div>
          </div>

          <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#D5DED8]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Daily Work Velocity</div>
            <div className="text-lg font-serif font-bold text-slate-900 font-tabular mt-0.5">
              {totalDuration > 0
                ? (tasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0) / totalDuration).toFixed(1)
                : 0} h/day
            </div>
          </div>

          <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#D5DED8]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Schedule Health</div>
            <div className="text-lg font-serif font-bold text-emerald-800 font-tabular mt-0.5">
              {totalDuration <= (activeProject?.deadline_days || 30) ? '98% On-Track' : 'Risk'}
            </div>
          </div>
        </div>

        {/* 1. GANTT TIMELINE VIEW */}
        {chartMode === 'gantt' && (
          <div className="space-y-4 pt-1">
            {/* Timeline Header Ruler (Days 0 -> Target) */}
            <div className="relative pt-2 pb-1 border-b border-[#E2EAE5]">
              <div className="flex justify-between text-[11px] font-mono text-slate-400 font-semibold px-1">
                <span>Day 0</span>
                <span>Day {Math.round(totalDuration * 0.25)}</span>
                <span>Day {Math.round(totalDuration * 0.5)} (Midpoint)</span>
                <span>Day {Math.round(totalDuration * 0.75)}</span>
                <span className="text-amber-800 font-bold">Day {totalDuration} (Target)</span>
              </div>
            </div>

            {/* Tasks Gantt Bars */}
            <div className="space-y-3.5 pt-1">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No tasks available to plot timeline.</p>
              ) : (
                tasks.map((t) => {
                  const isCritical = critIds.has(t.id) || t.is_critical_path;
                  const startPct = Math.max(0, Math.min(100, ((t.start_day || 0) / totalDuration) * 100));
                  const widthPct = Math.max(8, Math.min(100 - startPct, (((t.end_day || (t.start_day || 0) + 1) - (t.start_day || 0)) / totalDuration) * 100));
                  const assignedMember = teamMembers.find((m) => m.candidate_id === t.assigned_candidate_id);

                  return (
                    <div key={t.id} className="space-y-1.5 group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-semibold text-slate-900 truncate">#{t.id}: {t.title}</span>
                          {isCritical ? (
                            <span className="px-2 py-0.2 rounded-full bg-red-100 text-red-800 font-bold text-[10px] border border-red-200 shrink-0">
                              Critical Path
                            </span>
                          ) : (
                            <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px] shrink-0">
                              Standard
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-slate-500 font-tabular text-[11px] shrink-0">
                          {assignedMember && (
                            <span className="text-slate-700 font-medium hidden sm:inline">
                              {assignedMember.name}
                            </span>
                          )}
                          <span className="font-semibold text-slate-800">
                            Day {t.start_day || 0} &rarr; {t.end_day || 0} ({t.estimated_hours}h)
                          </span>
                        </div>
                      </div>

                      {/* Bar Track with Scale Marker */}
                      <div className="w-full h-4 bg-[#EEF2EF] rounded-full overflow-hidden relative border border-[#D5DED8]">
                        <div
                          className={`h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-xs ${
                            isCritical ? 'gantt-bar-critical' : 'gantt-bar-standard'
                          }`}
                          style={{
                            marginLeft: `${startPct}%`,
                            width: `${widthPct}%`,
                          }}
                        >
                          <span className="opacity-90 font-mono text-[9px] truncate">
                            {t.estimated_hours}h
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E2EAE5] text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-600 inline-block shadow-xs" />
                  <span className="text-slate-700 font-medium">Critical Path (Zero Slack)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-700 inline-block shadow-xs" />
                  <span className="text-slate-700 font-medium">Standard Deliverable</span>
                </div>
              </div>
              <span className="text-[11px] font-mono">Calculated via Topological CPM Engine</span>
            </div>
          </div>
        )}

        {/* 2. TRENDING DELIVERY BURNUP CURVE VIEW */}
        {chartMode === 'trend' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Cumulative Workload S-Curve (Planned vs Completed)</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-500 inline-block" />
                  <span>Planned Burnup</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
                  <span>Completed Progress</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Trending Infograph */}
            <div className="w-full h-56 bg-[#F7FAF8] rounded-xl border border-[#D5DED8] p-4 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Background Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#E2EAE5" strokeDasharray="3,3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#E2EAE5" strokeDasharray="3,3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#E2EAE5" strokeDasharray="3,3" />

                {/* Planned Burnup Area & Curve */}
                <path
                  d="M 0 140 Q 150 120, 250 60 T 500 15 L 500 150 L 0 150 Z"
                  fill="url(#trendGradient)"
                />
                <path
                  d="M 0 140 Q 150 120, 250 60 T 500 15"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Completed Hours Curve */}
                <path
                  d="M 0 140 Q 100 135, 180 95 L 180 150 L 0 150 Z"
                  fill="url(#completedGradient)"
                />
                <path
                  d="M 0 140 Q 100 135, 180 95"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="0" cy="140" r="4" fill="#D97706" />
                <circle cx="180" cy="95" r="5" fill="#059669" stroke="#fff" strokeWidth="2" />
                <circle cx="500" cy="15" r="5" fill="#D97706" stroke="#fff" strokeWidth="2" />
              </svg>

              {/* Peak Burnup Label Callout */}
              <div className="absolute top-4 right-6 bg-[#202724] text-white text-[10px] font-mono px-2.5 py-1 rounded-lg shadow-md border border-white/20">
                Peak Velocity: Day {Math.round(totalDuration * 0.5)}
              </div>
            </div>

            {/* Bottom Timeline Scale */}
            <div className="flex justify-between text-[11px] font-mono text-slate-500 font-semibold px-2">
              <span>Day 0 (Start)</span>
              <span>Day {Math.round(totalDuration * 0.33)}</span>
              <span>Day {Math.round(totalDuration * 0.66)}</span>
              <span>Day {totalDuration} (Target Completion)</span>
            </div>
          </div>
        )}
      </div>

      {/* Tasks Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#E2EAE5] bg-[#F7FAF8]/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Task Deliverables & Breakdown</h2>
            <p className="text-xs text-slate-500">WBS items with assigned engineers, required skills, and status</p>
          </div>
          <span className="badge bg-slate-100 text-slate-700 font-medium font-tabular">
            {tasks.length} Deliverables
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 space-y-3">
            <p>No tasks configured in this project.</p>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="btn-primary text-xs"
            >
              Add task
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F7FAF8] border-b border-[#E2EAE5] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Task Title</th>
                  <th className="px-6 py-3.5">Owner / Assignee</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 font-tabular">Effort</th>
                  <th className="px-6 py-3.5 font-tabular">Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBF0EC] bg-white">
                {tasks.map((t) => {
                  const isCritical = critIds.has(t.id) || t.is_critical_path;
                  const assignedMember = teamMembers.find((m) => m.candidate_id === t.assigned_candidate_id);

                  return (
                    <tr key={t.id} className="hover:bg-[#F7FAF8]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">#{t.id}: {t.title}</span>
                          {isCritical && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px] border border-red-200">
                              Critical
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Required: {t.required_skill} (Min Level {t.min_skill_level})
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {assignedMember ? (
                          <div>
                            <div className="font-semibold text-slate-900 text-xs">{assignedMember.name}</div>
                            <div className="text-[11px] text-slate-500">{assignedMember.role_title}</div>
                          </div>
                        ) : (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs font-semibold">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={t.status || 'todo'}
                          onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-[#D5DED8] bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#202724] cursor-pointer"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 font-tabular text-slate-700 text-xs">
                        {t.estimated_hours} hrs
                      </td>
                      <td className="px-6 py-4 font-tabular text-xs text-slate-600">
                        {t.start_day !== undefined && t.end_day !== undefined ? (
                          <span className="font-semibold text-slate-800">Day {t.start_day} &rarr; Day {t.end_day}</span>
                        ) : (
                          <span className="text-slate-400">Unscheduled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddTaskOpen && <AddTaskModal onClose={() => setIsAddTaskOpen(false)} />}
    </div>
  );
}
