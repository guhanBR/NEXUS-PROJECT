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
  Briefcase
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
    <div className="h-screen w-screen landing-canvas flex flex-col font-sans antialiased text-white selection:bg-amber-400 selection:text-slate-950 overflow-hidden select-none">
      
      {/* Mobile-Only Top Navigation Bar with Safe Area Support */}
      <header className="lg:hidden flex items-center justify-between px-4 py-2.5 pt-safe bg-[#0E1A14]/95 border-b border-white/10 shrink-0 z-30">
        <NavLink to="/overview" className="flex items-center gap-2 group">
          <span className="font-bold text-base tracking-tight text-white font-sans block leading-none">
            Ryzen Matrix
          </span>
          <span className="text-[9px] font-medium text-amber-200 uppercase tracking-wider block">
            &bull; {roleLabel}
          </span>
        </NavLink>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-300 font-medium truncate max-w-[120px]">
            {user?.name || 'Aarav Sharma'}
          </span>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition flex items-center justify-center"
            aria-label="Toggle Navigation Drawer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* MASTER APPLICATION SHELL */}
      <div className="flex-1 w-full h-full min-h-0 flex flex-col lg:flex-row overflow-hidden lg:p-3 lg:gap-3">
        
        {/* SIDEBAR (Desktop Fixed or Mobile Drawer) */}
        <aside
          className={`fixed lg:static top-0 left-0 h-full w-[260px] bg-[#0E1A14]/95 lg:bg-[#0F1C16]/80 backdrop-blur-2xl lg:rounded-3xl border-r lg:border border-white/15 flex flex-col justify-between p-4 pt-safe lg:pt-4 z-50 transition-transform duration-300 shrink-0 select-none overflow-y-auto no-scrollbar shadow-2xl ${
            isMobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          } ${isSidebarCollapsed ? 'lg:w-[76px] lg:p-2.5' : ''}`}
        >
          <div className="space-y-3.5">
            {/* Top Brand Logo & Collapse Toggle */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <NavLink
                to="/overview"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 group"
                title="Ryzen Matrix Workspace"
              >
                {!isSidebarCollapsed ? (
                  <div>
                    <span className="font-bold text-base tracking-tight text-white leading-none block">
                      Ryzen Matrix
                    </span>
                    <span className="text-[9px] font-medium text-amber-200 tracking-wider uppercase block mt-0.5">
                      Adaptive Workspace
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-sm tracking-tight text-amber-200 block text-center w-full">
                    RM
                  </span>
                )}
              </NavLink>

              {/* Desktop Collapse Toggle */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            {!isSidebarCollapsed && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search deliverables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-2.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-300/60 focus:bg-white/15 transition"
                />
              </div>
            )}

            {/* Navigation Tiles Stack */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || (item.to !== '/overview' && location.pathname.startsWith(item.to));
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-2 rounded-xl flex items-center gap-2.5 transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 font-bold shadow-md'
                        : 'bg-white/5 hover:bg-white/12 text-slate-200 hover:text-white border border-transparent hover:border-white/10'
                    } ${isSidebarCollapsed ? 'justify-center p-2.5' : ''}`}
                    title={item.label}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#1C2420] text-amber-300' : 'bg-white/10 text-amber-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 stroke-[2]" />
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="min-w-0 flex-1 flex items-center justify-between">
                        <div className="truncate">
                          <span className="text-xs tracking-tight block leading-none">
                            {item.label}
                          </span>
                          <span className={`text-[9px] ${isActive ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
                            {item.sublabel}
                          </span>
                        </div>
                        <span className={`text-[9px] font-mono ${isActive ? 'text-slate-400' : 'text-amber-300/70'}`}>
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
          <div className="pt-3 space-y-2 border-t border-white/10">
            {!isSidebarCollapsed && (
              <div
                onClick={() => {
                  navigate('/recovery');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-300/30 shadow-xs cursor-pointer hover:border-amber-300/60 transition group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Adaptive Solver
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300">
                    Online
                  </span>
                </div>
                <p className="text-[9px] text-slate-200 leading-tight">
                  Zero-slack CPM Solver Active.
                </p>
              </div>
            )}

            {/* Logout Row */}
            <button
              type="button"
              onClick={handleLogout}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {/* MAIN APPLICATION CONTENT CANVAS */}
        <main className="flex-1 bg-[#F6F8F7] text-slate-900 overflow-y-auto min-w-0 h-full p-3 sm:p-5 lg:p-6 lg:rounded-3xl shadow-xl relative pb-safe">
          <Outlet />
        </main>

      </div>

      {/* Floating RebalanceX Assistant */}
      <RebalanceXAssistant />

      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}
