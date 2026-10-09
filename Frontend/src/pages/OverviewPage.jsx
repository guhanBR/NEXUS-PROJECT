import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  CalendarDays,
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Award,
  Clock,
  Zap,
} from 'lucide-react';

export function OverviewPage() {
  const { activeProject, projects } = useProject();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState('This Sprint');

  // 4 Core Workflow Step Cards (Matching Attached Screenshot 1:1)
  const workflowSteps = [
    {
      step: '01',
      title: 'Build team',
      description: 'Match skills & availability',
      icon: Users,
      link: role === 'member' ? '/member/my-tasks' : '/team-formation',
    },
    {
      step: '02',
      title: 'Plan work',
      description: 'CPM schedule & dep...',
      icon: CalendarDays,
      link: '/progress-monitor',
    },
    {
      step: '03',
      title: 'Test changes',
      description: 'Simulate what-if disr...',
      icon: Sliders,
      link: '/recovery',
    },
    {
      step: '04',
      title: 'Review recovery',
      description: 'Inspect diff & approv...',
      icon: CheckCircle2,
      link: '/recovery',
    },
  ];

  // 4-Column Metric Summary Cards
  const summaries = [
    {
      label: 'Portfolio Capacity',
      value: '160 hrs/wk',
      subvalue: '₹ 14,85,640.00',
      change: '+ 6.3%',
      isPositive: true,
      sparkline: 'M0 15 Q 10 5, 20 12 T 40 4 T 60 14 T 80 6',
    },
    {
      label: 'Active Deliverables',
      value: '14 Tasks',
      subvalue: 'In Progress',
      change: '+ 7.1%',
      isPositive: true,
      sparkline: 'M0 16 Q 12 18, 24 10 T 48 6 T 70 8 T 80 4',
    },
    {
      label: 'Critical Path Slack',
      value: '0 Bottlenecks',
      subvalue: 'On Schedule',
      change: '- 5.7%',
      isPositive: true,
      sparkline: 'M0 6 Q 14 8, 28 14 T 52 10 T 70 16 T 80 14',
    },
    {
      label: 'Recovery Readiness',
      value: '98.5% Score',
      subvalue: 'Optimal Match',
      change: '+ 5.2%',
      isPositive: true,
      sparkline: 'M0 14 Q 10 12, 20 6 T 45 10 T 65 4 T 80 2',
    },
  ];

  // Symmetrical Histogram Tower Data
  const histogramMonths = [
    { name: 'Sprint 1', height: '28%' },
    { name: 'Sprint 2', height: '48%' },
    { name: 'Sprint 3', height: '70%' },
    { name: 'Sprint 4', height: '100%', isCenter: true },
    { name: 'Sprint 5', height: '62%' },
    { name: 'Sprint 6', height: '42%' },
    { name: 'Sprint 7', height: '24%' },
  ];

  // Recent Activity Records
  const transactions = [
    {
      id: 't-1',
      title: 'Tata Core DB Connection Pool',
      subtitle: 'Backend Architecture • Day 4 Milestone',
      amount: '+ 6.0 hrs',
      type: 'Delivered',
      isPositive: true,
      iconBg: 'bg-[#00704A]',
      iconText: '✓',
    },
    {
      id: 't-2',
      title: 'RBAC Security Policy Audit',
      subtitle: 'Governance Scope • NPCI Compliance',
      amount: 'Day 6 Target',
      type: 'In Progress',
      isPositive: true,
      iconBg: 'bg-[#1C2420]',
      iconText: '⚡',
    },
    {
      id: 't-3',
      title: 'Polygon Web3 Gateway SDK',
      subtitle: 'Full Stack Deliverable • Day 8',
      amount: '4 Tasks Queued',
      type: 'Scheduled',
      isPositive: false,
      iconBg: 'bg-[#7B3FE4]',
      iconText: '⬡',
    },
    {
      id: 't-4',
      title: 'Sprint 4 CPM Critical Path Sync',
      subtitle: 'Optimizer Simulation • Least Churn',
      amount: '98% Match',
      type: 'Verified',
      isPositive: true,
      iconBg: 'bg-[#059669]',
      iconText: '★',
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
      
      {/* 1. HERO SECTION (Matching Attached Reference Image 1:1) */}
      <div className="landing-canvas rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/20 shadow-xl relative overflow-hidden text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Descriptor, Serif Headline, CTA, and 4 Workflow Tiles */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Feature Pill Descriptor */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F1C16]/70 border border-white/25 text-xs font-medium text-slate-100 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Team Matching &amp; Autonomous Resource Rebalancing</span>
            </div>

            {/* Editorial Serif Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white font-editorial leading-[1.18] drop-shadow-sm">
              Build the right team. <br />
              <span className="italic font-medium text-amber-200">Keep projects on track.</span>
            </h1>

            {/* Supporting Explanation */}
            <p className="text-xs sm:text-sm text-slate-100/90 max-w-md leading-relaxed font-sans font-normal">
              Match talent to workloads and recover instantly when plans change.
            </p>

            {/* Primary Hero CTA Button with Dark Circular Icon */}
            <div className="pt-1">
              <button
                onClick={() => navigate('/recovery')}
                className="hero-cta-btn group"
                aria-label="Launch RebalanceX Critical Path Engine"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1C2420] text-amber-300 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 pr-1">
                  Launch Recovery Engine
                </span>
              </button>
            </div>

            {/* 4 Frosted Glass Workflow Step Tiles */}
            <div className="pt-4 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {workflowSteps.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.step}
                      className="workflow-tile p-3 flex flex-col justify-between min-h-[90px] cursor-pointer hover:border-amber-300/60"
                      onClick={() => navigate(item.link)}
                      title={`Go to ${item.title}`}
                    >
                      <div className="flex items-center justify-between text-white">
                        <Icon className="w-4 h-4 text-amber-300 stroke-[2.2]" />
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-white tracking-wide truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-200 mt-0.5 leading-tight truncate">{item.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step numbers below tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-1 text-[11px] font-mono font-bold text-amber-300/80">
                <div>01</div>
                <div>02</div>
                <div>03</div>
                <div>04</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Autonomous Optimizer & Critical Path HUD Card (Replaces static image) */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="w-full bg-[#0D1813]/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl space-y-3.5 text-white">
              
              {/* Header: Engine Status & Active Project */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 font-mono">
                    Engine Active &bull; CPM Matrix
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-amber-200 border border-white/10">
                  {activeProject?.code || 'PRJ-2026'}
                </span>
              </div>

              {/* Active Project Title & Optimization Score */}
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-300 font-medium">Active Autonomous Context</div>
                <div className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {activeProject?.name || 'Enterprise Core Banking Migration'}
                </div>
              </div>

              {/* Live Metric Badges Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
                  <div className="text-[10px] text-slate-300 uppercase font-semibold">Critical Path Slack</div>
                  <div className="text-base font-black text-amber-300 font-tabular">0.0 Days</div>
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span>✓ On Optimal Track</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
                  <div className="text-[10px] text-slate-300 uppercase font-semibold">Resource Alignment</div>
                  <div className="text-base font-black text-emerald-300 font-tabular">98.5%</div>
                  <div className="text-[10px] text-slate-300 font-medium">
                    <span>Zero skill gaps</span>
                  </div>
                </div>
              </div>

              {/* Live Critical Path Pipeline Nodes */}
              <div className="p-2.5 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold">
                  <span>Schedule Dependency Graph</span>
                  <span className="text-amber-300 font-mono text-[10px]">4 Nodes</span>
                </div>

                {/* Node Pipeline Flow */}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-center font-bold">
                    Setup
                  </div>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/40 to-amber-500/40 mx-1" />
                  <div className="px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-200 border border-amber-400/40 text-center font-bold ring-1 ring-amber-400/40">
                    CPM-Crit
                  </div>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/40 to-emerald-500/40 mx-1" />
                  <div className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-center font-bold">
                    Verify
                  </div>
                  <div className="h-[1px] flex-1 bg-emerald-500/30 mx-1" />
                  <div className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/10 text-center">
                    Ship
                  </div>
                </div>
              </div>
              {/* Interactive Quick Simulation Action Buttons */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/recovery')}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                  <span>Run Scenario Test</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/progress-monitor')}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition flex items-center justify-center gap-1"
                >
                  <span>Gantt Chart</span>
                  <ArrowRight className="w-3 h-3 text-amber-200" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 2. 4-COLUMN SUMMARY FROSTED GLASS STRIP */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DCE4DF] shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        {summaries.map((item, idx) => (
          <div key={item.label} className={`flex items-center justify-between ${idx > 0 ? 'sm:pl-5 pt-2 sm:pt-0' : ''}`}>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                {item.label}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {item.value}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {item.change}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                {item.subvalue}
              </span>
            </div>

            {/* Sparkline */}
            <div className="w-14 h-7 text-emerald-600 shrink-0">
              <svg viewBox="0 0 80 20" className="w-full h-full overflow-visible">
                <path
                  d={item.sparkline}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* 3. MAIN EVIDENCE AREA (Workload Histogram + Capacity Arc + Spline Trend + Task Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN (5-Cols): Workload & Symmetrical Histogram Tower */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#DCE4DF] shadow-xs flex flex-col justify-between min-h-[390px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Workload Allocation
            </span>

            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700">
              <span>{selectedMonth}</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </div>
          </div>

          <div className="text-center py-2">
            <span className="text-xs font-semibold text-slate-500 block">
              Planned Capacity
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 block">
              160<span className="text-slate-400 text-lg"> hrs/wk</span>
            </span>
          </div>

          {/* Symmetrical Vertical Histogram Tower */}
          <div className="relative my-2 py-2 flex items-center justify-between px-2 sm:px-4 h-36">
            <div className="absolute left-1/2 top-1 -translate-x-1/2 text-[9px] font-mono font-bold text-slate-700">
              40h Capacity
            </div>

            <div className="absolute left-1/2 bottom-1 -translate-x-1/2 text-[9px] font-mono font-bold text-amber-600">
              38h Delivered
            </div>

            {histogramMonths.map((m) => {
              if (m.isCenter) {
                return (
                  <div key={m.name} className="flex flex-col items-center justify-center h-full relative z-10">
                    <div className="w-5 sm:w-7 h-14 bg-[#1C2420] rounded-t-xs flex items-center justify-center space-x-[2px] overflow-hidden p-0.5 shadow-sm">
                      <div className="w-1 h-full bg-white/30" />
                      <div className="w-1 h-full bg-white/30" />
                      <div className="w-1 h-full bg-white/30" />
                    </div>

                    <span className="text-[10px] font-bold text-slate-950 my-0.5">
                      {m.name}
                    </span>

                    <div className="w-5 sm:w-7 h-14 bg-amber-500 rounded-b-xs flex items-center justify-center space-x-[2px] overflow-hidden p-0.5 shadow-sm">
                      <div className="w-1 h-full bg-white/30" />
                      <div className="w-1 h-full bg-white/30" />
                      <div className="w-1 h-full bg-white/30" />
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.name} className="flex flex-col items-center justify-center h-full">
                  <div
                    className="w-3.5 sm:w-5 bg-slate-200 rounded-t-xs transition-all"
                    style={{ height: m.height }}
                  />

                  <span className="text-[9px] font-semibold text-slate-400 my-0.5">
                    {m.name}
                  </span>

                  <div
                    className="w-3.5 sm:w-5 bg-slate-200 rounded-b-xs transition-all"
                    style={{ height: m.height }}
                  />
                </div>
              );
            })}
          </div>

          <div className="text-center py-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block">
              Delivered Velocity
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 block">
              142<span className="text-slate-400 text-lg"> hrs (88.7%)</span>
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN (7-Cols): Capacity Gauge + Milestone Spline + Recent Tasks */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Box 1: Sprint Capacity Breakdown (Gauge Arc) */}
            <div className="bg-white rounded-2xl p-4 border border-[#DCE4DF] shadow-xs flex flex-col justify-between min-h-[180px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Sprint Workload Breakdown
                </span>
                <button
                  onClick={() => navigate('/progress-monitor')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-0.5 pt-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-[#1C2420]" />
                  <span>Core Engineering (56.07%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span>QA &amp; Security Verification (47.93%)</span>
                </div>
              </div>

              {/* Gauge Arc */}
              <div className="relative h-16 flex items-center justify-center my-1">
                <svg viewBox="0 0 160 80" className="w-36 h-16 overflow-visible">
                  <path
                    d="M 10 75 A 70 70 0 0 1 150 75"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 75 A 70 70 0 0 1 120 22"
                    fill="none"
                    stroke="#1C2420"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">▲ 56.07%</span>
                  <span>Engineering velocity</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-600 block text-xs">▲ 47.93%</span>
                  <span>Testing coverage</span>
                </div>
              </div>
            </div>

            {/* Box 2: Milestone Frequency Trend (Sinusoidal Spline Waves) */}
            <div className="bg-white rounded-2xl p-4 border border-[#DCE4DF] shadow-xs flex flex-col justify-between min-h-[180px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    Milestone Trajectory
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-[#1C2420] text-amber-300 text-[9px] font-bold">
                    +8.2% CPM
                  </span>
                </div>
                <button
                  onClick={() => navigate('/progress-monitor')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Overlapping Waves */}
              <div className="relative h-18 my-1 flex items-center justify-center">
                <svg viewBox="0 0 240 70" className="w-full h-full overflow-visible">
                  <path
                    d="M 0 50 Q 30 15, 60 50 T 120 50 T 180 50 T 240 50"
                    fill="none"
                    stroke="#1C2420"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 30 Q 30 65, 60 30 T 120 30 T 180 30 T 240 30"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 40 Q 40 10, 80 40 T 160 40 T 240 40"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <line x1="195" y1="10" x2="195" y2="65" stroke="#1C2420" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="195" cy="30" r="3.5" fill="#F59E0B" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100">
                {['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6'].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Row: Recent Project Task Deliverables Stream */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DCE4DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Task Deliverables &amp; Decisions
              </span>

              <button
                onClick={() => navigate('/performance-allocation')}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition"
              >
                View All Deliverables
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-xl ${t.iconBg} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}>
                      {t.iconText}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {t.title}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {t.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {t.amount}
                    </div>
                    <span
                      className={`text-[9px] font-bold ${
                        t.isPositive ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {t.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
