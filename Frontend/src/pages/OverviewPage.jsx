import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  ChevronDown,
  Wifi,
} from 'lucide-react';

export function OverviewPage() {
  const { activeProject, isProjectLoading } = useProject();
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const [selectedRange, setSelectedRange] = useState('This Month');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. HERO SPOTLIGHT: 3D FANNED-OUT HORIZONTAL CARD DECK & FLOATING STATS RIBBON */}
      <div className="relative pt-2 pb-2 overflow-visible">
        
        {/* Fanned Layered Cards Stack (Exact Match to Juice Lab / 2IXO Reference) */}
        <div className="flex justify-center items-center h-48 sm:h-52 relative max-w-4xl mx-auto mb-2 select-none">
          
          {/* Card 1: Far Left - Platinum Card ($150/...) */}
          <div className="absolute left-4 sm:left-12 top-8 text-left z-0 hidden md:block">
            <span className="text-[11px] font-bold text-slate-700 block">Platinum Card</span>
            <span className="text-[10px] text-slate-400 font-mono block">$ 150 / ....</span>
          </div>

          {/* Card 2: Mid Left - Debit Card */}
          <div
            className="absolute w-52 sm:w-60 h-32 sm:h-36 p-3.5 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 border border-white/70 shadow-lg flex flex-col justify-between -translate-x-32 sm:-translate-x-44 -rotate-12 z-10 opacity-75 transition-transform hover:scale-105"
            style={{ boxShadow: '0 15px 30px -8px rgba(0,0,0,0.12)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-800">Debit Card</span>
              <div className="w-5 h-3.5 rounded bg-slate-400/40" />
            </div>
            <div className="w-6 h-4 rounded bg-amber-400/60" />
          </div>

          {/* Card 3: Center Left - Credit Card (Pearl White) */}
          <div
            className="absolute w-56 sm:w-64 h-36 sm:h-40 p-4 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-white/90 shadow-xl flex flex-col justify-between -translate-x-16 sm:-translate-x-20 -rotate-6 z-20 opacity-90 transition-transform hover:scale-105"
            style={{ boxShadow: '0 20px 35px -10px rgba(0,0,0,0.15)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Credit Card</span>
              <div className="flex -space-x-1">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400/70 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400/70 inline-block" />
              </div>
            </div>
            <div className="w-7 h-5 rounded bg-slate-300/60" />
          </div>

          {/* Card 4: CENTER FRONT - Credit Card with G Pay (Warm Gold / Champagne Metallic) */}
          <div
            className="absolute w-60 sm:w-72 h-38 sm:h-44 p-4 rounded-3xl bg-gradient-to-br from-[#F5EFE6] via-[#EFE7DA] to-[#E5DBCB] border border-white/95 shadow-2xl flex flex-col justify-between z-30 transition-transform hover:scale-105 cursor-pointer ring-1 ring-white"
            style={{
              boxShadow: '0 25px 45px -10px rgba(70, 50, 30, 0.20), 0 0 0 1px rgba(255,255,255,0.9)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Credit Card</span>
              <div className="flex items-center gap-1 font-bold text-xs text-slate-900">
                <span className="text-[11px] font-black">G Pay</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6">
              <div className="w-8 h-6 rounded-md bg-amber-600/20 border border-amber-600/30" />
              <Wifi className="w-4 h-4 text-slate-700 rotate-90" />
            </div>
          </div>

          {/* Card 5: Center Right - Credit Card with stripe */}
          <div
            className="absolute w-56 sm:w-64 h-36 sm:h-40 p-4 rounded-2xl bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-white/90 shadow-xl flex flex-col justify-between translate-x-16 sm:translate-x-20 rotate-6 z-20 opacity-90 transition-transform hover:scale-105"
            style={{ boxShadow: '0 20px 35px -10px rgba(0,0,0,0.15)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Credit Card</span>
              <span className="text-[11px] font-black text-slate-900 font-mono tracking-tighter">stripe</span>
            </div>
            <div className="w-7 h-5 rounded bg-slate-300/60 self-end" />
          </div>

          {/* Card 6: Mid Right - Credit Card with Apple Pay */}
          <div
            className="absolute w-52 sm:w-60 h-32 sm:h-36 p-3.5 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 border border-white/70 shadow-lg flex flex-col justify-between translate-x-32 sm:translate-x-44 rotate-12 z-10 opacity-75 transition-transform hover:scale-105"
            style={{ boxShadow: '0 15px 30px -8px rgba(0,0,0,0.12)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-800">Credit Card</span>
              <span className="text-[10px] font-bold text-slate-900"> Pay</span>
            </div>
            <div className="w-6 h-4 rounded bg-slate-400/40" />
          </div>

          {/* Far Right Label: Silver Card ($130/...) */}
          <div className="absolute right-4 sm:right-12 top-8 text-right z-0 hidden md:block">
            <span className="text-[11px] font-bold text-slate-700 block">Silver Card</span>
            <span className="text-[10px] text-slate-400 font-mono block">$ 130 / ....</span>
          </div>
        </div>

        {/* Floating Translucent Stat Ribbon Overlay (Exact Match to Reference) */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#E8EEEB] p-4 sm:p-5 shadow-lg grid grid-cols-2 md:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          
          {/* Stat 1: Total Balance */}
          <div className="px-3 py-1 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Balance
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xl sm:text-2xl font-black font-tabular text-slate-900">
                $5,465.00
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                ▲ 6.3%
              </span>
            </div>
            {/* Jagged Sparkline */}
            <svg className="w-full h-4 stroke-slate-800 fill-none" viewBox="0 0 100 20">
              <path d="M0 12 L15 8 L30 15 L45 5 L60 14 L75 7 L90 12 L100 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Stat 2: Total Income */}
          <div className="px-3 py-1 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Income
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xl sm:text-2xl font-black font-tabular text-slate-900">
                $8,395.00
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                ▲ 7.1%
              </span>
            </div>
            <svg className="w-full h-4 stroke-slate-800 fill-none" viewBox="0 0 100 20">
              <path d="M0 14 L20 6 L35 15 L55 4 L70 12 L85 6 L100 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Stat 3: Total Expenses */}
          <div className="px-3 py-1 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Expenses
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xl sm:text-2xl font-black font-tabular text-slate-900">
                $2,455.00
              </span>
              <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.2 rounded-full">
                ▼ 5.7%
              </span>
            </div>
            <svg className="w-full h-4 stroke-slate-800 fill-none" viewBox="0 0 100 20">
              <path d="M0 6 L20 14 L40 5 L60 16 L80 8 L100 13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Stat 4: Total Savings */}
          <div className="px-3 py-1 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Savings
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xl sm:text-2xl font-black font-tabular text-slate-900">
                $4,320.00
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                ▲ 5.2%
              </span>
            </div>
            <svg className="w-full h-4 stroke-slate-800 fill-none" viewBox="0 0 100 20">
              <path d="M0 15 L25 10 L45 16 L65 5 L85 11 L100 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. MAIN 4-WIDGET DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* WIDGET 1 (LEFT 5-COL): TOTAL INCOME & BIPOLAR MIRRORED HISTOGRAM */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8EEEB] p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">Total Income</h3>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 transition"
            >
              <span>{selectedRange}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>

          <div className="text-center space-y-4 my-auto">
            {/* Top Value */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Income</div>
              <div className="text-3xl sm:text-4xl font-black font-tabular text-slate-900 tracking-tight mt-0.5">
                $578,395<span className="text-slate-400 font-medium">.00</span>
              </div>
            </div>

            {/* Bipolar Mirrored Symmetrical Pinstripe Histogram */}
            <div className="relative py-2 px-2 flex items-center justify-center">
              <svg className="w-full h-44 max-w-sm" viewBox="0 0 260 170">
                {/* Jan Background Pinstripes */}
                <g opacity="0.35" fill="#CBD5E1">
                  <rect x="20" y="60" width="2" height="25" />
                  <rect x="25" y="55" width="2" height="30" />
                  <rect x="30" y="60" width="2" height="25" />
                  <rect x="20" y="85" width="2" height="25" />
                  <rect x="25" y="85" width="2" height="30" />
                  <rect x="30" y="85" width="2" height="25" />
                </g>

                {/* Feb Pinstripes */}
                <g opacity="0.45" fill="#CBD5E1">
                  <rect x="50" y="45" width="2" height="40" />
                  <rect x="55" y="40" width="2" height="45" />
                  <rect x="60" y="45" width="2" height="40" />
                  <rect x="50" y="85" width="2" height="40" />
                  <rect x="55" y="85" width="2" height="45" />
                  <rect x="60" y="85" width="2" height="40" />
                </g>

                {/* Mar Pinstripes */}
                <g opacity="0.6" fill="#94A3B8">
                  <rect x="80" y="30" width="2" height="55" />
                  <rect x="85" y="25" width="2" height="60" />
                  <rect x="90" y="30" width="2" height="55" />
                  <rect x="80" y="85" width="2" height="55" />
                  <rect x="85" y="85" width="2" height="60" />
                  <rect x="90" y="85" width="2" height="55" />
                </g>

                {/* Apr (CENTER HIGHLIGHTED DENSE PINSTRIPES) */}
                {/* Top Black Bars */}
                <g fill="#1C1F22">
                  <rect x="110" y="8" width="3" height="77" rx="1" />
                  <rect x="115" y="8" width="3" height="77" rx="1" />
                  <rect x="120" y="8" width="3" height="77" rx="1" />
                  <rect x="125" y="8" width="3" height="77" rx="1" />
                  <rect x="130" y="8" width="3" height="77" rx="1" />
                </g>
                <text x="140" y="22" fontSize="9" fill="#1C1F22" fontWeight="bold">$4,699.00</text>

                {/* Bottom Red / Salmon Bars */}
                <g fill="#F87171">
                  <rect x="110" y="88" width="3" height="77" rx="1" />
                  <rect x="115" y="88" width="3" height="77" rx="1" />
                  <rect x="120" y="88" width="3" height="77" rx="1" />
                  <rect x="125" y="88" width="3" height="77" rx="1" />
                  <rect x="130" y="88" width="3" height="77" rx="1" />
                </g>
                <text x="75" y="152" fontSize="9" fill="#EF4444" fontWeight="bold">$4,699.00</text>

                {/* May Pinstripes */}
                <g opacity="0.6" fill="#94A3B8">
                  <rect x="150" y="30" width="2" height="55" />
                  <rect x="155" y="25" width="2" height="60" />
                  <rect x="160" y="30" width="2" height="55" />
                  <rect x="150" y="85" width="2" height="55" />
                  <rect x="155" y="85" width="2" height="60" />
                  <rect x="160" y="85" width="2" height="55" />
                </g>

                {/* Jun Pinstripes */}
                <g opacity="0.45" fill="#CBD5E1">
                  <rect x="180" y="45" width="2" height="40" />
                  <rect x="185" y="40" width="2" height="45" />
                  <rect x="190" y="45" width="2" height="40" />
                  <rect x="180" y="85" width="2" height="40" />
                  <rect x="185" y="85" width="2" height="45" />
                  <rect x="190" y="85" width="2" height="40" />
                </g>

                {/* Jul Pinstripes */}
                <g opacity="0.35" fill="#CBD5E1">
                  <rect x="210" y="60" width="2" height="25" />
                  <rect x="215" y="55" width="2" height="30" />
                  <rect x="220" y="60" width="2" height="25" />
                  <rect x="210" y="85" width="2" height="25" />
                  <rect x="215" y="85" width="2" height="30" />
                  <rect x="220" y="85" width="2" height="25" />
                </g>
              </svg>
            </div>

            {/* Months Axis */}
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 px-4">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span className="text-slate-900 font-bold">Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>

            {/* Bottom Value */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Expenses</div>
              <div className="text-3xl sm:text-4xl font-black font-tabular text-slate-900 tracking-tight mt-0.5">
                $578,395<span className="text-slate-400 font-medium">.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 7-COL: SPLIT WIDGETS */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Top Row: Weekly Spending (Arc Gauge) + Monthly Overview (Sine Splines) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* WIDGET 2: WEEKLY SPENDING (ARC GAUGE) */}
            <div className="bg-white rounded-3xl border border-[#E8EEEB] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-900">Weekly Spending</span>
                <button
                  type="button"
                  className="w-6 h-6 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-900" /> Spending Breakdown</span>
                <span className="flex items-center gap-1 text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Shopping</span>
              </div>

              {/* Semi-Circular Arc Meter */}
              <div className="py-2 flex flex-col items-center justify-center">
                <svg className="w-40 h-22" viewBox="0 0 100 55">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#EAEFEA" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 65 15" fill="none" stroke="#1C1F22" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </div>

              {/* Footer Percentages */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                <div>
                  <div className="font-bold text-slate-900">▲ 56.07%</div>
                  <div className="text-slate-400">42% of total spend</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">▲ 47.93%</div>
                  <div className="text-slate-400">42% of total spend</div>
                </div>
              </div>
            </div>

            {/* WIDGET 3: MONTHLY OVERVIEW (SINE SPLINES) */}
            <div className="bg-white rounded-3xl border border-[#E8EEEB] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-900">Monthly Overview</span>
                <button
                  type="button"
                  className="w-6 h-6 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Harmonic Multi-Wave Spline SVG */}
              <div className="relative py-2 flex items-center justify-center">
                <svg className="w-full h-24" viewBox="0 0 200 80">
                  {/* Wave 1 */}
                  <path
                    d="M 0 45 Q 50 10, 100 45 T 200 45"
                    fill="none"
                    stroke="#1C1F22"
                    strokeWidth="1.75"
                  />
                  {/* Wave 2 */}
                  <path
                    d="M 0 55 Q 50 75, 100 55 T 200 55"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                  {/* Wave 3 */}
                  <path
                    d="M 0 35 Q 50 65, 100 35 T 200 35"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />

                  {/* Marker Pin on Jul */}
                  <line x1="160" y1="10" x2="160" y2="70" stroke="#1C1F22" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="160" cy="30" r="3.5" fill="#1C1F22" />
                </svg>

                {/* Marker Flag */}
                <div className="absolute top-2 right-6 bg-[#1C1F22] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                  +8.2%
                </div>
              </div>

              {/* Month Labels */}
              <div className="flex justify-between text-[9px] font-semibold text-slate-400 pt-1 border-t border-slate-100">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span className="text-slate-900 font-bold">Jul</span>
                <span>Aug</span>
              </div>
            </div>
          </div>

          {/* WIDGET 4 (BOTTOM ROW): TRANSACTIONS STREAM */}
          <div className="bg-white rounded-3xl border border-[#E8EEEB] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Transactions</span>
              <div className="flex items-center gap-2">
                <button type="button" className="w-6 h-6 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition">
                  <Search className="w-3 h-3" />
                </button>
                <button type="button" className="w-6 h-6 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition">
                  <SlidersHorizontal className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/decision-audit')}
                  className="px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold transition"
                >
                  View All
                </button>
              </div>
            </div>

            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Yesterday</div>

            {/* 4 Brand-Styled Rows (Starbucks, Netflix, Apple Store, Slack) */}
            <div className="space-y-3">
              {/* Row 1: Starbucks */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    ☕
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Starbucks</div>
                    <div className="text-[10px] text-slate-400 font-medium">Food &amp; Drink &bull; Nov 12, 26</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">+$515.75</div>
                  <div className="text-[9px] font-bold text-emerald-800">▲ Income</div>
                </div>
              </div>

              {/* Row 2: Netflix */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    N
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Netf xilix</div>
                    <div className="text-[10px] text-slate-400 font-medium">Entertainment &bull; ↺ Nov 12, 26</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">-$59.99</div>
                  <div className="text-[9px] font-medium text-slate-400">Transfer</div>
                </div>
              </div>

              {/* Row 3: Apple Store */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm shadow-xs font-sans">
                    
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Apple Store</div>
                    <div className="text-[10px] text-slate-400 font-medium">Electronics &bull; ↺ Nov 12, 26</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">-$75.99</div>
                  <div className="text-[9px] font-bold text-red-800">▼ Transfer</div>
                </div>
              </div>

              {/* Row 4: Slack */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    #
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Slack</div>
                    <div className="text-[10px] text-slate-400 font-medium">Electronics &bull; ↺ Nov 12, 26</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">-$59.99</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
