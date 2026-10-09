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
  Menu,
  X,
  Compass,
  Layers,
  ArrowRight,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="workspace-canvas flex flex-col md:flex-row min-h-screen font-sans text-slate-900">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#18211D] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-white/10 shadow-md">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg border border-white/30 bg-white/10 flex items-center justify-center text-white">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="font-serif text-base font-normal tracking-wide text-white">
            Rebalance<span className="italic font-light opacity-90">X</span>
          </span>
        </NavLink>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar - Refined Obsidian & Muted Sage Theme */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-[#18211D] text-white flex flex-col justify-between shrink-0 border-r border-white/[0.08] p-5 z-40 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl border border-white/25 bg-white/10 flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-inner">
                <Compass className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="font-serif text-xl font-normal tracking-wide text-white block leading-none">
                  Rebalance<span className="italic font-light opacity-90">X</span>
                </span>
                <span className="text-[10px] text-white/40 tracking-wider uppercase font-medium">
                  Autonomous Operations
                </span>
              </div>
            </NavLink>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Project Switcher Card */}
          <div className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/50">
              <span>Active Project</span>
              {activeProject && (
                <span className="text-[10px] text-amber-300 font-mono font-medium">
                  {activeProject.deadline_days}d deadline
                </span>
              )}
            </div>

            <div className="relative">
              <select
                value={activeProjectId || ''}
                onChange={(e) => setActiveProjectId(Number(e.target.value))}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-white/10 bg-white/10 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="text-slate-900 bg-white">
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-white/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Workspace Modules Section */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
              Workspace Modules
            </div>

            {projectTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.to === '/overview'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-[#18211D] font-bold shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_#F59E0B]" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Directory & Actions Section */}
          <div className="space-y-1 pt-3 border-t border-white/[0.08]">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
              Portfolio Management
            </div>

            <NavLink
              to="/projects"
              end
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#18211D] font-bold shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                }`
              }
            >
              <FolderKanban className="w-4 h-4" />
              <span>All Projects</span>
            </NavLink>

            {role !== 'member' && (
              <button
                onClick={() => {
                  setIsNewProjectOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>New Project</span>
              </button>
            )}

            {role !== 'member' && (
              <NavLink
                to="/settings"
                end
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#18211D] font-bold shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                <span>Settings & Tuning</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Bottom User Profile Card */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                {role}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-xl text-white/60 hover:text-red-300 hover:bg-white/[0.08] transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>

      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}



