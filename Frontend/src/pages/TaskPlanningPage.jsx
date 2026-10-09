import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Plus, RefreshCw, Calendar, ListChecks } from 'lucide-react';
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
    showToast('Recalculating CPM schedule...');
    try {
      await api.generateSchedule(activeProjectId);
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast('CPM schedule updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Header days marks
  const dayMarks = [];
  for (let d = 0; d <= maxDays; d += 2) {
    dayMarks.push(d);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Task Planning & Critical Path Gantt</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Interactive CPM scheduling with dependency chains, float slack calculations, and zero-float critical paths.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} /> Recalculate CPM Schedule
          </button>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" /> Project Timeline Schedule (Days 0 to {maxDays})
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-rose-700">
              <span className="w-3 h-3 rounded bg-rose-600" /> Critical Path (0 Slack)
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-blue-700">
              <span className="w-3 h-3 rounded bg-blue-600" /> Standard Deliverable
            </span>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Day Header */}
            <div className="flex border-b border-slate-200 pb-2 text-[11px] font-bold text-slate-400 uppercase">
              <div className="w-64 flex-shrink-0">Task & Assignee</div>
              <div className="flex-1 flex justify-between px-2">
                {dayMarks.map((d) => (
                  <span key={d}>D{d}</span>
                ))}
              </div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-slate-100 mt-2">
              {tasks.map((t) => {
                const assignedCand = members.find((m) => m.id === t.assigned_candidate_id);
                const assigneeName = assignedCand ? assignedCand.name : 'Unassigned';

                const leftPct = ((t.start_day || 0) / maxDays) * 100;
                const dur = Math.max(0.5, (t.end_day || 1) - (t.start_day || 0));
                const widthPct = Math.min(100 - leftPct, (dur / maxDays) * 100);

                const isCrit = t.is_critical_path;

                return (
                  <div key={t.id} className="flex items-center py-2.5 hover:bg-slate-50/60 transition group">
                    <div className="w-64 flex-shrink-0 pr-4">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        #{t.id}: {t.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {assigneeName} &bull; {t.required_skill} (L{t.min_skill_level})
                      </div>
                    </div>

                    <div className="flex-1 relative h-7 bg-slate-100/60 rounded overflow-hidden">
                      <div
                        className={`absolute top-1 bottom-1 rounded px-2 text-[11px] font-bold text-white flex items-center justify-between transition-all ${
                          isCrit ? 'gantt-bar-critical shadow-xs' : 'gantt-bar-standard shadow-xs'
                        }`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        title={`#${t.id} ${t.title}: Day ${t.start_day} - ${t.end_day}`}
                      >
                        <span className="truncate">{dur}d</span>
                        {isCrit && <span className="text-[9px] uppercase tracking-wider opacity-90">Crit</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* WBS Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-blue-600" /> Work Breakdown Structure (WBS) Table
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 px-6">ID</th>
                <th className="p-3.5 px-6">Task Title</th>
                <th className="p-3.5 px-6">Required Skill</th>
                <th className="p-3.5 px-6">Effort</th>
                <th className="p-3.5 px-6">Assignee</th>
                <th className="p-3.5 px-6">Timeline</th>
                <th className="p-3.5 px-6">Slack</th>
                <th className="p-3.5 px-6">Dependencies</th>
                <th className="p-3.5 px-6">Priority</th>
                <th className="p-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {tasks.map((t) => {
                const assignedCand = members.find((m) => m.id === t.assigned_candidate_id);
                const assigneeName = assignedCand ? assignedCand.name : 'Unassigned';
                const deps =
                  (t.dependencies || []).length > 0 ? t.dependencies.map((d) => `#${d}`).join(', ') : 'None';

                return (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 px-6 font-bold text-slate-900">#{t.id}</td>
                    <td className="p-3.5 px-6 font-semibold">{t.title}</td>
                    <td className="p-3.5 px-6">
                      <span className="text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                        {t.required_skill} L{t.min_skill_level}
                      </span>
                    </td>
                    <td className="p-3.5 px-6 font-mono">{t.estimated_hours}h</td>
                    <td className="p-3.5 px-6 font-medium text-slate-900">{assigneeName}</td>
                    <td className="p-3.5 px-6 text-slate-600 font-mono">
                      Day {t.start_day} - {t.end_day}
                    </td>
                    <td className="p-3.5 px-6 font-mono">{t.slack_days || 0}d</td>
                    <td className="p-3.5 px-6 text-slate-500">{deps}</td>
                    <td className="p-3.5 px-6">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          t.priority === 'critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : t.priority === 'high'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3.5 px-6">
                      {t.is_critical_path ? (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Critical Path
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
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
