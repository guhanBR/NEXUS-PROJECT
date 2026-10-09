import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  CreditCard,
  BarChart2,
  ArrowLeftRight,
  RefreshCw,
  Receipt,
  Snowflake,
  Clock,
  Key,
  FolderKanban,
  Shield,
  Search,
  Sparkles,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Bell,
  MessageSquare,
  Upload,
  Layers,
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

  // 2-Column Main Navigation Tiles (Matching Reference UI 1:1)
  const navTiles = [
    {
      to: '/overview',
      label: 'Home',
      icon: Home,
    },
    {
      to: '/projects',
      label: 'Cards',
      sublabel: 'Projects',
      icon: CreditCard,
    },
    {
      to: role === 'member' ? '/member/my-tasks' : '/team-formation',
      label: 'Analytics',
      sublabel: 'Workforce',
      icon: BarChart2,
    },
    {
      to: '/progress-monitor',
      label: 'Transfars',
      sublabel: 'Progress',
      icon: ArrowLeftRight,
    },
    {
      to: '/recovery',
      label: 'Swap Coins',
      sublabel: 'Scenario Lab',
      icon: RefreshCw,
    },
    {
      to: '/performance-allocation',
      label: 'Payments',
      sublabel: 'Performance',
      icon: Receipt,
    },
  ];

  // Lower Utility Actions List (Matching Reference UI 1:1)
  const utilityItems = [
    {
      to: '/recovery',
      label: 'Freeze Card',
      sublabel: 'Simulate Outage',
      icon: Snowflake,
    },
    {
      to: '/overtime-requests',
      label: 'Set Spending Limit',
      sublabel: 'Capacity Limits',
      icon: Clock,
    },
    {
      to: '/task-planning',
      label: 'View Card PIN',
      sublabel: 'CPM Milestone Keys',
      icon: Key,
    },
    {
      to: '/project-rooms',
      label: 'Manage Subscriptions',
      sublabel: 'Project Rooms',
      icon: FolderKanban,
    },
    {
      to: '/settings',
      label: 'Security Settings',
      sublabel: 'Governance & Audit',
      icon: Shield,
    },
  ];

  const roleLabel = role === 'admin' ? 'Admin' : role === 'manager' ? 'Manager' : 'Member';

  return (
    <div className="min-h-screen w-screen bg-[#ECEFEA] flex flex-col justify-between p-2 sm:p-4 lg:p-6 font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white overflow-x-hidden relative">
      
      {/* Top Right Outer Decorative Label (Matching Reference Screenshot) */}
      <div className="hidden lg:flex justify-end max-w-[1520px] mx-auto w-full px-4 pt-1 pb-2">
        <span className="text-xs font-semibold text-slate-500 tracking-tight">
          Analytics Dashboard
        </span>
      </div>

      {/* MASTER FLOATING APPLICATION SHELL (ZIXO / Juice Lab Master Frame) */}
      <div className="max-w-[1520px] mx-auto w-full flex-1 bg-[#FDFEFE] rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] border border-white/90 shadow-[0_25px_60px_-15px_rgba(26,38,32,0.12),0_0_0_1px_rgba(225,233,228,0.8)] flex flex-col lg:flex-row overflow-hidden min-h-[860px]">
        
        {/* MOBILE TOP BAR (Only on small viewports) */}
        <div className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-100 shrink-0 z-40">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              2IXO
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
              Ryzen Matrix
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* LEFT COMPACT SIDEBAR */}
        <aside
          className={`fixed lg:static top-0 left-0 h-full w-[260px] sm:w-[280px] bg-white lg:bg-transparent border-r border-[#EEF2EF] flex flex-col justify-between p-5 lg:p-6 z-50 transition-all duration-300 shrink-0 select-none overflow-y-auto no-scrollbar ${
            isMobileMenuOpen
              ? 'translate-x-0 shadow-2xl bg-white'
              : '-translate-x-full lg:translate-x-0'
          } ${isSidebarCollapsed ? 'lg:w-[88px] lg:p-3.5' : ''}`}
        >
          <div className="space-y-5">
            {/* Top Brand & Collapse Toggle */}
            <div className="flex items-center justify-between pt-1">
              <NavLink
                to="/overview"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 group"
                title="Ryzen Matrix / Zixo"
              >
                {!isSidebarCollapsed ? (
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-2xl tracking-tighter text-slate-900 leading-none">
                      2IXO
                    </span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-sm shadow-md">
                    2I
                  </div>
                )}
              </NavLink>

              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            </div>

            {/* Search Pill Bar */}
            {!isSidebarCollapsed && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-2xl bg-[#F6F8F7] border border-transparent hover:border-slate-200 focus:border-slate-300 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition"
                />
              </div>
            )}

            {/* 2-Column Navigation Tiles (Matching Reference 1:1) */}
            <div className={`grid gap-2.5 ${isSidebarCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {navTiles.map((tile) => {
                const Icon = tile.icon;
                const isActive = location.pathname === tile.to || (tile.to !== '/overview' && location.pathname.startsWith(tile.to));
                return (
                  <NavLink
                    key={tile.to}
                    to={tile.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                      isActive
                        ? 'bg-[#242628] text-white shadow-md shadow-slate-900/10'
                        : 'bg-[#F6F8F7] hover:bg-[#EDF2EF] text-slate-700 hover:text-slate-900'
                    }`}
                    title={tile.sublabel || tile.label}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 stroke-[1.9] ${isActive ? 'text-white' : 'text-slate-700'}`} />
                    {!isSidebarCollapsed && (
                      <span className={`text-[11px] font-bold tracking-tight leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                        {tile.label}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Lower Utility Actions List */}
            {!isSidebarCollapsed && (
              <div className="pt-2 space-y-1">
                {utilityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#F6F8F7] text-xs font-semibold transition group"
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition shrink-0 stroke-[1.8]" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Pro AI Box & Sign Out */}
          <div className="pt-6 space-y-3">
            {!isSidebarCollapsed ? (
              <div
                onClick={() => navigate('/recovery')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF9F6] to-[#FFF0EA] border border-[#FFE2D6] shadow-2xs cursor-pointer hover:shadow-xs transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    Pro <Sparkles className="w-3 h-3 text-[#FF5E2B]" />
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Everything you need for smart project intelligence.
                </p>
              </div>
            ) : null}

            {/* Logout Row */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN APPLICATION CANVAS */}
        <main className="flex-1 bg-white overflow-y-auto min-w-0 h-full p-5 sm:p-7 lg:p-9 relative">
          <Outlet />
        </main>

      </div>

      {/* Bottom Left Outer Decorative Wordmark (Matching Reference Screenshot) */}
      <div className="hidden lg:flex justify-start max-w-[1520px] mx-auto w-full px-4 pt-2 pb-1">
        <span className="text-xs font-black text-slate-500 tracking-tight">
          Juice Lab &bull; Ryzen Matrix
        </span>
      </div>

      {/* Floating RebalanceX Assistant */}
      <RebalanceXAssistant />

      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}
