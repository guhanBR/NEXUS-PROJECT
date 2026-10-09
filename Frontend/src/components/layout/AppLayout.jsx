import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  Compass,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { NewProjectModal } from '../modals/NewProjectModal';
import { RebalanceXAssistant } from '../assistant/RebalanceXAssistant';

export function AppLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Vertical Icon Navigation Stack (Matching Mockup 1:1)
  const navItems = [
    { to: '/overview', label: 'Overview', icon: LayoutGrid },
    { to: role === 'member' ? '/member/my-tasks' : '/team-formation', label: 'Assets & Workforce', icon: Wallet },
    { to: '/progress-monitor', label: 'Analytics & Monitor', icon: BarChart2 },
    { to: '/recovery', label: 'Scenario Lab', icon: Box },
    { to: '/messages', label: 'Direct Messages', icon: Users },
  ];

  return (
    <div className="min-h-screen w-full bg-[#E5EFFB] flex items-center justify-center p-2 sm:p-4 lg:p-6 font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white relative">
      
      {/* MASTER OUTER SHELL: Dark Charcoal Matte Frame with Large Rounded Corners */}
      <div className="w-full max-w-[1550px] min-h-[calc(100vh-2rem)] bg-[#191A1E] rounded-[36px] sm:rounded-[42px] p-2.5 sm:p-4 lg:p-5 shadow-2xl flex flex-col lg:flex-row relative overflow-hidden border border-[#2B2D33]">
        
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between p-3 text-white border-b border-white/10 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF8E7] text-slate-950 flex items-center justify-center font-black text-sm shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Ryzen Matrix
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-white/10 text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* LEFT VERTICAL SLIM SIDEBAR (Matching Reference 1:1) */}
        <aside
          className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-20 bg-[#191A1E] lg:bg-transparent flex flex-col justify-between items-center py-2 lg:py-3 z-40 transition-transform duration-300 shrink-0 ${
            isMobileMenuOpen ? 'translate-x-0 shadow-2xl p-4' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Top Logo: Butter / Cream Squircle with Dark Icon */}
          <div className="flex flex-col items-center">
            <NavLink
              to="/"
              className="w-12 h-12 rounded-2xl bg-[#FFF8E7] text-slate-950 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              title="Ryzen Matrix Home"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="w-4 h-1.5 bg-slate-950 rounded-xs mb-0.5" />
                <div className="w-4 h-1.5 bg-slate-950 rounded-xs mb-0.5" />
                <div className="w-4 h-1.5 bg-slate-950 rounded-xs" />
              </div>
            </NavLink>
          </div>

          {/* Middle Navigation Icons Stack */}
          <div className="flex flex-col items-center gap-4 my-auto py-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-white/15 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`
                  }
                  title={item.label}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </NavLink>
              );
            })}

            {/* Quick Access to Project Rooms */}
            <NavLink
              to="/project-rooms"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-white/15 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`
              }
              title="Project Rooms"
            >
              <Hash className="w-5 h-5 stroke-[1.8]" />
            </NavLink>
          </div>

          {/* Bottom Logout Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleLogout}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Sign out"
            >
              <LogOut className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE CANVAS: Huge White Card with Large Rounded Corners */}
        <main className="flex-1 bg-white rounded-[28px] sm:rounded-[34px] p-5 sm:p-7 lg:p-8 overflow-y-auto min-w-0 shadow-inner-xs min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Floating Project Assistant */}
      <RebalanceXAssistant />

      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}
