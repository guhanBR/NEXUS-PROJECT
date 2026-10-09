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

      {/* Visual Gantt Timeline Card */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2EAE5]">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Calculated Visual Gantt Timeline</h2>
            <p className="text-xs text-slate-500">Autonomous scheduling based on topological dependencies and work velocity</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-600 inline-block shadow-xs" />
              <span className="text-slate-700 font-medium">Critical Path (Zero Slack)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-700 inline-block shadow-xs" />
              <span className="text-slate-700 font-medium">Standard Task</span>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 pt-2">
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No tasks available to plot timeline.</p>
          ) : (
            tasks.map((t) => {
              const isCritical = critIds.has(t.id) || t.is_critical_path;
              const startPct = Math.max(0, Math.min(100, ((t.start_day || 0) / totalDuration) * 100));
              const widthPct = Math.max(8, Math.min(100 - startPct, (((t.end_day || (t.start_day || 0) + 1) - (t.start_day || 0)) / totalDuration) * 100));

              return (
                <div key={t.id} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 truncate">#{t.id}: {t.title}</span>
                    <span className="font-tabular text-slate-500">
                      Day {t.start_day || 0} &rarr; {t.end_day || 0} ({t.estimated_hours}h)
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-[#EEF2EF] rounded-full overflow-hidden relative border border-[#D5DED8]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isCritical ? 'gantt-bar-critical' : 'gantt-bar-standard'}`}
                      style={{
                        marginLeft: `${startPct}%`,
                        width: `${widthPct}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
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
