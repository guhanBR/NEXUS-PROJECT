import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProgressMonitorPage() {
  const { user, role } = useAuth();
  const { activeProject } = useProject();
  const navigate = useNavigate();

  const [selectedFilter, setSelectedFilter] = useState('all');

  const tasks = activeProject?.tasks || [];
  const team = activeProject?.team_members || [];
  const scheduleMetrics = activeProject?.schedule_metrics || {};
  const critIds = new Set(scheduleMetrics.critical_path_task_ids || []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const todoTasks = tasks.filter((t) => !t.status || t.status === 'todo');
  const criticalPathTasks = tasks.filter((t) => critIds.has(t.id) || t.is_critical_path);

  const overallProgress = totalTasks > 0
    ? Math.round((completedTasks.length / totalTasks) * 100)
    : 0;

  const filteredTasks = tasks.filter((t) => {
    if (selectedFilter === 'critical') return critIds.has(t.id) || t.is_critical_path;
    if (selectedFilter === 'in_progress') return t.status === 'in_progress';
    if (selectedFilter === 'completed') return t.status === 'completed';
    if (selectedFilter === 'todo') return !t.status || t.status === 'todo';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
              {role === 'admin'
                ? 'Progress Monitor'
                : role === 'manager'
                ? 'Task Progress'
                : 'Team Progress'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Live Milestone Tracking
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-900 border border-amber-300/40">
              ⚡ Team Ryzen Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
            {role === 'member'
              ? 'Teammate Progress & Delivery Alignment'
              : 'Project Milestone & Task Progress Monitor'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
            Track topological dependency milestones, completion metrics, and critical path risk factors for "{activeProject?.name || 'Workspace'}".
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => navigate('/admin/task-planning')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
          >
            <span>Open Task Control</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
          </button>
        )}
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Progress</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{overallProgress}%</div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {completedTasks.length} / {totalTasks}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {inProgressTasks.length} currently in execution
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Zero-Slack Critical</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {criticalPathTasks.length} Tasks
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Milestone bottleneck deliverables
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed Specialists</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {team.length} Engineers
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {team.reduce((acc, m) => acc + (m.weekly_capacity_hours || 40), 0)}h/week capacity
          </p>
        </div>
      </div>

      {/* Task Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Work Breakdown & Status Stream</h2>
            <p className="text-xs text-slate-500">
              {role === 'manager'
                ? 'Read-only oversight of all workspace work items'
                : role === 'member'
                ? 'Teammate deliverables and scheduled execution windows'
                : 'Full workspace task tracking'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['all', 'critical', 'in_progress', 'completed', 'todo'].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition ${
                  selectedFilter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Deliverable</th>
                <th className="px-6 py-3.5">Owner</th>
                <th className="px-6 py-3.5 font-tabular">Effort</th>
                <th className="px-6 py-3.5 font-tabular">Window</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTasks.map((t) => {
                const owner = team.find((m) => (m.candidate_id || m.id) === t.assigned_candidate_id);
                const isCrit = critIds.has(t.id) || t.is_critical_path;
                return (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">
                      #{t.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{t.title}</span>
                        {isCrit && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                            Critical
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {owner?.name || t.assigned_candidate_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 font-tabular text-slate-600">
                      {t.estimated_hours} hrs
                    </td>
                    <td className="px-6 py-4 font-tabular text-slate-600">
                      Day {t.start_day || 0} &rarr; Day {t.end_day || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : t.status === 'in_progress'
                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {t.status || 'todo'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
