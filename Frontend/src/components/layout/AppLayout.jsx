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
  AlertTriangle,
  Zap,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  User,
  CreditCard,
  ArrowLeftRight,
  Repeat,
  Receipt,
  Snowflake,
  Sliders,
  Key,
  Shield,
  MessageSquare,
  PanelLeftClose,
  CheckSquare,
  UploadCloud,
  DownloadCloud,
  Clock,
  Award,
  TrendingUp,
  Hash,
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

  // Dynamic Role-Based Modules (Exact Match to Master Prompt Table 4)
  const getRoleNav = () => {
    if (role === 'member') {
      return {
        squircleTiles: [
          { to: '/member/my-tasks', label: 'My Tasks', icon: CheckSquare },
          { to: '/overview', label: 'Workspace', icon: LayoutDashboard },
          { to: '/progress-monitor', label: 'Team Progress', icon: TrendingUp },
          { to: '/messages', label: 'Messages', icon: MessageSquare },
          { to: '/performance-allocation', label: 'Performance', icon: Award },
          { to: '/project-rooms', label: 'Rooms', icon: Hash },
        ],
        secondaryLinks: [
          { to: '/overtime-requests', label: 'My Overtime Requests', icon: Clock },
          { to: '/settings', label: 'Settings', icon: Settings },
        ],
      };
    }

    if (role === 'manager') {
      return {
        squircleTiles: [
          { to: '/overview', label: 'Oversight', icon: LayoutDashboard },
          { to: '/team-formation', label: 'Team Overview', icon: Users },
          { to: '/progress-monitor', label: 'Task Progress', icon: TrendingUp },
          { to: '/recovery', label: 'Recovery Review', icon: Sliders },
          { to: '/team-formation', label: 'Team Recs', icon: Sparkles },
          { to: '/messages', label: 'Messages', icon: MessageSquare },
        ],
        secondaryLinks: [
          { to: '/performance-allocation', label: 'Performance Reports', icon: Award },
          { to: '/overtime-requests', label: 'Overtime Overview', icon: Clock },
          { to: '/project-rooms', label: 'Project Rooms', icon: Hash },
          { to: '/settings', label: 'Settings', icon: Settings },
        ],
      };
    }

    // Default: Admin
    return {
      squircleTiles: [
        { to: '/projects', label: 'Portfolio', icon: FolderKanban },
        { to: '/team-formation', label: 'Workforce', icon: Users },
        { to: '/progress-monitor', label: 'Monitor', icon: TrendingUp },
        { to: '/admin/task-planning', label: 'Task Control', icon: CalendarDays },
        { to: '/recovery', label: 'Scenario Lab', icon: Sliders },
        { to: '/team-formation', label: 'AI Builder', icon: Sparkles },
      ],
      secondaryLinks: [
        { to: '/messages', label: 'Direct Messages', icon: MessageSquare },
        { to: '/performance-allocation', label: 'Performance & Allocation', icon: Award },
        { to: '/overtime-requests', label: 'Overtime Requests', icon: Clock },
        { to: '/project-rooms', label: 'Project Rooms', icon: Hash },
        { to: '/decision-audit', label: 'Decision Audit', icon: History },
        { to: '/settings', label: 'Settings', icon: Settings },
      ],
    };
  };

  const { squircleTiles, secondaryLinks } = getRoleNav();

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white relative">
      <div className="flex-1 flex flex-col lg:flex-row min-h-screen w-full">
        
        {/* Mobile Header Bar */}
        <div className="lg:hidden bg-white px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">Ryzen Matrix</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">Workspace</span>
          </NavLink>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* LEFT SIDEBAR - Clean, Intuitive Navigation */}
        <aside
          className={`fixed lg:static top-0 left-0 h-full lg:min-h-screen w-64 bg-[#F8FAF9] border-r border-[#EAEFEA] flex flex-col justify-between p-4 sm:p-5 z-40 transition-transform duration-300 ease-in-out shrink-0 ${
            isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-4 overflow-y-auto pr-0.5">
            {/* Top Brand Header */}
            <div className="flex items-center justify-between px-1 pt-1">
              <NavLink to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-slate-900 block leading-none">
                    Ryzen Matrix
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mt-0.5">
                    Adaptive Workspace
                  </span>
                </div>
              </NavLink>

              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 shadow-2xs transition"
                title="Sidebar layout"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Pill Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3.5 py-2 rounded-full bg-white border border-[#E2E8E4] text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-300 shadow-2xs transition"
              />
            </div>

            {/* Active Workspace Selector Mini Pill */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="w-full flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-left text-[11px] font-bold text-slate-800 shadow-2xs transition"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{currentProjectName}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

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
                          className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
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

            {/* 2x3 Squircle Tile Navigation Grid (Simple & Essential Workspaces) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {squircleTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <NavLink
                    key={tile.label}
                    to={tile.to}
                    end={tile.to === '/overview'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all text-center group ${
                        isActive
                          ? 'bg-[#1C1F22] text-white shadow-md shadow-black/10'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-[#E6EAE7] shadow-2xs'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 mb-1.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                        <span className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          {tile.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Secondary Vertical Navigation Menu */}
            <div className="space-y-0.5 pt-2 border-t border-[#EAEFEA]">
              {secondaryLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={idx}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Bottom Section: User Info & Logout */}
          <div className="mt-4 pt-3 border-t border-[#EAEFEA]">
            <div className="flex flex-col gap-1.5 px-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">{role || 'user'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[11px] font-bold text-slate-500 hover:text-red-600 transition"
                >
                  Sign out
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-500/10 border border-amber-300/60 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Team Ryzen Matrix</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE VIEWPORT */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF] overflow-y-auto">
          {/* TOP HEADER BAR */}
          <header className="px-6 sm:px-8 py-5 bg-white border-b border-[#F0F4F1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30">
            {/* Left: Good Morning, Member + Team Ryzen Matrix Badge + Date */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Good Morning, {user?.name?.split(' ')[0] || 'Member'}
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Friday, 15 July 2026
                </p>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Team Ryzen Matrix</span>
              </div>
            </div>

            {/* Right Action Pills (Transfer, 4-dot, Received, Messages, Bell, Avatar) */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => navigate('/recovery')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 text-xs font-bold shadow-2xs transition"
              >
                <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                <span>Transfer</span>
              </button>

              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-2xs transition"
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                </div>
              </button>

              <button
                onClick={() => navigate('/task-planning')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 text-xs font-bold shadow-2xs transition"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-slate-600" />
                <span>Received</span>
              </button>

              <div className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-2xs cursor-pointer">
                <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-2xs cursor-pointer relative">
                <Bell className="w-3.5 h-3.5 text-slate-600" />
              </div>

              {/* User Profile Avatar with Image Fallback */}
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="Alvie"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
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
