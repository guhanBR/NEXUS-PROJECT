import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  LayoutDashboard,
  Users,
  CalendarDays,
  Sparkles,
  History,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Compass,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { NewProjectModal } from '../modals/NewProjectModal';

export function AppLayout() {
  const {
    activeProjectId,
    setActiveProjectId,
    activeProject,
    projects,
  } = useProject();

  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const projectTabs = [
    { to: '/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/team-formation', label: 'Team', icon: Users },
    { to: '/task-planning', label: 'Tasks', icon: CalendarDays },
    { to: '/recovery', label: 'Recovery', icon: Sparkles },
    { to: '/decision-audit', label: 'History', icon: History },
  ];

  return (
    <div className="workspace-canvas flex flex-col font-sans text-slate-900 min-h-screen">
      {/* Top Header - Frosted Sage & Obsidian Bar */}
      <header className="bg-[#242C28]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Projects Directory Link */}
            <div className="flex items-center gap-6">
              <NavLink to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl border border-white/30 bg-white/10 flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-inner">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="font-serif text-lg font-normal tracking-wide text-white">
                  Rebalance<span className="italic font-light opacity-90">X</span>
                </span>
              </NavLink>

              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                    isActive ? 'bg-white/20 text-white border border-white/30' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>All Projects</span>
              </NavLink>

              {/* Active Project Selector */}
              {activeProject && (
                <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/15">
                  <span className="text-[11px] uppercase tracking-wider text-white/60 font-medium">Active:</span>
                  <div className="relative">
                    <select
                      value={activeProjectId || ''}
                      onChange={(e) => setActiveProjectId(Number(e.target.value))}
                      className="appearance-none pl-3 pr-8 py-1 rounded-xl border border-white/20 bg-white/10 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60 cursor-pointer"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id} className="text-slate-900 bg-white">
                          {p.name} ({p.deadline_days}d deadline)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-white/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Right: User & Actions */}
            <div className="flex items-center gap-3">
              {role !== 'member' && (
                <button
                  onClick={() => setIsNewProjectOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Project</span>
                </button>
              )}

              {/* Settings secondary link */}
              {role !== 'member' && (
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `p-2 rounded-xl transition ${
                      isActive ? 'bg-white/25 text-amber-300' : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`
                  }
                  title="Settings & Optimization Tuning"
                >
                  <Settings className="w-4 h-4" />
                </NavLink>
              )}

              {/* User Chip */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-white/15 text-xs">
                <span className="font-medium text-white/90 hidden sm:inline">{user?.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {role === 'admin' ? 'Admin' : role === 'manager' ? 'Manager' : 'Member'}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 rounded-xl text-white/60 hover:text-red-300 hover:bg-white/10 transition ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Project Details 5-Tab Bar */}
          {activeProject && (
            <div className="flex items-center gap-1.5 border-t border-white/10 overflow-x-auto py-2">
              {projectTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-[#1E2622] font-bold shadow-sm ring-1 ring-white/30'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}

