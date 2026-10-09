import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  Sparkles,
  GitCompare,
  History,
  Settings,
  PlayCircle,
  RotateCcw,
  Plus,
  Menu,
  X,
  ChevronDown,
  FolderGit2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { NewProjectModal } from '../modals/NewProjectModal';

export function AppLayout() {
  const {
    activeProjectId,
    setActiveProjectId,
    activeProject,
    activeProposal,
    projects,
    handleResetDemo,
    runLiveDemoSequence,
  } = useProject();

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isSimulationPage = location.pathname === '/crisis-simulator';
  const isReviewPage = location.pathname === '/rebalance-diff';

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { to: '/', label: 'Overview', icon: LayoutDashboard, badge: null },
      ],
    },
    {
      group: 'Plan',
      items: [
        { to: '/team-formation', label: 'Build a team', icon: Users, badge: 'PS#11' },
        { to: '/task-planning', label: 'Tasks & schedule', icon: CalendarDays, badge: null },
        { to: '/resource-matrix', label: 'Workload', icon: BarChart3, badge: null },
      ],
    },
    {
      group: 'What-if & Recovery',
      items: [
        { to: '/crisis-simulator', label: 'Try a what-if', icon: Sparkles, badge: 'PS#18' },
        {
          to: '/rebalance-diff',
          label: 'Review changes',
          icon: GitCompare,
          badge: activeProposal ? '1 Pending' : null,
          badgeColor: activeProposal ? 'bg-google-blue text-white' : undefined,
        },
      ],
    },
    {
      group: 'History',
      items: [
        { to: '/decision-audit', label: 'History', icon: History, badge: null },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-google-bg font-sans">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-google-border flex flex-col flex-shrink-0 transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 px-5 border-b border-google-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-google-blue flex items-center justify-center text-white font-bold text-sm shadow-google-xs">
              RX
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-google-text leading-tight flex items-center gap-1.5">
                RebalanceX
              </h1>
              <p className="text-[11px] font-medium text-google-textMuted">Adaptive Project Intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-google-textMuted hover:bg-google-subtle"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="p-3 flex-1 overflow-y-auto space-y-5">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-google-textMuted">
                {grp.group}
              </div>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2 rounded-full text-[13px] font-medium transition-all ${
                          isActive
                            ? 'bg-google-blueSurface text-google-blueText font-semibold shadow-xs'
                            : 'text-google-textSecondary hover:bg-google-subtle hover:text-google-text'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 stroke-[2.2] flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            item.badgeColor || 'bg-google-subtle text-google-textSecondary'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Secondary Settings Item */}
          <div className="pt-2 border-t border-google-border/60">
            <NavLink
              to="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-google-blueSurface text-google-blueText font-semibold'
                    : 'text-google-textSecondary hover:bg-google-subtle hover:text-google-text'
                }`
              }
            >
              <Settings className="w-4 h-4 stroke-[2.2]" />
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* Footer Project & Solver Status */}
        <div className="p-3.5 border-t border-google-border bg-google-subtle/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-google-teal animate-pulse" />
              <span className="text-google-text text-[11px] font-medium">
                Optimizer: <strong className="text-google-teal">Active</strong>
              </span>
            </div>
            <span className="text-[10px] font-bold text-google-blue bg-white px-2 py-0.5 rounded-full border border-google-border">
              v1.0 MILP
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-google-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-google-textSecondary hover:bg-google-subtle"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active Project Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-google-textMuted hidden sm:inline">Project:</span>
              <div className="relative">
                <select
                  value={activeProjectId}
                  onChange={(e) => setActiveProjectId(Number(e.target.value))}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-full border border-google-border bg-google-subtle text-xs font-semibold text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue cursor-pointer hover:bg-white transition"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.deadline_days}d deadline)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-google-textMuted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={() => setIsNewProjectOpen(true)}
              className="google-btn-secondary py-1.5 px-3 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">New Project</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Demo Workflow */}
            <button
              onClick={runLiveDemoSequence}
              className="google-btn-primary py-1.5 px-3.5 text-xs shadow-google-xs"
              title="Run end-to-end automated demo flow"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Run Quick Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>

            <button
              onClick={handleResetDemo}
              title="Reset data to default clean state"
              className="google-btn-secondary py-1.5 px-3 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </header>

        {/* Global Simulation Context Alert Banner if in simulation / proposal review */}
        {isSimulationPage && (
          <div className="bg-google-amberSurface/80 border-b border-google-amber/30 px-6 py-2 text-xs text-google-amber flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Simulation Mode:</strong> This tests what-if scenarios in sandbox mode. Your saved plan changes only after you approve a recovery plan.
            </span>
          </div>
        )}

        {isReviewPage && (
          <div className="bg-google-blueSurface/80 border-b border-google-blue/30 px-6 py-2 text-xs text-google-blue flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Reviewing Proposed Plan:</strong> Inspect changes below. Approving will update your project's saved baseline schedule.
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* New Project Dialog */}
      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}
