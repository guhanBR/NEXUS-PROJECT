import React from 'react';
import { useProject } from '../context/ProjectContext';
import { Activity, PieChart, BarChart3, Users, AlertCircle, Info, HelpCircle } from 'lucide-react';
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

const GOOGLE_CHART_COLORS = ['#0B57D0', '#006A60', '#7A4100', '#BA1A1A', '#6750A4', '#00639B'];

export function ResourceMatrixPage() {
  const { activeProject } = useProject();

  const teamMembers = activeProject?.team_members || [];
  const sm = activeProject?.schedule_metrics?.resource_utilization || {};
  const tasks = activeProject?.tasks || [];

  // Skill effort breakdown
  const skillCounts = {};
  tasks.forEach((t) => {
    const s = t.required_skill || 'Other';
    skillCounts[s] = (skillCounts[s] || 0) + (t.estimated_hours || 0);
  });

  const pieData = Object.entries(skillCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Bar chart data
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
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-google-blue bg-google-blueSurface px-2.5 py-0.5 rounded-full">
            Plan &bull; Workload & Capacity
          </span>
          <span className="text-xs text-google-textMuted font-mono">
            {activeProject?.name}
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-google-text">Team Workload & Capacity</h2>
        <p className="text-xs text-google-textSecondary mt-0.5">
          Ensure fair task distribution, detect overworked team members early, and view skill allocation.
        </p>
      </div>

      {/* Period Notice */}
      <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-google-textSecondary">
          <Info className="w-4 h-4 text-google-blue" />
          <span>
            <strong>Calculation Period:</strong> Active 4-Week Sprint (Standard 160 Available Hours per Engineer).
          </span>
        </div>
        <span className="text-[11px] font-bold text-google-teal bg-google-tealSurface px-2.5 py-0.5 rounded-full">
          Safe Capacity Threshold: ≤95%
        </span>
      </div>

      {/* 2-Column Workload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Heatmap Card */}
        <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
              <Activity className="w-4 h-4 text-google-blue" />
              Member Workload Status
            </h3>
            <span className="text-xs text-google-textMuted font-mono">
              {teamMembers.length} team members
            </span>
          </div>

          <div className="space-y-3">
            {teamMembers.length === 0 ? (
              <p className="text-xs text-google-textMuted">No team members assigned to this project yet.</p>
            ) : (
              teamMembers.map((m) => {
                const util = sm[m.candidate_id] || {
                  assigned_hours: 0,
                  capacity_hours: 160,
                  utilization_pct: 0,
                  assigned_tasks_count: 0,
                };
                const pct = Math.min(100, util.utilization_pct || 0);

                let statusTag = (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-google-tealSurface text-google-teal">
                    Optimal Load
                  </span>
                );
                let fillBg = 'bg-google-teal';

                if (pct > 95) {
                  statusTag = (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-google-redSurface text-google-red">
                      High Load / Overloaded
                    </span>
                  );
                  fillBg = 'bg-google-red';
                } else if (pct < 40) {
                  statusTag = (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-google-blueSurface text-google-blue">
                      Available Bandwidth
                    </span>
                  );
                  fillBg = 'bg-google-blue';
                }

                return (
                  <div
                    key={m.candidate_id}
                    className="p-4 bg-google-subtle/50 rounded-xl border border-google-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-google-text">{m.name}</h4>
                        <p className="text-xs text-google-textMuted">
                          {m.role_in_project || 'Specialist'} &bull; {util.assigned_tasks_count || 0} deliverable(s)
                        </p>
                      </div>
                      {statusTag}
                    </div>

                    <div className="w-full h-2 bg-google-border/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${fillBg}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-google-textSecondary font-tabular pt-1">
                      <span>Assigned: <strong>{util.assigned_hours}h</strong></span>
                      <span>
                        Capacity: <strong>{util.capacity_hours}h</strong> ({util.utilization_pct}%)
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Visual Charts */}
        <div className="space-y-6">
          {/* Skill Breakdown */}
          <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6">
            <h3 className="text-sm font-bold text-google-text flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-google-blue" />
              Skill Effort Distribution (Total Hours)
            </h3>

            <div className="h-60">
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
                      <Cell
                        key={`cell-${index}`}
                        fill={GOOGLE_CHART_COLORS[index % GOOGLE_CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assigned vs Available Hours Bar */}
          <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6">
            <h3 className="text-sm font-bold text-google-text flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-google-blue" />
              Assigned vs Available Capacity
            </h3>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={11} stroke="#747775" />
                  <YAxis fontSize={11} stroke="#747775" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="assigned" fill="#0B57D0" name="Assigned Hours" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" fill="#E0E3E7" name="Total Capacity" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
