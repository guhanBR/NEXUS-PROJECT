import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Wallet,
  BarChart2,
  Box,
  Users,
  LogOut,
  Layers,
  Sparkles,
  Settings,
  MessageSquare,
  Hash,
  Award,
  Clock,
  Menu,
  X,
  FolderKanban,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { NewProjectModal } from '../modals/NewProjectModal';
import { RebalanceXAssistant } from '../assistant/RebalanceXAssistant';

export function AppLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Vertical Navigation Items with Labels and Icons
  const navItems = [
    {
      to: '/overview',
      label: 'Overview',
      badge: 'Live',
      icon: LayoutGrid,
    },
    {
      to: role === 'member' ? '/member/my-tasks' : '/team-formation',
      label: role === 'member' ? 'My Tasks' : 'Workforce & Assets',
      icon: Wallet,
    },
    {
      to: '/progress-monitor',
      label: 'Progress Monitor',
      icon: BarChart2,
    },
    {
      to: '/recovery',
      label: 'Scenario Lab',
      icon: Box,
    },
    {
      to: '/messages',
      label: 'Direct Messages',
      icon: Users,
    },
    {
      to: '/project-rooms',
      label: 'Project Rooms',
      icon: Hash,
    },
    {
      to: '/performance-allocation',
      label: 'Performance',
      icon: Award,
    },
    {
      to: '/overtime-requests',
      label: 'Overtime',
      icon: Clock,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const roleLabel = role === 'admin' ? 'Admin' : role === 'manager' ? 'Manager' : 'Member';

  return (
    <div className="h-screen w-screen bg-[#141518] flex flex-col lg:flex-row overflow-hidden font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white p-0 m-0">
      
      {/* MOBILE TOP BAR (Only visible on small viewports) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#18191E] border-b border-[#282A30] text-white shrink-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFF8E7] text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-white tracking-tight leading-none">
              Ryzen Matrix
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {roleLabel} Console
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* DESKTOP + MOBILE SLIM SIDEBAR (Top-Tier Modern Aesthetics) */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-[78px] bg-[#18191E] border-r border-[#26282E] flex flex-col justify-between items-center py-4.5 z-40 transition-all duration-300 shrink-0 select-none ${
          isMobileMenuOpen
            ? 'translate-x-0 w-64 p-5 shadow-2xl items-start bg-[#18191E]/98 backdrop-blur-xl'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Logo: Butter / Cream Squircle with Dark Icon */}
        <div className="flex flex-col items-center w-full pt-0.5">
          <NavLink
            to="/overview"
            onClick={() => setIsMobileMenuOpen(false)}
            className="group relative flex items-center gap-3 w-full lg:justify-center p-1 rounded-2xl transition-all"
            title="Ryzen Matrix Dashboard"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFF8E7] text-slate-950 flex items-center justify-center shadow-lg ring-1 ring-white/20 hover:scale-105 active:scale-95 transition-all">
              <div className="flex flex-col items-center justify-center space-y-[2.5px]">
                <div className="w-4 h-1 bg-slate-950 rounded-full group-hover:w-4.5 transition-all" />
                <div className="w-4 h-1 bg-slate-950 rounded-full group-hover:w-3 transition-all" />
                <div className="w-4 h-1 bg-slate-950 rounded-full" />
              </div>
            </div>
            {isMobileMenuOpen && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base text-white tracking-tight leading-none">
                  Ryzen Matrix
                </span>
                <span className="text-[11px] text-amber-300 font-semibold mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Adaptive Engine
                </span>
              </div>
            )}
          </NavLink>
        </div>

        {/* Middle Navigation Icon Stack with High-Res Tooltips */}
        <div className="flex flex-col items-center gap-2.5 my-auto py-2 w-full overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <div key={item.to} className="relative group w-full flex lg:justify-center">
                <NavLink
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 relative ${
                    isMobileMenuOpen ? 'w-full justify-start px-3.5 gap-3 h-11' : ''
                  } ${
                    isActive
                      ? 'bg-white/20 text-white shadow-md ring-1 ring-white/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {/* Left Active Glow Indicator Strip (Desktop) */}
                  {isActive && !isMobileMenuOpen && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                  )}

                  <Icon className="w-5 h-5 stroke-[1.9] shrink-0" />

                  {/* Mobile Menu Label */}
                  {isMobileMenuOpen && (
                    <span className="text-sm font-semibold text-slate-200 truncate">
                      {item.label}
                    </span>
                  )}
                </NavLink>

                {/* Desktop Hover Tooltip with Pointer Arrow */}
                <div className="hidden lg:group-hover:flex absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-950/95 backdrop-blur-md text-white text-xs font-semibold whitespace-nowrap shadow-2xl border border-white/15 z-50 pointer-events-none items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                  {/* Tooltip Left Arrow */}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-950 border-l border-b border-white/15 rotate-45" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section: User Avatar & Logout */}
        <div className="flex flex-col items-center gap-3 w-full pb-1 pt-2 border-t border-white/5">
          {/* User Profile Avatar with Status Pulse */}
          <div className="relative group cursor-pointer flex items-center lg:justify-center w-full">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                alt={user?.name || 'User'}
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white/15 group-hover:ring-white/40 transition-all shadow-md"
              />
              <span className="w-3 h-3 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#18191E]" />
            </div>

            {isMobileMenuOpen && (
              <div className="ml-3 flex flex-col">
                <span className="text-xs font-bold text-white leading-tight">
                  {user?.name || 'Zoia M.'}
                </span>
                <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                  {roleLabel}
                </span>
              </div>
            )}

            {/* Desktop Profile Tooltip */}
            <div className="hidden lg:group-hover:flex absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3.5 py-2 rounded-xl bg-slate-950/95 backdrop-blur-md text-white text-xs font-semibold whitespace-nowrap shadow-2xl border border-white/15 z-50 pointer-events-none flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="font-bold text-slate-100 flex items-center gap-1.5">
                <span>{user?.name || 'Aarav Sharma'}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[9px] uppercase font-black border border-amber-400/30">
                  {roleLabel}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">
                {user?.email || 'aarav.sharma@ryzenmatrix.ai'}
              </span>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-950 border-l border-b border-white/15 rotate-45" />
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 active:scale-95 transition-all group relative"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5 stroke-[1.9]" />
            <div className="hidden lg:group-hover:flex absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-rose-950/95 backdrop-blur-md text-rose-200 text-xs font-bold whitespace-nowrap shadow-2xl border border-rose-500/30 z-50 pointer-events-none items-center gap-1.5">
              <span>Sign out</span>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-rose-950 border-l border-b border-rose-500/30 rotate-45" />
            </div>
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE CANVAS (100% Fit to Screen with Smooth Internal Scrolling) */}
      <main className="flex-1 bg-white overflow-y-auto min-w-0 h-full p-4 sm:p-6 lg:p-8 relative">
        <div className="max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Floating Project Assistant */}
      <RebalanceXAssistant />

      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}
