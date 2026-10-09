import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Users,
  CalendarDays,
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FolderKanban,
  Shield,
  MessageSquare,
  Hash,
  Award,
  Clock,
  Settings,
  Search,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Bell,
  Layers,
  Zap,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Cohesive Navigation Items styled after the RebalanceX Workflow
  const navItems = [
    {
      step: '01',
      to: '/overview',
      label: 'Overview',
      sublabel: 'Dashboard',
      icon: Compass,
    },
    {
      step: '02',
      to: role === 'member' ? '/member/my-tasks' : '/team-formation',
      label: role === 'member' ? 'My Tasks' : 'Build Team',
      sublabel: 'Workforce',
      icon: Users,
    },
    {
      step: '03',
      to: '/progress-monitor',
      label: 'Plan Work',
      sublabel: 'CPM Schedule',
      icon: CalendarDays,
    },
    {
      step: '04',
      to: '/recovery',
      label: 'Test Changes',
      sublabel: 'Scenario Lab',
      icon: Sliders,
    },
    {
      step: '05',
      to: '/messages',
      label: 'Messages',
      sublabel: 'Direct Scope',
      icon: MessageSquare,
    },
    {
      step: '06',
      to: '/project-rooms',
      label: 'Project Rooms',
      sublabel: 'Channels',
      icon: Hash,
    },
    {
      step: '07',
      to: '/performance-allocation',
      label: 'Performance',
      sublabel: 'Allocation',
      icon: Award,
    },
    {
      step: '08',
      to: '/overtime-requests',
      label: 'Overtime',
      sublabel: 'Voluntary',
      icon: Clock,
    },
    {
      step: '09',
      to: '/settings',
      label: 'Settings',
      sublabel: 'Audit & Config',
      icon: Settings,
    },
  ];

  const roleLabel = role === 'admin' ? 'Admin' : role === 'manager' ? 'Manager' : 'Member';

  return (
    <div className="h-screen w-screen landing-canvas flex flex-col p-2 sm:p-3 lg:p-4 font-sans antialiased text-white selection:bg-amber-400 selection:text-slate-950 overflow-hidden select-none">
      
      {/* Top Outer Micro Bar */}
      <header className="flex items-center justify-between px-3 py-1 shrink-0 z-10">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-lg border border-white/30 bg-white/10 flex items-center justify-center backdrop-blur-md shadow-xs group-hover:border-white/50 transition">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white font-sans block leading-none">
            RebalanceX
          </span>
          <span className="text-[9px] font-medium text-amber-200 uppercase tracking-wider hidden sm:inline-block ml-1">
            &bull; Adaptive Intelligence
          </span>
        </NavLink>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-100">
          <span className="hidden md:inline-block text-slate-200">
            {roleLabel} Console &bull; {user?.name || 'Aarav Sharma'}
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MASTER FLOATING APPLICATION SHELL (Fits Screen 100% with Frosted Glass & Sage Atmosphere) */}
      <div className="flex-1 w-full h-full min-h-0 bg-[#0F1C16]/50 backdrop-blur-2xl rounded-[24px] sm:rounded-[32px] border border-white/20 shadow-2xl flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT SAGE/CHARCOAL SIDEBAR */}
        <aside
          className={`fixed lg:static top-0 left-0 h-full w-[250px] sm:w-[270px] bg-[#0E1A14]/95 lg:bg-[#0F1C16]/60 backdrop-blur-2xl border-r border-white/15 flex flex-col justify-between p-3.5 sm:p-4 z-50 transition-all duration-300 shrink-0 select-none overflow-y-auto no-scrollbar ${
            isMobileMenuOpen
              ? 'translate-x-0 shadow-2xl'
              : '-translate-x-full lg:translate-x-0'
          } ${isSidebarCollapsed ? 'lg:w-[84px] lg:p-2.5' : ''}`}
        >
          <div className="space-y-3.5">
            {/* Top Brand Logo & Collapse Toggle */}
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <NavLink
                to="/overview"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 group"
                title="RebalanceX Workspace"
              >
                <div className="w-9 h-9 rounded-2xl border border-white/30 bg-white/15 flex items-center justify-center text-amber-300 shadow-sm group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5 stroke-[2]" />
                </div>
                {!isSidebarCollapsed && (
                  <div>
                    <span className="font-bold text-base tracking-tight text-white leading-none block">
                      RebalanceX
                    </span>
                    <span className="text-[9px] font-medium text-amber-200 tracking-wider uppercase block mt-0.5">
                      Autonomous Engine
                    </span>
                  </div>
                )}
              </NavLink>

              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            </div>

            {/* Search Bar */}
            {!isSidebarCollapsed && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search deliverables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-2.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-medium text-white placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-300/60 focus:bg-white/15 transition"
                />
              </div>
            )}

            {/* Navigation Tiles Stack (RebalanceX Frosted Tiles) */}
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || (item.to !== '/overview' && location.pathname.startsWith(item.to));
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-2 sm:p-2.5 rounded-xl flex items-center gap-3 transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 font-bold shadow-lg shadow-black/20'
                        : 'bg-white/5 hover:bg-white/12 text-slate-200 hover:text-white border border-white/5 hover:border-white/20'
                    }`}
                    title={item.label}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#1C2420] text-amber-300' : 'bg-white/10 text-amber-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="min-w-0 flex-1 flex items-center justify-between">
                        <div className="truncate">
                          <span className="text-xs tracking-tight block leading-none">
                            {item.label}
                          </span>
                          <span className={`text-[10px] ${isActive ? 'text-slate-500 font-semibold' : 'text-slate-300'}`}>
                            {item.sublabel}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono ${isActive ? 'text-slate-400' : 'text-amber-300/70'}`}>
                          {item.step}
                        </span>
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Bottom Pro AI Status Box & Sign Out */}
          <div className="pt-3 space-y-2.5 border-t border-white/10">
            {!isSidebarCollapsed ? (
              <div
                onClick={() => navigate('/recovery')}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-300/30 shadow-xs cursor-pointer hover:border-amber-300/60 transition group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Adaptive Intelligence
                  </span>
                </div>
                <p className="text-[9px] text-slate-200 leading-tight">
                  Zero-slack CPM Solver Active.
                </p>
              </div>
            ) : null}

            {/* Logout Row */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN APPLICATION CANVAS (Light Muted Canvas with High Contrast & Smooth Internal Scrolling) */}
        <main className="flex-1 bg-[#F6F8F7] text-slate-900 overflow-y-auto min-w-0 h-full p-4 sm:p-6 lg:p-7 relative">
          <Outlet />
        </main>

      </div>

      {/* Floating RebalanceX Assistant */}
      <RebalanceXAssistant />

      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}
