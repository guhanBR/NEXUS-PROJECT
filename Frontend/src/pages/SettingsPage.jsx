import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../api/client';
import { Sliders, Database, UserPlus, ChevronDown, ChevronUp, Info, Zap } from 'lucide-react';
import { AddMemberModal } from '../components/modals/AddMemberModal';

export function SettingsPage() {
  const { members } = useProject();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge bg-[#202724]/10 text-[#202724] font-bold uppercase tracking-wider text-[10px]">
              Configuration
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Optimizer Weights & Talent Pool
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Settings &amp; Talent Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Manage global engineer profiles, skill maps, weekly capacities, and solver balance priorities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Directory */}
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EAE5]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-700" />
                Global Talent Pool ({members.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Engineers available to be assigned to active projects.
              </p>
            </div>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="btn-secondary py-1 px-3 text-xs inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Candidate</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {members.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No candidates in directory.</p>
            ) : (
              members.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE4DF] text-xs space-y-1"
                >
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>{c.name}</span>
                    <span className="text-slate-500 font-normal">{c.role_title}</span>
                  </div>
                  <div className="text-slate-600">
                    {Object.entries(c.skills || {})
                      .map(([s, l]) => `${s}: L${l}`)
                      .join(', ')}{' '}
                    &bull; <span className="font-tabular font-semibold text-slate-800">{c.weekly_capacity_hours}h/wk</span> &bull; {c.experience_years} yrs exp
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Optimizer Weights */}
        <div className="space-y-6">
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-[#E2EAE5]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-700" />
                Rebalancing Objectives & Priorities
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                When disruptions occur, RebalanceX balances competing priorities using pre-tuned solver weights:
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE4DF] space-y-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>1. Protect Project Deadline</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px] border border-red-200">
                    Highest Priority (8.0x)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Heavily penalizes schedule solutions that breach the target project deadline.
                </p>
              </div>

              <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE4DF] space-y-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>2. Minimize Plan Churn</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                    Medium Priority (3.5x)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Keeps existing task assignments stable unless reassignment provides measurable gain.
                </p>
              </div>

              <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE4DF] space-y-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>3. Balance Team Workload</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                    Standard (0.4x)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Distributes hours evenly across specialists to prevent bottlenecks and burnout.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile & Network Configuration */}
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Backend API &amp; Android Network Endpoint
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {api.isNative() ? 'Android Native (Capacitor)' : 'Web Client'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Current API Endpoint: <strong className="text-slate-900 font-mono">{api.getBaseUrl() || '(Same-Origin Relative)'}</strong>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                id="custom-api-input"
                defaultValue={api.getBaseUrl()}
                placeholder="e.g. http://10.0.2.2:8000 or http://192.168.1.50:8000"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('custom-api-input');
                  if (input) {
                    api.setBaseUrl(input.value);
                    window.location.reload();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Save &amp; Reload
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Default for Android Studio Emulator is <code>http://10.0.2.2:8000</code>. For physical Android devices on Wi-Fi, enter your PC LAN IP.
            </p>
          </div>

          {/* Expandable Technical Details */}
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-5 shadow-xs space-y-3">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                Advanced Solver Coefficients
              </span>
              {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isAdvancedOpen && (
              <div className="pt-2 border-t border-[#E2EAE5] text-xs text-slate-600 space-y-2 font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>WEIGHT_DEADLINE_DELAY:</span>
                  <span className="font-bold text-slate-900">8.0</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>WEIGHT_PLAN_CHURN:</span>
                  <span className="font-bold text-slate-900">3.5</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>WEIGHT_LOAD_VARIANCE:</span>
                  <span className="font-bold text-slate-900">0.4</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>PENALTY_SKILL_MISMATCH:</span>
                  <span className="font-bold text-slate-900">15.0</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAddMemberOpen && <AddMemberModal onClose={() => setIsAddMemberOpen(false)} />}
    </div>
  );
}
