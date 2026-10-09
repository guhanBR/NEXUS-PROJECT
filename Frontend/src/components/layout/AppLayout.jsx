import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Activity,
  Flame,
  GitCompare,
  History,
  Sliders,
  PlayCircle,
  RotateCcw,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { NewProjectModal } from '../modals/NewProjectModal';

export function AppLayout() {
  const {
    activeProjectId,
    setActiveProjectId,
    projects,
    handleResetDemo,
    runLiveDemoSequence,
  } = useProject();

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Command Center', icon: LayoutDashboard },
    { to: '/team-formation', label: 'Team Formation (PS#11)', icon: Users },
    { to: '/task-planning', label: 'Task Planning & Gantt', icon: KanbanSquare },
    { to: '/resource-matrix', label: 'Resource Heatmap', icon: Activity },
    { to: '/crisis-simulator', label: 'Crisis Simulator (PS#18)', icon: Flame },
    { to: '/rebalance-diff', label: 'Rebalancing & Diff', icon: GitCompare },
    { to: '/decision-audit', label: 'Decision Audit Trail', icon: History },
    { to: '/settings', label: 'Settings & Presets', icon: Sliders },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            RX
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">RebalanceX</h1>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Adaptive Intelligence</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-3 flex-1 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200/50 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Status */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 animate-pulse" />
              <span className="text-slate-700 font-medium">Solver: <strong>Online</strong></span>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
              v1.0 MILP
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-7 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Project:</span>
              <select
                value={activeProjectId}
                onChange={(e) => setActiveProjectId(Number(e.target.value))}
                className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.deadline_days}d deadline)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsNewProjectOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Plus className="w-3.5 h-3.5" /> New Project
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runLiveDemoSequence}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <PlayCircle className="w-4 h-4" /> Run Hackathon Demo
            </button>

            <button
              onClick={handleResetDemo}
              title="Reset dataset to baseline"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
            </button>
          </div>
        </header>

        {/* Scrollable Workspaces */}
        <main className="flex-1 overflow-y-auto p-7">
          <Outlet />
        </main>
      </div>

      {/* New Project Modal */}
      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}
