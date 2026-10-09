import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Gauge,
  GitCommit,
  ShieldCheck,
  Sparkles,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Search,
  SlidersHorizontal,
  Zap,
  Activity,
  CreditCard,
} from 'lucide-react';
import { AddTaskModal } from '../components/modals/AddTaskModal';

export function OverviewPage() {
  const { activeProject, isProjectLoading, activeProposal } = useProject();
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('This Month');

  if (isProjectLoading || !activeProject) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-500">
        Loading project intelligence briefing...
      </div>
    );
  }

  const sm = activeProject.schedule_metrics || {};
  const tasks = activeProject.tasks || [];
  const teamMembers = activeProject.team_members || [];
  const critIds = new Set(sm.critical_path_task_ids || []);
  const critTasks = tasks.filter((t) => critIds.has(t.id));

  const projectDuration = sm.project_duration_days || 28;
  const deadlineDays = activeProject.deadline_days || 30;
  const totalHours = tasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0) || 144;
  const isOverDeadline = projectDuration > deadlineDays;

  // 4 Layered Milestones for the Fanned 3D Deck (Matching Card Reference Deck)
  const milestoneCards = [
    {
      id: 1,
      type: 'Platinum Milestone',
      label: 'Core Architecture',
      duration: '8 Days',
      skills: 'Python, Docker',
      status: 'Completed',
      offsetClass: 'translate-x-0 rotate-[-8deg] z-10 opacity-70 scale-90',
      bgClass: 'from-slate-200 to-slate-300 text-slate-800',
    },
    {
      id: 2,
      type: 'Debit Deliverable',
      label: 'AI Constraint Solver',
      duration: '14 Days',
      skills: 'Optimization, FastAPI',
      status: 'On Track',
      offsetClass: 'translate-x-8 rotate-[-4deg] z-20 opacity-85 scale-95',
      bgClass: 'from-amber-100 to-orange-100 text-amber-950',
    },
    {
      id: 3,
      type: 'G-Pay Sprint',
      label: 'Zero-Slack CPM Engine',
      duration: '6 Days',
      skills: 'React, Analytics',
      status: 'In Progress',
      offsetClass: 'translate-x-16 rotate-[0deg] z-30 opacity-100 scale-100 ring-2 ring-white/80 shadow-2xl',
      bgClass: 'from-emerald-50 via-teal-50 to-white text-slate-900',
    },
    {
      id: 4,
      type: 'Silver Card',
      label: 'Autonomous Rebalance',
      duration: '28 Days Target',
      skills: 'Governance & Recovery',
      status: 'Pending Gate',
      offsetClass: 'translate-x-24 rotate-[4deg] z-10 opacity-75 scale-90',
      bgClass: 'from-slate-100 to-slate-200 text-slate-700',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HERO SPOTLIGHT: FANNED-OUT 3D CARD DECK & FLOATING STATS RIBBON */}
      <div className="relative pt-4 pb-2 px-2 overflow-hidden">
        {/* Fanned Layered Cards Display */}
        <div className="flex justify-center items-center h-48 sm:h-56 relative max-w-2xl mx-auto mb-4">
          {milestoneCards.map((card, idx) => (
            <div
              key={card.id}
              className={`absolute w-64 sm:w-72 h-36 sm:h-44 p-4 rounded-3xl border border-white/60 bg-gradient-to-br ${card.bgClass} shadow-xl flex flex-col justify-between transition-all duration-300 ${card.offsetClass}`}
              style={{
                boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.12), 0 0 1px 1px rgba(255, 255, 255, 0.8)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {card.type}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/70 text-slate-800 backdrop-blur-xs border border-white/60">
                  {card.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                  {card.label}
                </h3>
                <p className="text-[10px] text-slate-600 font-medium mt-0.5">
                  {card.skills}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-2 border-t border-black/5">
                <span className="font-tabular">{card.duration}</span>
                <span className="text-[10px] text-slate-500 font-mono">ID #0{card.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Translucent Stat Metric Ribbon (Matching Reference Overlay Strip) */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#E2E8E4] p-4 sm:p-5 shadow-lg grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stat 1: Total Duration */}
          <div className="p-2 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Project Duration
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold font-tabular text-slate-900">
                {projectDuration} Days
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300">
                ▲ +6.3%
              </span>
            </div>
            {/* Mini SVG Sparkline */}
            <svg className="w-full h-4 stroke-slate-800 fill-none" viewBox="0 0 100 20">
              <path d="M0 15 L20 12 L40 18 L60 8 L80 14 L100 5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Stat 2: Total Effort */}
          <div className="p-2 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Total Planned Effort
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold font-tabular text-slate-900">
                {totalHours} hrs
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300">
                ▲ +7.1%
              </span>
            </div>
            <svg className="w-full h-4 stroke-slate-800 fill-none" viewBox="0 0 100 20">
              <path d="M0 18 L25 10 L45 15 L70 5 L85 11 L100 2" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Stat 3: Risk / Slack */}
          <div className="p-2 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Critical Slack
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold font-tabular text-slate-900">
                0.0 Days
              </span>
              <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded-full border border-red-300">
                ▼ -5.7%
              </span>
            </div>
            <svg className="w-full h-4 stroke-slate-800 fill-none" viewBox="0 0 100 20">
              <path d="M0 8 L20 14 L40 6 L65 16 L85 10 L100 12" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Stat 4: Solver Confidence */}
          <div className="p-2 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Solver Confidence
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold font-tabular text-emerald-800">
                98.4%
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300">
                ▲ +5.2%
              </span>
            </div>
            <svg className="w-full h-4 stroke-emerald-700 fill-none" viewBox="0 0 100 20">
              <path d="M0 16 L30 12 L50 8 L75 11 L90 4 L100 2" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. MAIN VISUAL GRID (BIPOLAR HISTOGRAM + ARC GAUGE + SINE SPLINE + TRANSACTIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT 5-COL: BIPOLAR MIRRORED WORKLOAD HISTOGRAM (My Income / My Expenses Reference) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E2E8E4] p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Deliverable Velocity
              </span>
              <h3 className="text-sm font-bold text-slate-900">Workload Allocation</h3>
            </div>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none"
            >
              <option>This Month</option>
              <option>Sprint Cycle</option>
              <option>Full Baseline</option>
            </select>
          </div>

          {/* Center Bipolar Mirrored Bars */}
          <div className="text-center space-y-4 my-auto">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Planned Effort</div>
              <div className="text-3xl sm:text-4xl font-extrabold font-tabular text-slate-900 tracking-tight mt-0.5">
                {totalHours}.0 hrs
              </div>
            </div>

            {/* Symmetrical Mirrored Bar Chart SVG */}
            <div className="relative py-2 px-4 flex items-center justify-center">
              <svg className="w-full h-40 max-w-xs" viewBox="0 0 240 160">
                {/* Horizontal Center Axis */}
                <line x1="10" y1="80" x2="230" y2="80" stroke="#E2E8E4" strokeWidth="1" strokeDasharray="3 3" />

                {/* Mirrored Bars */}
                {/* Jan */}
                <rect x="20" y="55" width="12" height="25" fill="#E2E8E4" rx="3" />
                <rect x="20" y="80" width="12" height="25" fill="#E2E8E4" rx="3" />

                {/* Feb */}
                <rect x="50" y="45" width="12" height="35" fill="#CBD5E1" rx="3" />
                <rect x="50" y="80" width="12" height="35" fill="#CBD5E1" rx="3" />

                {/* Mar */}
                <rect x="80" y="30" width="12" height="50" fill="#94A3B8" rx="3" />
                <rect x="80" y="80" width="12" height="50" fill="#94A3B8" rx="3" />

                {/* Apr (Highlighted Center Peak) */}
                <rect x="110" y="10" width="20" height="70" fill="#18211D" rx="4" />
                <rect x="110" y="80" width="20" height="70" fill="#EF4444" rx="4" opacity="0.85" />
                <text x="135" y="25" fontSize="9" fill="#0F172A" fontWeight="bold">40.0h peak</text>
                <text x="135" y="145" fontSize="9" fill="#EF4444" fontWeight="bold">Crit Path</text>

                {/* May */}
                <rect x="145" y="35" width="12" height="45" fill="#94A3B8" rx="3" />
                <rect x="145" y="80" width="12" height="45" fill="#94A3B8" rx="3" />

                {/* Jun */}
                <rect x="175" y="50" width="12" height="30" fill="#CBD5E1" rx="3" />
                <rect x="175" y="80" width="12" height="30" fill="#CBD5E1" rx="3" />

                {/* Jul */}
                <rect x="205" y="60" width="12" height="20" fill="#E2E8E4" rx="3" />
                <rect x="205" y="80" width="12" height="20" fill="#E2E8E4" rx="3" />
              </svg>
            </div>

            {/* Labels under chart */}
            <div className="flex justify-between text-[10px] font-semibold text-slate-500 px-6">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span className="text-slate-900 font-bold">Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Zero-Slack Tasks</div>
              <div className="text-2xl font-bold font-tabular text-slate-900 mt-0.5">
                {critTasks.length} Critical Items
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 7-COL: SPLIT WIDGETS */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Row: Arc Gauge + Sine-Wave Spline Curves */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Widget 1: Arc Capacity Gauge (Weekly Spending Reference) */}
            <div className="bg-white rounded-3xl border border-[#E2E8E4] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Weekly Capacity</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Semi-Circular Gauge Meter */}
              <div className="relative py-2 flex flex-col items-center justify-center">
                <svg className="w-36 h-20" viewBox="0 0 100 55">
                  {/* Background Arc */}
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E8E4" strokeWidth="8" strokeLinecap="round" />
                  {/* Active Filled Arc */}
                  <path d="M 10 50 A 40 40 0 0 1 70 20" fill="none" stroke="#18211D" strokeWidth="8" strokeLinecap="round" />
                </svg>
                <div className="text-center -mt-3">
                  <span className="text-xl font-black font-tabular text-slate-900">56.07%</span>
                  <p className="text-[10px] text-slate-600 font-medium">Team Allocation</p>
                </div>
              </div>

              {/* Legend Breakdown Pills */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                <div className="p-1.5 bg-slate-50 rounded-xl">
                  <div className="font-bold text-slate-900">▲ 56.07%</div>
                  <div className="text-slate-600">Assigned Effort</div>
                </div>
                <div className="p-1.5 bg-slate-50 rounded-xl">
                  <div className="font-bold text-slate-900">▲ 43.93%</div>
                  <div className="text-slate-600">Buffer Reserve</div>
                </div>
              </div>
            </div>

            {/* Widget 2: Harmonic Multi-Wave Spline Chart (Monthly Overview Reference) */}
            <div className="bg-white rounded-3xl border border-[#E2E8E4] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Delivery Flow</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300">
                  +8.2%
                </span>
              </div>

              {/* Multi-Wave Sine Curve SVG */}
              <div className="relative py-2 flex items-center justify-center">
                <svg className="w-full h-24" viewBox="0 0 180 80">
                  {/* Wave 1 */}
                  <path
                    d="M 0 40 Q 45 10, 90 40 T 180 40"
                    fill="none"
                    stroke="#18211D"
                    strokeWidth="2"
                  />
                  {/* Wave 2 */}
                  <path
                    d="M 0 50 Q 45 70, 90 50 T 180 50"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  {/* Wave 3 (Accent) */}
                  <path
                    d="M 0 30 Q 45 60, 90 30 T 180 30"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                  {/* Marker Pin */}
                  <line x1="140" y1="10" x2="140" y2="70" stroke="#0F172A" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="140" cy="30" r="3.5" fill="#18211D" />
                </svg>
              </div>

              <div className="flex justify-between text-[9px] font-semibold text-slate-500 pt-1 border-t border-slate-100">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Live Governance & Audit Stream (Transactions Reference) */}
          <div className="bg-white rounded-3xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-900">Governance Stream</span>
                <span className="text-[10px] text-slate-600 block">Recent operations & autonomous adjustments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigate('/decision-audit')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition"
                >
                  View All &rarr;
                </button>
              </div>
            </div>

            {/* List of 4 Actions styled as Brand Badges (Starbucks, Netflix, Apple, Slack in reference) */}
            <div className="space-y-2">
              {/* Event 1: Team Formed */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xs shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Team Roster Optimization</div>
                    <div className="text-[10px] text-slate-500">Autonomous Talent Match &bull; Today</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800 font-tabular">+100% Match</span>
                  <span className="text-[10px] text-slate-600 block font-semibold">{teamMembers.length} Members</span>
                </div>
              </div>

              {/* Event 2: Schedule Synchronized */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Calendar className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">CPM Schedule Recalculation</div>
                    <div className="text-[10px] text-slate-500">Critical Path Zero-Slack &bull; Active</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 font-tabular">{projectDuration}d Baseline</span>
                  <span className="text-[10px] text-emerald-800 block font-semibold">On-Track</span>
                </div>
              </div>

              {/* Event 3: Outage Simulation */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-xs shadow-xs">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">What-If Outage Simulation</div>
                    <div className="text-[10px] text-slate-500">Developer Absence Testbed &bull; Safe</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 font-tabular">0d Delay</span>
                  <span className="text-[10px] text-amber-900 block font-semibold">Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAddTaskOpen && <AddTaskModal onClose={() => setIsAddTaskOpen(false)} />}
    </div>
  );
}
