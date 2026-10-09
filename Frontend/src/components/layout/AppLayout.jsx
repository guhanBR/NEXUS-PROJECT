import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  Search,
  Bell,
  CheckCircle2,
  CheckSquare,
  AlertTriangle,
  Zap,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { NewProjectModal } from '../modals/NewProjectModal';
import { RebalanceXAssistant } from '../assistant/RebalanceXAssistant';

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
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProjectDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const currentProjectName =
    activeProject?.name ||
    projects.find((p) => p.id === activeProjectId)?.name ||
    (projects.length > 0 ? projects[0].name : 'Loading workspace...');

  // Primary 2x2 Squircle Navigation Tiles adapted to role
  const mainTiles = [
    { to: '/overview', label: 'Home', sublabel: 'Dashboard', icon: LayoutDashboard },
    { to: '/team-formation', label: 'Roster', sublabel: 'Team Pool', icon: Users },
    role === 'member'
      ? { to: '/member/my-tasks', label: 'My Tasks', sublabel: 'Personal Work', icon: CheckSquare }
      : { to: '/admin/task-planning', label: 'Planning', sublabel: 'CPM Schedule', icon: CalendarDays },
    { to: '/recovery', label: 'Recovery', sublabel: 'Simulations', icon: Sparkles },
  ];

  // Secondary Navigation List
  const secondaryLinks = [
    { to: '/decision-audit', label: 'Audit History', icon: History },
    { to: '/projects', label: 'Portfolio Projects', icon: FolderKanban },
    { to: '/settings', label: 'Talent & Settings', icon: Settings },
  ];

  // Formatted current date like "Friday, 15 July 2026"
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="workspace-canvas min-h-screen p-2 sm:p-4 lg:p-6 flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Master Floating Frame Container */}
      <div className="dashboard-frame flex-1 flex flex-col lg:flex-row overflow-hidden shadow-2xl relative">
        
        {/* Mobile Header Bar */}
        <div className="lg:hidden bg-white px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              RX
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">RebalanceX</span>
          </NavLink>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* LEFT SIDEBAR - Clean Soft Matte Neumorphic Design */}
        <aside
          className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-72 bg-[#F8FAF9] border-r border-[#E8ECE9] flex flex-col justify-between p-5 z-40 transition-transform duration-300 ease-in-out shrink-0 ${
            isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-5 overflow-y-auto pr-0.5">
            {/* Top Brand Header */}
            <div className="flex items-center justify-between px-1">
              <NavLink to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md transition-transform group-hover:scale-105">
                  <Compass className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-slate-900 block leading-none">
                    Rebalance<span className="text-amber-600 font-extrabold">X</span>
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                    Adaptive Intelligence
                  </span>
                </div>
              </NavLink>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pill Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search modules..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-white border border-[#E2E8E4] text-xs font-medium text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 shadow-2xs transition"
              />
            </div>

            {/* Active Project Selector Card */}
            <div className="relative" ref={dropdownRef}>
              <div className="p-3 bg-white rounded-2xl border border-[#E2E8E4] shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-600 px-0.5">
                  <span>Active Workspace</span>
                  {activeProject && (
                    <span className="text-[10px] text-emerald-800 font-bold font-tabular bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300">
                      {activeProject.deadline_days}d limit
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs font-bold text-slate-900 transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_#10B981]" />
                    <span className="truncate">{currentProjectName}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Popover Dropdown */}
              {isProjectDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
                    {projects.map((p) => {
                      const isSelected = p.id === activeProjectId;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setActiveProjectId(p.id);
                            setIsProjectDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-slate-900 text-white font-bold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate pr-2">{p.name}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2x2 Squircle Primary Navigation Grid (Matching Zixo Tile Reference) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-1">
                Workspace Controls
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mainTiles.map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <NavLink
                      key={tile.to}
                      to={tile.to}
                      end={tile.to === '/overview'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all text-center group ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                            : 'bg-white hover:bg-white/80 text-slate-600 hover:text-slate-900 border border-[#E2E8E4] shadow-2xs'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-5 h-5 mb-1.5 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                          <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{tile.label}</span>
                          <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-slate-600 font-medium'}`}>{tile.sublabel}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Secondary Menu List */}
            <div className="space-y-1 pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-1 mb-1">
                Management
              </div>
              {secondaryLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-slate-200/80 text-slate-900 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Bottom Promo / Engine Status Card (Matching Juice Lab Reference) */}
          <div className="mt-4 pt-3 border-t border-[#E8ECE9] space-y-3">
            <div className="p-3 bg-gradient-to-br from-amber-50/80 via-emerald-50/50 to-white rounded-2xl border border-amber-200/60 shadow-2xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span>Pro Engine</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded-md uppercase">AI</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Adaptive CPM optimization</p>
              </div>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</div>
                  <div className="text-[10px] text-slate-600 font-semibold uppercase">{role || 'lead'}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F4F7F5] overflow-y-auto">
          {/* Top Header Controls Bar (Matching Reference Greeting & Pill Actions) */}
          <header className="px-6 py-5 bg-white/90 backdrop-blur-md border-b border-[#E8ECE9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30">
            {/* Left Greeting & Formatted Date */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Good Morning, {user?.name?.split(' ')[0] || 'Alvie'}</span>
              </h1>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {formattedDate} &bull; <span className="text-emerald-800 font-semibold">Active CPM Scheduler Online</span>
              </p>
            </div>

            {/* Right Action Pill Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {role !== 'member' ? (
                <>
                  <button
                    onClick={() => navigate('/recovery')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs transition hover:scale-[1.02]"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Simulate Outage</span>
                  </button>

                  <button
                    onClick={() => navigate('/admin/task-planning')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition hover:scale-[1.02]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Compute CPM</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/member/my-tasks')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition hover:scale-[1.02]"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
                  <span>My Deliverables</span>
                </button>
              )}

              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs relative">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5 shadow-[0_0_4px_#F59E0B]" />
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name?.[0] || 'A'}
              </div>
            </div>
          </header>

          {/* Router Content Container */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Project-Aware Assistant Chatbot */}
      <RebalanceXAssistant />

      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}
