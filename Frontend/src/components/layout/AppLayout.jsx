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

  // 6 Squircle Navigation Tiles (Matching 2IXO Reference 2x3 Grid)
  const squircleTiles = [
    { to: '/overview', label: 'Home', icon: LayoutDashboard },
    { to: '/team-formation', label: 'Cards', icon: CreditCard },
    { to: role === 'member' ? '/member/my-tasks' : '/admin/task-planning', label: 'Analytics', icon: CalendarDays },
    { to: '/recovery', label: 'Transfers', icon: ArrowLeftRight },
    { to: '/crisis-simulator', label: 'Swap Coins', icon: Repeat },
    { to: '/decision-audit', label: 'Payments', icon: Receipt },
  ];

  // Secondary Vertical Settings & Directory Links
  const secondaryLinks = [
    { to: '/task-planning', label: 'Freeze Card', icon: Snowflake },
    { to: '/settings', label: 'Set Spending Limit', icon: Clock },
    { to: '/settings', label: 'View Card PIN', icon: Key },
    { to: '/projects', label: 'Manage Subscriptions', icon: Layers },
    { to: '/settings', label: 'Security Settings', icon: Shield },
  ];

  return (
    <div className="workspace-canvas min-h-screen p-3 sm:p-6 lg:p-8 flex flex-col font-sans text-slate-900 selection:bg-slate-900 selection:text-white relative">
      
      {/* Top Right Ambient Label (Matching Juice Lab Reference) */}
      <div className="hidden lg:flex justify-end max-w-7xl mx-auto w-full pb-3 px-3">
        <span className="text-xs font-bold text-slate-500 tracking-wide">
          Analytics Dashboard
        </span>
      </div>

      {/* Master Floating Frame Container (White Rounded-3xl Shell) */}
      <div className="dashboard-frame flex-1 flex flex-col lg:flex-row overflow-hidden shadow-2xl relative max-w-7xl mx-auto w-full">
        
        {/* Mobile Header Bar */}
        <div className="lg:hidden bg-white px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="font-extrabold text-xl text-slate-900 tracking-tighter">2IXO</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">RebalanceX</span>
          </NavLink>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* LEFT SIDEBAR - 100% Matching 2IXO Squircle Tile Grid */}
        <aside
          className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-64 bg-[#F8FAF9] border-r border-[#EAEFEA] flex flex-col justify-between p-4 sm:p-5 z-40 transition-transform duration-300 ease-in-out shrink-0 ${
            isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-4 overflow-y-auto pr-0.5">
            {/* Top Brand Header (2IXO Logo & Layout Divider Button) */}
            <div className="flex items-center justify-between px-1 pt-1">
              <NavLink to="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-black tracking-tighter text-slate-900 block leading-none font-mono">
                  2IXO
                </span>
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

            {/* 2x3 Squircle Tile Navigation Grid (Exact Match to Reference) */}
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

            {/* Secondary Vertical Navigation Menu (Exact Match to Reference) */}
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

          {/* Bottom Pro Floating Card (Exact Match to Juice Lab Reference) */}
          <div className="mt-4 pt-3 border-t border-[#EAEFEA] space-y-2">
            <div className="p-3 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-pink-50/60 rounded-2xl border border-amber-200/70 shadow-2xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                  <span>Pro 🚀</span>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                  Everything you need for smart personal finance.
                </p>
              </div>
              <div className="w-6 h-6 rounded-lg bg-white/80 border border-amber-200 flex items-center justify-center text-amber-500 shadow-2xs">
                ✨
              </div>
            </div>

            {/* Logout / User Info */}
            <div className="flex items-center justify-between px-1 pt-1 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{role || 'user'}</span>
              <button
                onClick={handleLogout}
                className="text-[11px] font-bold text-slate-500 hover:text-red-700 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE VIEWPORT */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF] overflow-y-auto">
          {/* TOP HEADER BAR (Exact Match to Reference Greeting & Pill Actions) */}
          <header className="px-6 sm:px-8 py-5 bg-white border-b border-[#F0F4F1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30">
            {/* Left: Good Morning, Alvie + Date */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Good Morning, {user?.name?.split(' ')[0] || 'Alvie'}
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Friday, 15 July 2026
              </p>
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

      {/* Bottom Left Ambient Label (Matching Juice Lab Reference) */}
      <div className="hidden lg:flex justify-start max-w-7xl mx-auto w-full pt-3 px-3">
        <span className="text-xs font-bold text-slate-500 tracking-wide">
          Juice Lab
        </span>
      </div>

      {/* Floating Project-Aware Assistant Chatbot */}
      <RebalanceXAssistant />

      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}
