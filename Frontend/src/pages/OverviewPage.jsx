import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  LayoutGrid,
  Download,
  MessageSquare,
  Bell,
  ChevronDown,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  Wifi,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

export function OverviewPage() {
  const { activeProject, projects } = useProject();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState('This Month');
  const [selectedTab, setSelectedTab] = useState('Overview');

  // Real Project Cards for Fanned Deck (Layered Overlapping Cards Matching Reference 1:1)
  const fannedCards = [
    {
      id: 'card-1',
      type: 'Platinum Card',
      title: 'Tata FinTech Quantum Core',
      balance: '₹ 14,85,640',
      fee: '$150 / mo',
      brand: 'Mastercard',
      bgGradient: 'from-[#F2F4F7] to-[#E2E7ED]',
      textColor: 'text-slate-700',
      offset: '-rotate-12 translate-y-6 -translate-x-16',
      zIndex: 'z-10',
    },
    {
      id: 'card-2',
      type: 'Debit Card',
      title: 'Cloud ERP Migration',
      balance: '₹ 8,40,200',
      fee: '$80 / mo',
      brand: 'VISA',
      bgGradient: 'from-[#EAF0F6] to-[#D5E2EE]',
      textColor: 'text-slate-800',
      offset: '-rotate-6 translate-y-3 -translate-x-8',
      zIndex: 'z-20',
    },
    {
      id: 'card-3',
      type: 'Credit Card',
      title: 'Web3 Polygon Payment Mesh',
      balance: '₹ 5,78,395',
      fee: '$120 / mo',
      brand: 'G Pay',
      bgGradient: 'from-[#FDFBF7] to-[#EFE8D8]',
      textColor: 'text-slate-900',
      offset: '-rotate-2 translate-y-1 -translate-x-3',
      zIndex: 'z-30',
    },
    {
      id: 'card-4-center',
      type: 'Credit Card',
      title: 'Ryzen Matrix • Active Sprint',
      balance: '₹ 24,50,000',
      fee: 'Primary Asset',
      brand: 'G Pay',
      isCenter: true,
      bgGradient: 'from-[#FFFDF7] via-[#FBF6E9] to-[#EDE5D2]',
      textColor: 'text-slate-900',
      offset: 'rotate-0 translate-y-0 scale-105 shadow-2xl',
      zIndex: 'z-40',
    },
    {
      id: 'card-5',
      type: 'Credit Card',
      title: 'AI Vision Solver',
      balance: '₹ 3,90,000',
      fee: 'stripe',
      brand: 'stripe',
      bgGradient: 'from-[#EEF3F8] to-[#DCE6F2]',
      textColor: 'text-slate-800',
      offset: 'rotate-4 translate-y-2 translate-x-5',
      zIndex: 'z-30',
    },
    {
      id: 'card-6',
      type: 'Silver Card',
      title: 'Decision History Ledger',
      balance: '₹ 12,10,000',
      fee: '$130 / mo',
      brand: 'Apple Pay',
      bgGradient: 'from-[#F0F3F6] to-[#DFE5EB]',
      textColor: 'text-slate-700',
      offset: 'rotate-10 translate-y-5 translate-x-12',
      zIndex: 'z-20',
    },
  ];

  // 4 Core Financial / Metric Summary Cards (Glass Frosted Bar)
  const summaries = [
    {
      label: 'Total Balance',
      value: '₹ 14,85,640.00',
      change: '+ 6.3%',
      isPositive: true,
      sparkline: 'M0 15 Q 10 5, 20 12 T 40 4 T 60 14 T 80 6',
    },
    {
      label: 'Total Income',
      value: '₹ 8,395.00',
      change: '+ 7.1%',
      isPositive: true,
      sparkline: 'M0 16 Q 12 18, 24 10 T 48 6 T 70 8 T 80 4',
    },
    {
      label: 'Total Expenses',
      value: '₹ 2,455.00',
      change: '- 5.7%',
      isPositive: false,
      sparkline: 'M0 6 Q 14 8, 28 14 T 52 10 T 70 16 T 80 14',
    },
    {
      label: 'Total Savings',
      value: '₹ 4,320.00',
      change: '+ 5.2%',
      isPositive: true,
      sparkline: 'M0 14 Q 10 12, 20 6 T 45 10 T 65 4 T 80 2',
    },
  ];

  // Recent Transactions Activity List (Matching Reference Transactions 1:1)
  const transactions = [
    {
      id: 't-1',
      title: 'Starbucks',
      subtitle: 'Food & Drink • Nov 12, 26',
      amount: '+ ₹ 515.75',
      type: 'Income',
      isPositive: true,
      iconBg: 'bg-[#00704A]',
      iconText: '☕',
    },
    {
      id: 't-2',
      title: 'Netf xilix',
      subtitle: 'Entertainment • Nov 12, 26',
      amount: '- ₹ 59.99',
      type: 'Transfer',
      isPositive: false,
      iconBg: 'bg-[#E50914]',
      iconText: 'N',
    },
    {
      id: 't-3',
      title: 'Apple Store',
      subtitle: 'Electronics • Nov 12, 26',
      amount: '- ₹ 75.99',
      type: 'Transfer',
      isPositive: false,
      iconBg: 'bg-black',
      iconText: '',
    },
    {
      id: 't-4',
      title: 'Slack',
      subtitle: 'Electronics • Nov 12, 26',
      amount: '- ₹ 59.99',
      type: 'Transfer',
      isPositive: false,
      iconBg: 'bg-[#4A154B]',
      iconText: '#',
    },
  ];

  // Vertical Histogram Tower months data (Center Apr tower with black and red lines)
  const histogramMonths = [
    { name: 'Jan', height: '32%' },
    { name: 'Feb', height: '54%' },
    { name: 'Mar', height: '76%' },
    { name: 'Apr', height: '100%', isCenter: true },
    { name: 'May', height: '68%' },
    { name: 'Jun', height: '48%' },
    { name: 'Jul', height: '28%' },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
      
      {/* 1. TOP GREETING HEADER & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 font-serif">
            Good Morning, {user?.name?.split(' ')[0] || 'Alvie'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {currentDate || 'Friday, 15 July 2026'}
          </p>
        </div>

        {/* Action Controls Group (Transfer, Grid Toggle, Received, Chat, Bell, Avatar) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Transfer Button */}
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F5F7F6] hover:bg-[#EAEFEA] text-slate-800 text-xs font-semibold transition border border-slate-200/60 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 rotate-45 text-slate-600" />
            <span>Transfer</span>
          </button>

          {/* Grid Layout Toggle */}
          <button
            onClick={() => navigate('/team-formation')}
            className="w-8 h-8 rounded-full bg-[#F5F7F6] hover:bg-[#EAEFEA] text-slate-700 flex items-center justify-center transition border border-slate-200/60 shadow-2xs"
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>

          {/* Received Button */}
          <button
            onClick={() => navigate('/recovery')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F5F7F6] hover:bg-[#EAEFEA] text-slate-800 text-xs font-semibold transition border border-slate-200/60 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Received</span>
          </button>

          {/* Direct Messages Icon Button */}
          <button
            onClick={() => navigate('/messages')}
            className="w-8 h-8 rounded-full bg-[#F5F7F6] hover:bg-[#EAEFEA] text-slate-700 flex items-center justify-center transition border border-slate-200/60 shadow-2xs relative"
            title="Direct Messages"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          {/* Notifications Bell with Live Alert Dot */}
          <button
            onClick={() => navigate('/project-rooms')}
            className="w-8 h-8 rounded-full bg-[#F5F7F6] hover:bg-[#EAEFEA] text-slate-700 flex items-center justify-center transition border border-slate-200/60 shadow-2xs relative"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-2 right-2 ring-1 ring-white" />
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-slate-200/80 cursor-pointer hover:ring-slate-400 transition ml-1"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 2. THE ICONIC LAYERED OVERLAPPING FANNED CARDS DECK */}
      <div className="relative pt-6 pb-2 overflow-hidden flex flex-col items-center">
        {/* Fanned Cards Horizontal Stage */}
        <div className="relative w-full max-w-4xl h-[170px] sm:h-[190px] flex items-center justify-center">
          
          {/* Card 1 (Far Left Platinum) */}
          <div className="absolute left-[2%] sm:left-[8%] -top-1 w-[160px] sm:w-[200px] h-[135px] sm:h-[155px] rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-[#F5F7F9] to-[#E3E9F0] border border-white/80 shadow-md transform -rotate-12 translate-y-4 text-slate-700 select-none pointer-events-none hidden sm:flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Platinum Card</span>
              <span className="text-[9px] font-mono text-slate-400">$150 / mo</span>
            </div>
            <div className="text-xs font-black text-slate-800 truncate">
              Tata Quantum Core
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
              <span>•••• 4892</span>
              <span>08/28</span>
            </div>
          </div>

          {/* Card 2 (Left Debit Card) */}
          <div className="absolute left-[15%] sm:left-[22%] top-1 w-[170px] sm:w-[210px] h-[140px] sm:h-[160px] rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-[#EAF1F7] to-[#D7E3EE] border border-white/90 shadow-lg transform -rotate-6 translate-y-2 text-slate-800 select-none pointer-events-none hidden sm:flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Debit Card</span>
              <span className="text-[10px] font-bold">VISA</span>
            </div>
            <div className="text-xs font-black text-slate-800 truncate">
              Cloud ERP Migration
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-600">
              <span>•••• 1024</span>
              <span>11/27</span>
            </div>
          </div>

          {/* Card 3 (Center-Left Credit Card) */}
          <div className="absolute left-[25%] sm:left-[32%] top-1 w-[180px] sm:w-[220px] h-[145px] sm:h-[165px] rounded-2xl p-3.5 sm:p-4 bg-gradient-to-br from-[#FAF5EB] to-[#EFE4D0] border border-white/95 shadow-xl transform -rotate-2 text-slate-900 select-none pointer-events-none flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Credit Card</span>
              <span className="text-[10px] font-black">G Pay</span>
            </div>
            <div className="text-xs font-black text-slate-900 truncate">
              Web3 Polygon Mesh
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-700">
              <span>•••• 9841</span>
              <span>05/29</span>
            </div>
          </div>

          {/* Card 4 (CENTER GLOWING FRONT MASTER CARD: GPay Warm Cream Pearl) */}
          <div className="relative z-30 w-[200px] sm:w-[250px] h-[155px] sm:h-[175px] rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#FFFDF7] via-[#FAF4E5] to-[#EBE2CB] border border-white shadow-[0_20px_40px_-10px_rgba(200,180,140,0.45)] text-slate-950 flex flex-col justify-between select-none cursor-pointer hover:scale-102 transition-transform">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-600 tracking-tight">
                Credit Card
              </span>
              <span className="text-xs font-black tracking-tight text-slate-900 flex items-center gap-1">
                G Pay
              </span>
            </div>

            {/* Gold EMV Chip & Contactless Waves */}
            <div className="my-auto flex items-center justify-between">
              <div className="w-8 h-6 rounded-md bg-gradient-to-br from-[#E8D49B] to-[#C9A959] border border-[#B39345] shadow-2xs" />
              <Wifi className="w-4 h-4 text-slate-600 rotate-90" />
            </div>

            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Active Sprint
                </span>
                <span className="text-xs font-black text-slate-900">
                  Ryzen Matrix Core
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-800">
                •••• 3892
              </span>
            </div>
          </div>

          {/* Card 5 (Center-Right stripe Card) */}
          <div className="absolute right-[25%] sm:right-[32%] top-1 w-[180px] sm:w-[220px] h-[145px] sm:h-[165px] rounded-2xl p-3.5 sm:p-4 bg-gradient-to-br from-[#EEF4F9] to-[#DCE7F3] border border-white/95 shadow-xl transform rotate-3 text-slate-900 select-none pointer-events-none hidden sm:flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-600 uppercase">stripe</span>
              <span className="text-[10px] font-bold text-slate-800">Credit Card</span>
            </div>
            <div className="text-xs font-black text-slate-800 truncate">
              AI Vision Solver
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-600">
              <span>•••• 7712</span>
              <span>09/27</span>
            </div>
          </div>

          {/* Card 6 (Far Right Apple Pay Silver Card) */}
          <div className="absolute right-[2%] sm:right-[8%] -top-1 w-[160px] sm:w-[200px] h-[135px] sm:h-[155px] rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-[#F2F4F7] to-[#DFE5EB] border border-white/80 shadow-md transform rotate-12 translate-y-4 text-slate-700 select-none pointer-events-none hidden sm:flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Silver Card</span>
              <span className="text-[9px] font-mono text-slate-400">Apple Pay</span>
            </div>
            <div className="text-xs font-black text-slate-800 truncate">
              Audit Ledger
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
              <span>•••• 6031</span>
              <span>01/29</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. 4-COLUMN SUMMARY GLASS STRIP */}
      <div className="bg-[#F8FAF9]/80 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#E6EDE8] p-4 sm:p-5 shadow-2xs grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60">
        {summaries.map((item, idx) => (
          <div key={item.label} className={`flex items-center justify-between ${idx > 0 ? 'sm:pl-6 pt-3 sm:pt-0' : ''}`}>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                {item.label}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {item.value}
                </span>
                <span
                  className={`text-[11px] font-bold flex items-center ${
                    item.isPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {item.change}
                </span>
              </div>
            </div>

            {/* Sparkline Waveform */}
            <div className="w-16 h-8 text-slate-700 shrink-0">
              <svg viewBox="0 0 80 20" className="w-full h-full overflow-visible">
                <path
                  d={item.sparkline}
                  fill="none"
                  stroke={item.isPositive ? '#10B981' : '#F43F5E'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* 4. MAIN EVIDENCE AREA (Left Large Column + Right Grid Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
        
        {/* LEFT COLUMN (5-Cols): Workload & Income Symmetrical Bar Tower */}
        <div className="lg:col-span-5 bg-[#FDFEFE] rounded-3xl p-6 border border-[#E9EFEA] shadow-2xs flex flex-col justify-between min-h-[460px]">
          {/* Header Row with Filter */}
          <div className="flex items-center justify-between pb-4">
            <span className="text-xs font-bold text-slate-800">
              Total Income
            </span>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F8F7] border border-slate-200/80 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition">
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* My Income Top Display */}
          <div className="text-center py-2">
            <span className="text-xs font-semibold text-slate-500 block">
              My Income
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 block">
              $578,395<span className="text-slate-400 text-lg">.00</span>
            </span>
          </div>

          {/* Symmetrical Vertical Histogram Tower (Matching Reference Centerpiece) */}
          <div className="relative my-4 py-4 flex items-center justify-between px-2 sm:px-6 h-48">
            {/* Top Indicator Label for Center Apr Tower */}
            <div className="absolute left-1/2 top-2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700">
              $4,699.00
            </div>

            {/* Bottom Indicator Label for Center Apr Tower */}
            <div className="absolute left-1/2 bottom-2 -translate-x-1/2 text-[10px] font-mono font-bold text-rose-500">
              $4,699.00
            </div>

            {histogramMonths.map((m) => {
              if (m.isCenter) {
                return (
                  <div key={m.name} className="flex flex-col items-center justify-center h-full relative z-10">
                    {/* Top Black Striped Pillar */}
                    <div className="w-6 sm:w-8 h-20 bg-slate-950 rounded-t-xs flex items-center justify-center space-x-[2px] overflow-hidden p-0.5 shadow-sm">
                      <div className="w-1 h-full bg-white/30" />
                      <div className="w-1 h-full bg-white/30" />
                      <div className="w-1 h-full bg-white/30" />
                    </div>

                    {/* Month Label In Center */}
                    <span className="text-[11px] font-bold text-slate-950 my-1">
                      {m.name}
                    </span>

                    {/* Bottom Red Striped Pillar */}
                    <div className="w-6 sm:w-8 h-20 bg-rose-500 rounded-b-xs flex items-center justify-center space-x-[2px] overflow-hidden p-0.5 shadow-sm">
                      <div className="w-1 h-full bg-white/30" />
                      <div className="w-1 h-full bg-white/30" />
                      <div className="w-1 h-full bg-white/30" />
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.name} className="flex flex-col items-center justify-center h-full">
                  {/* Upper Stepped Gray Bar */}
                  <div
                    className="w-4 sm:w-6 bg-slate-200/80 rounded-t-xs transition-all"
                    style={{ height: m.height }}
                  />

                  {/* Month Label */}
                  <span className="text-[10px] font-semibold text-slate-400 my-1">
                    {m.name}
                  </span>

                  {/* Lower Stepped Gray Bar */}
                  <div
                    className="w-4 sm:w-6 bg-slate-200/80 rounded-b-xs transition-all"
                    style={{ height: m.height }}
                  />
                </div>
              );
            })}
          </div>

          {/* My Expenses Bottom Display */}
          <div className="text-center py-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block">
              My Expenses
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 block">
              $578,395<span className="text-slate-400 text-lg">.00</span>
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN (7-Cols): Spending Gauge + Monthly Splines + Transactions Stream */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Row: Weekly Spending (Left) + Monthly Overview (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Box 1: Weekly Spending (Semi-Circular Arc Gauge) */}
            <div className="bg-[#FDFEFE] rounded-3xl p-5 border border-[#E9EFEA] shadow-2xs flex flex-col justify-between min-h-[210px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Weekly Spending
                </span>
                <button className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Legend */}
              <div className="space-y-0.5 pt-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                  <span>Spending Breakdown</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span>Shopping</span>
                </div>
              </div>

              {/* Half-Donut Gauge Arc Chart */}
              <div className="relative h-20 flex items-center justify-center my-1">
                <svg viewBox="0 0 160 80" className="w-40 h-20 overflow-visible">
                  {/* Gray Background Arc */}
                  <path
                    d="M 10 75 A 70 70 0 0 1 150 75"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Black Active Arc Segment */}
                  <path
                    d="M 10 75 A 70 70 0 0 1 115 20"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Bottom Percentage Indicators */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">▲ 56.07%</span>
                  <span>42% of total spend</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-600 block text-xs">▲ 47.93%</span>
                  <span>42% of total spend</span>
                </div>
              </div>
            </div>

            {/* Box 2: Monthly Overview (Sinusoidal Spline Waves) */}
            <div className="bg-[#FDFEFE] rounded-3xl p-5 border border-[#E9EFEA] shadow-2xs flex flex-col justify-between min-h-[210px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Monthly Overview
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-slate-900 text-white text-[9px] font-bold">
                    +8.2%
                  </span>
                </div>
                <button className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3 Harmonious Overlapping Spline Waveform Lines */}
              <div className="relative h-24 my-2 flex items-center justify-center">
                <svg viewBox="0 0 240 70" className="w-full h-full overflow-visible">
                  {/* Wave 1: Dark Lead Wave */}
                  <path
                    d="M 0 50 Q 30 15, 60 50 T 120 50 T 180 50 T 240 50"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  {/* Wave 2: Middle Gray Wave */}
                  <path
                    d="M 0 30 Q 30 65, 60 30 T 120 30 T 180 30 T 240 30"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  {/* Wave 3: Light Gray Wave */}
                  <path
                    d="M 0 40 Q 40 10, 80 40 T 160 40 T 240 40"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  {/* Indicator Pinpoint Marker at Jul */}
                  <line x1="195" y1="10" x2="195" y2="65" stroke="#0F172A" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="195" cy="30" r="3.5" fill="#0F172A" />
                </svg>
              </div>

              {/* Bottom Months Labels */}
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100">
                {['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug'].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Row: Transactions Stream (Recent Activity List) */}
          <div className="bg-[#FDFEFE] rounded-3xl p-5 sm:p-6 border border-[#E9EFEA] shadow-2xs space-y-4">
            {/* Header with Search & Filter */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Transactions
              </span>

              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <Search className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/performance-allocation')}
                  className="px-3 py-1 rounded-full bg-[#F5F7F6] text-slate-700 hover:text-slate-900 text-[11px] font-bold border border-slate-200/80 transition"
                >
                  View All
                </button>
              </div>
            </div>

            {/* Subheading: Yesterday */}
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Yesterday
            </div>

            {/* List Rows */}
            <div className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50/50 rounded-xl px-2 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${t.iconBg} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}>
                      {t.iconText}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {t.title}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {t.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {t.amount}
                    </div>
                    <span
                      className={`text-[9px] font-semibold flex items-center justify-end gap-0.5 ${
                        t.isPositive ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {t.isPositive ? '▲ ' : '▼ '} {t.type}
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
