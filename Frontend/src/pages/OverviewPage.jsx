import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  ArrowLeftRight,
  MoreVertical,
  Star,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

export function OverviewPage() {
  const { activeProject } = useProject();
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const [timeFilter, setTimeFilter] = useState('1W');
  const [selectedRange, setSelectedRange] = useState('24h');
  const [selectedGainer, setSelectedGainer] = useState('Top gainers');
  const [starred, setStarred] = useState({ 0: true });

  const toggleStar = (index) => {
    setStarred((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // 4 Core Crypto / Project Assets (Exact Match to Reference Table)
  const cryptoAssets = [
    {
      id: 'band',
      name: 'Band Protocol',
      symbol: 'BAND',
      price: '$2.42',
      change: '+13.38%',
      marketCap: '$399.8M',
      iconBg: 'bg-black',
      iconText: 'B',
    },
    {
      id: 'vet',
      name: 'VeChain',
      symbol: 'VET',
      price: '$7.48',
      change: '+11.19%',
      marketCap: '$152.5M',
      iconBg: 'bg-[#1D2129]',
      iconText: 'V',
    },
    {
      id: 'aave',
      name: 'Aave',
      symbol: 'AAVE',
      price: '$0.0184',
      change: '+7.57%',
      marketCap: '$1.2B',
      iconBg: 'bg-[#2B313E]',
      iconText: 'A',
    },
    {
      id: 'waves',
      name: 'Waves',
      symbol: 'WAVES',
      price: '$30.68',
      change: '+6.80%',
      marketCap: '$399.8M',
      iconBg: 'bg-[#191D26]',
      iconText: '◆',
    },
  ];

  return (
    <div className="space-y-7 max-w-7xl mx-auto font-sans">
      
      {/* 1. TOP HEADER BAR: Overview Title + Search, Notifications, Profile Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Overview
          </h1>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition shadow-2xs"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Bell with Indicator Dot */}
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition shadow-2xs relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2.5 right-2.5 ring-2 ring-white" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition cursor-pointer shadow-2xs">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
              alt="Zoia M."
              className="w-8 h-8 rounded-full object-cover border border-white shadow-2xs"
            />
            <span className="text-xs font-bold text-slate-900">
              {user?.name || 'Zoia M.'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 2. TOP ROW: Portfolio Balance Wave Chart (Left) + Your Assets 3 Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT: Portfolio Balance Card (Soft Pastel Sky Blue) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Portfolio
            </h2>
          </div>

          <div className="flex-1 bg-[#EAF4FE] rounded-[30px] p-6 relative flex flex-col justify-between overflow-hidden shadow-xs border border-[#D7E9F9]">
            {/* Top Row: Amount & 3-dots */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight">
                  $ 17 643.41
                </div>
                <span className="text-xs font-semibold text-slate-500 mt-0.5 block">
                  Portfolio balance
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-700 p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Sparkline Wave Chart with Floating Target Tooltip */}
            <div className="relative my-4 h-28 flex items-center justify-center">
              {/* Floating Pinpoint Tooltip ($27 483.00) */}
              <div className="absolute left-[62%] top-0 -translate-x-1/2 flex flex-col items-center z-10">
                <div className="px-3 py-1 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-lg">
                  $27 483.00
                </div>
                <div className="w-[1px] h-10 border-l border-dashed border-slate-400 my-0.5" />
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 border-2 border-white shadow-xs -mt-1" />
              </div>

              {/* Smooth Harmonic Blue SVG Spline Waveform */}
              <svg
                viewBox="0 0 300 80"
                className="w-full h-full overflow-visible text-sky-400"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area Fill */}
                <path
                  d="M 0 50 Q 30 55 60 48 T 120 42 T 180 30 L 190 32 L 195 65 L 205 65 L 210 40 T 260 48 T 300 35 L 300 80 L 0 80 Z"
                  fill="url(#chartGradient)"
                />
                {/* Line Path */}
                <path
                  d="M 0 50 Q 30 55 60 48 T 120 42 T 180 30 L 190 32 L 195 65 L 205 65 L 210 40 T 260 48 T 300 35"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Bottom Time Filter Pill Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2">
              {['1H', '24H', '1W', '1M', '1Y', 'ALL'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeFilter(tab)}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    timeFilter === tab
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Your Assets (3 Pastel Cards) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Your Assets
            </h2>
            <button className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            
            {/* Asset 1: 1.25 BTC (Pastel Lavender) */}
            <div className="bg-[#F0EAF8] rounded-[30px] p-5 flex flex-col justify-between border border-[#E4D9F2] shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-black text-slate-900">
                    1.25 BTC
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    $ 2948.04
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-700">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-8">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-black text-slate-900 shadow-2xs text-sm">
                  ₿
                </div>
                <span className="text-xs font-bold text-purple-700">
                  + 0.14%
                </span>
              </div>
            </div>

            {/* Asset 2: 0.32 LTC (Pastel Mint Green) */}
            <div className="bg-[#E7F6EC] rounded-[30px] p-5 flex flex-col justify-between border border-[#D5EFE0] shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-black text-slate-900">
                    0.32 LTC
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    $ 2948.04
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-700">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-8">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-black text-slate-900 shadow-2xs text-sm font-serif">
                  Ł
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  + 0.31%
                </span>
              </div>
            </div>

            {/* Asset 3: 1.25 ETH (Pastel Butter Yellow) */}
            <div className="bg-[#FAF4DD] rounded-[30px] p-5 flex flex-col justify-between border border-[#EFE5C6] shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-black text-slate-900">
                    1.25 ETH
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    $ 2948.04
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-700">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-8">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-black text-slate-900 shadow-2xs text-sm">
                  ◆
                </div>
                <span className="text-xs font-bold text-amber-700">
                  + 0.27%
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. BOTTOM ROW: Market Performance Stream Table (Left) + Dark Promo Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
        
        {/* LEFT: Market Performance Stream Table */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 px-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Market is down 0.80%
            </h3>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                <span>{selectedRange}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                <span>{selectedGainer}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold text-slate-400 border-b border-slate-100 pb-2">
                <tr>
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold">Change</th>
                  <th className="pb-3 font-semibold">Market Cap</th>
                  <th className="pb-3 font-semibold text-center">Watch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {cryptoAssets.map((asset, idx) => {
                  const isStarred = !!starred[idx];
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl ${asset.iconBg} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}>
                            {asset.iconText}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {asset.name}
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">
                              {asset.symbol}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-bold text-slate-900">
                        {asset.price}
                      </td>
                      <td className="py-3.5 font-bold text-emerald-600">
                        {asset.change}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800">
                        {asset.marketCap}
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => toggleStar(idx)}
                          className="text-slate-300 hover:text-amber-400 transition"
                        >
                          <Star
                            className={`w-4 h-4 inline ${
                              isStarred
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Dark Promo Card ("Earn free crypto with Coinview Earn!") */}
        <div className="lg:col-span-5 flex flex-col justify-end">
          <div className="bg-[#191A1E] text-white rounded-[32px] p-7 sm:p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[220px]">
            
            {/* Text & Pill Header */}
            <div className="space-y-3 z-10 max-w-xs">
              <h4 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Earn{' '}
                <span className="border border-white/60 px-2 py-0.5 rounded-lg text-sm font-bold inline-block mx-0.5">
                  free
                </span>{' '}
                crypto with Coinview Earn!
              </h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Learn about different cryptocurrencies and earn them for free!
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-6 z-10">
              <button
                onClick={() => navigate('/recovery')}
                className="px-6 py-2.5 rounded-full bg-[#D8ECFD] hover:bg-[#C2E3FC] text-slate-950 text-xs font-extrabold shadow-lg transition-transform active:scale-95"
              >
                Earn Now
              </button>
            </div>

            {/* Decorative Abstract Overlapping White Wireframe Curves (Matching Mockup) */}
            <svg
              className="absolute right-0 bottom-0 w-48 h-48 pointer-events-none opacity-40"
              viewBox="0 0 200 200"
              fill="none"
            >
              <path
                d="M 50 190 Q 90 120 180 130"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M 30 180 Q 80 100 190 110"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M 10 170 Q 70 80 200 90"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

      </div>

    </div>
  );
}
