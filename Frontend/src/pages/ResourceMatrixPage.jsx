import React from 'react';
import { useProject } from '../context/ProjectContext';
import { Activity, PieChart, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#2563EB', '#0D9488', '#7C3AED', '#D97706', '#E11D48', '#059669'];

export function ResourceMatrixPage() {
  const { activeProject } = useProject();

  const teamMembers = activeProject?.team_members || [];
  const sm = activeProject?.schedule_metrics?.resource_utilization || {};
  const tasks = activeProject?.tasks || [];

  // Prepare skill distribution data for Recharts
  const skillCounts = {};
  tasks.forEach((t) => {
    const s = t.required_skill || 'Other';
    skillCounts[s] = (skillCounts[s] || 0) + (t.estimated_hours || 0);
  });

  const pieData = Object.entries(skillCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Prepare bar chart data for member workload
  const barData = teamMembers.map((m) => {
    const util = sm[m.candidate_id] || { assigned_hours: 0, capacity_hours: 160 };
    return {
      name: m.name.split(' ')[0],
      assigned: util.assigned_hours,
      capacity: util.capacity_hours,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Resource Command Center & Heatmap</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Capacity vs assigned effort, workload bottleneck detection, and skill distribution telemetry.
        </p>
      </div>

      {/* 2-Column Workload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Heatmap Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" /> Team Utilization Heatmap
          </h3>

          <div className="space-y-3">
            {teamMembers.map((m) => {
              const util = sm[m.candidate_id] || {
                assigned_hours: 0,
                capacity_hours: 160,
                utilization_pct: 0,
                assigned_tasks_count: 0,
              };
              const pct = Math.min(100, util.utilization_pct || 0);

              let statusTag = (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Optimal
                </span>
              );
              let fillBg = 'bg-emerald-500';

              if (pct > 95) {
                statusTag = (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Overloaded
                  </span>
                );
                fillBg = 'bg-rose-500';
              } else if (pct < 40) {
                statusTag = (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    High Headroom
                  </span>
                );
                fillBg = 'bg-blue-500';
              }

              return (
                <div key={m.candidate_id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                      <p className="text-xs text-slate-500">
                        {m.role_in_project} &bull; {util.assigned_tasks_count} deliverable(s)
                      </p>
                    </div>
                    {statusTag}
                  </div>

                  <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${fillBg}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 font-medium pt-1">
                    <span>Assigned: {util.assigned_hours}h</span>
                    <span>Max Available: {util.capacity_hours}h ({util.utilization_pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workload Visualizer (Recharts Bar & Pie) */}
        <div className="space-y-6">
          {/* Skill Distribution Doughnut */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-blue-600" /> Skill Effort Distribution (Hours)
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Member Capacity Comparison Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-blue-600" /> Assigned vs Capacity Comparison
            </h3>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="assigned" fill="#2563EB" name="Assigned Hours" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" fill="#E2E8F0" name="Total Capacity" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
