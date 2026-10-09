import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Plus, RefreshCw, Calendar, ListChecks, GitCommit, Clock, ArrowRight, HelpCircle } from 'lucide-react';
import { api } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { AddTaskModal } from '../components/modals/AddTaskModal';

export function TaskPlanningPage() {
  const { activeProject, activeProjectId, members, showToast } = useProject();
  const queryClient = useQueryClient();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const tasks = activeProject?.tasks || [];
  const maxDays = Math.max(25, Math.ceil(activeProject?.schedule_metrics?.project_duration_days || 25));

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    showToast('Recalculating Critical Path Method (CPM) schedule...');
    try {
      await api.generateSchedule(activeProjectId);
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast('Schedule recalculated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Day marks for header
  const dayMarks = [];
  for (let d = 0; d <= maxDays; d += 2) {
    dayMarks.push(d);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-google-blue bg-google-blueSurface px-2.5 py-0.5 rounded-full">
              Plan &bull; Tasks & Schedule
            </span>
            <span className="text-xs text-google-textMuted font-mono">
              {activeProject?.name}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-google-text">Tasks & Timeline Schedule</h2>
          <p className="text-xs text-google-textSecondary mt-0.5">
            Manage work items, view dependency chains, and see critical path deliverables that determine project completion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="google-btn-secondary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="google-btn-primary"
          >
            <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>Recalculate Schedule</span>
          </button>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="bg-white rounded-2xl border border-google-border shadow-google-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-google-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
            <Calendar className="w-4 h-4 text-google-blue" />
            Visual Timeline (Day 0 to Day {maxDays})
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-google-red">
              <span className="w-2.5 h-2.5 rounded bg-google-red" /> Critical Path (Zero Slack)
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-google-blue">
              <span className="w-2.5 h-2.5 rounded bg-google-blue" /> Standard Deliverable
            </span>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          <div className="min-w-[780px]">
            {/* Day Header */}
            <div className="flex border-b border-google-border pb-2 text-[11px] font-bold text-google-textMuted uppercase">
              <div className="w-64 flex-shrink-0">Task & Assigned Owner</div>
              <div className="flex-1 flex justify-between px-2 font-mono">
                {dayMarks.map((d) => (
                  <span key={d}>D{d}</span>
                ))}
              </div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-google-border/60 mt-2">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-google-textMuted">
                  No tasks created yet. Click "Add Task" to get started.
                </div>
              ) : (
                tasks.map((t) => {
                  const assignedCand = members.find((m) => m.id === t.assigned_candidate_id);
                  const assigneeName = assignedCand ? assignedCand.name : 'Unassigned';

                  const leftPct = ((t.start_day || 0) / maxDays) * 100;
                  const dur = Math.max(0.5, (t.end_day || 1) - (t.start_day || 0));
                  const widthPct = Math.min(100 - leftPct, (dur / maxDays) * 100);

                  const isCrit = t.is_critical_path;

                  return (
                    <div key={t.id} className="flex items-center py-2.5 hover:bg-google-subtle/50 transition-colors group">
                      <div className="w-64 flex-shrink-0 pr-4">
                        <div className="text-xs font-bold text-google-text truncate">
                          #{t.id}: {t.title}
                        </div>
                        <div className="text-[11px] text-google-textMuted truncate">
                          {assigneeName} &bull; {t.required_skill} (L{t.min_skill_level})
                        </div>
                      </div>

                      <div className="flex-1 relative h-6 bg-google-subtle rounded-md overflow-hidden">
                        <div
                          className={`absolute top-0.5 bottom-0.5 rounded px-2 text-[10px] font-bold text-white flex items-center justify-between transition-all ${
                            isCrit ? 'gantt-bar-critical' : 'gantt-bar-standard'
                          }`}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          title={`#${t.id} ${t.title}: Day ${t.start_day} - ${t.end_day}`}
                        >
                          <span className="truncate">{dur}d</span>
                          {isCrit && <span className="text-[9px] uppercase tracking-wider opacity-95">Critical</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Readable Tasks Table */}
      <div className="bg-white rounded-2xl border border-google-border shadow-google-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-google-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-google-blue" />
              All Project Tasks & Ownership
            </h3>
            <p className="text-xs text-google-textSecondary mt-0.5">
              Detailed list with effort, owner, dependencies, and schedule window.
            </p>
          </div>
          <span className="text-xs text-google-textMuted font-mono">
            {tasks.length} task(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-google-subtle text-google-textSecondary uppercase tracking-wider font-bold border-b border-google-border">
              <tr>
                <th className="p-3.5 px-6">ID</th>
                <th className="p-3.5 px-6">Task Title</th>
                <th className="p-3.5 px-6">Skill Needed</th>
                <th className="p-3.5 px-6">Effort</th>
                <th className="p-3.5 px-6">Assigned Owner</th>
                <th className="p-3.5 px-6">Schedule Window</th>
                <th className="p-3.5 px-6">Dependencies</th>
                <th className="p-3.5 px-6">Priority</th>
                <th className="p-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-google-border text-google-text">
              {tasks.map((t) => {
                const assignedCand = members.find((m) => m.id === t.assigned_candidate_id);
                const assigneeName = assignedCand ? assignedCand.name : 'Unassigned';
                const deps =
                  (t.dependencies || []).length > 0
                    ? `Depends on #${t.dependencies.join(', #')}`
                    : 'None (Can start immediately)';

                return (
                  <tr key={t.id} className="hover:bg-google-subtle/50 transition-colors">
                    <td className="p-3.5 px-6 font-bold text-google-text font-mono">#{t.id}</td>
                    <td className="p-3.5 px-6 font-semibold">{t.title}</td>
                    <td className="p-3.5 px-6">
                      <span className="text-[11px] font-medium bg-google-subtle px-2 py-0.5 rounded-md border border-google-border text-google-text">
                        {t.required_skill} L{t.min_skill_level}
                      </span>
                    </td>
                    <td className="p-3.5 px-6 font-mono text-google-textSecondary">{t.estimated_hours}h</td>
                    <td className="p-3.5 px-6 font-medium text-google-text">{assigneeName}</td>
                    <td className="p-3.5 px-6 text-google-textSecondary font-mono">
                      Day {t.start_day} - {t.end_day}
                    </td>
                    <td className="p-3.5 px-6 text-google-textMuted">{deps}</td>
                    <td className="p-3.5 px-6">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded-full ${
                          t.priority === 'critical'
                            ? 'bg-google-redSurface text-google-red'
                            : t.priority === 'high'
                            ? 'bg-google-amberSurface text-google-amber'
                            : 'bg-google-blueSurface text-google-blue'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3.5 px-6">
                      {t.is_critical_path ? (
                        <span className="text-[10px] font-bold text-google-red bg-google-redSurface px-2 py-0.2 rounded-full">
                          Critical Path
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-google-textMuted bg-google-subtle px-2 py-0.2 rounded-full">
                          Standard
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isAddTaskOpen && <AddTaskModal onClose={() => setIsAddTaskOpen(false)} />}
    </div>
  );
}
