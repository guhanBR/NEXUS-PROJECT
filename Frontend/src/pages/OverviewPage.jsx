import React from 'react';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Gauge,
  GitCommit,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function OverviewPage() {
  const { activeProject, isProjectLoading, activeProjectId } = useProject();
  const navigate = useNavigate();

  const { data: history = [] } = useQuery({
    queryKey: ['history', activeProjectId],
    queryFn: () => api.getHistory(activeProjectId),
    enabled: !!activeProjectId,
  });

  if (isProjectLoading || !activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sm = activeProject.schedule_metrics || {};
  const tasks = activeProject.tasks || [];
  const teamMembers = activeProject.team_members || [];
  const critIds = new Set(sm.critical_path_task_ids || []);
  const critTasks = tasks.filter((t) => critIds.has(t.id));

  // Avg utilization
  const resUtils = Object.values(sm.resource_utilization || {});
  const avgUtil =
    resUtils.length > 0
      ? Math.round(resUtils.reduce((a, b) => a + (b.utilization_pct || 0), 0) / resUtils.length)
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Project Command Center</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time operational telemetry, critical delivery chain, and resource load.
          </p>
        </div>

        <button
          onClick={() => navigate('/crisis-simulator')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition"
        >
          <AlertTriangle className="w-4 h-4" /> Simulate Disruption
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Project Makespan</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{sm.project_duration_days || 0} days</div>
          <div className="text-xs text-slate-500 mt-1">Target Deadline: {activeProject.deadline_days} days</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Team Utilization</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{avgUtil}%</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Optimal workload distribution</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Critical Path Tasks</span>
            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
              <GitCommit className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{critTasks.length} Tasks</div>
          <div className="text-xs text-slate-500 mt-1">Zero-slack delivery sequence</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Active Team Size</span>
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{teamMembers.length} Specialists</div>
          <div className="text-xs text-blue-600 font-medium mt-1">100% mandatory skill coverage</div>
        </div>
      </div>

      {/* 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Path Telemetry */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Critical Path Delivery Chain
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Feasible Baseline
            </span>
          </div>

          <div className="p-6 space-y-3">
            {critTasks.length === 0 ? (
              <p className="text-sm text-slate-400">No critical path tasks identified.</p>
            ) : (
              critTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-slate-50 rounded-lg border-l-4 border-rose-500 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      #{t.id}: {t.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Skill: <strong>{t.required_skill} (L{t.min_skill_level})</strong> &bull; Effort:{' '}
                      <strong>{t.estimated_hours}h</strong>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 whitespace-nowrap">
                    Day {t.start_day} - {t.end_day}
                  </span>
                </div>
              ))
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>Need to inspect full WBS & dependencies?</span>
              <button
                onClick={() => navigate('/task-planning')}
                className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
              >
                Open Gantt Planner <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Team Utilization Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Active Team Capacity Posture
            </h3>
            <button
              onClick={() => navigate('/resource-matrix')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View Full Heatmap
            </button>
          </div>

          <div className="p-6 space-y-4">
            {teamMembers.length === 0 ? (
              <p className="text-sm text-slate-400">No team members confirmed yet.</p>
            ) : (
              teamMembers.map((m) => {
                const util = sm.resource_utilization?.[m.candidate_id] || {
                  assigned_hours: 0,
                  capacity_hours: 160,
                  utilization_pct: 0,
                };
                const pct = Math.min(100, util.utilization_pct || 0);

                let fillBg = 'bg-emerald-500';
                if (pct > 95) fillBg = 'bg-rose-500';
                else if (pct < 40) fillBg = 'bg-blue-500';

                return (
                  <div key={m.candidate_id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {m.name}{' '}
                        <span className="font-normal text-slate-400">({m.role_in_project})</span>
                      </span>
                      <span className="font-semibold text-slate-600">
                        {util.assigned_hours}h / {util.capacity_hours}h ({util.utilization_pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${fillBg}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Decision Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Recent Optimization Actions & Audit Trail
          </h3>
          <button
            onClick={() => navigate('/decision-audit')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Full Audit History
          </button>
        </div>

        <div className="p-6 space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">No decision records yet.</p>
          ) : (
            history.slice(0, 3).map((h) => (
              <div key={h.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{h.event_title}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        h.action_taken === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {h.action_taken}
                    </span>
                    <span className="text-xs text-slate-400">{h.timestamp}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1">{h.summary}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
