import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Sliders, Database, UserPlus, ShieldCheck, ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';
import { AddMemberModal } from '../components/modals/AddMemberModal';

export function SettingsPage() {
  const { members } = useProject();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-google-blue bg-google-blueSurface px-2.5 py-0.5 rounded-full">
            Settings &bull; Preferences
          </span>
          <span className="text-xs text-google-textMuted font-mono">
            Candidate Talent Pool & Optimizer Configuration
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-google-text">Settings & Talent Directory</h2>
        <p className="text-xs text-google-textSecondary mt-0.5">
          Manage the talent directory of candidate engineers and review optimizer tuning parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Directory */}
        <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
                <Database className="w-4 h-4 text-google-blue" />
                Talent Pool Directory ({members.length})
              </h3>
              <p className="text-xs text-google-textSecondary mt-0.5">
                Engineers available to be assigned to projects.
              </p>
            </div>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="google-btn-secondary py-1 px-3 text-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Candidate</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {members.length === 0 ? (
              <p className="text-xs text-google-textMuted py-4 text-center">No candidates in directory.</p>
            ) : (
              members.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 bg-google-subtle/60 rounded-xl border border-google-border text-xs space-y-1 hover:bg-white transition-colors"
                >
                  <div className="flex justify-between font-bold text-google-text">
                    <span>{c.name}</span>
                    <span className="text-google-textMuted font-normal">{c.role_title}</span>
                  </div>
                  <div className="text-google-textSecondary">
                    {Object.entries(c.skills || {})
                      .map(([s, l]) => `${s}: L${l}`)
                      .join(', ')}{' '}
                    &bull; <span className="font-tabular font-medium">{c.weekly_capacity_hours}h/wk</span> &bull; {c.experience_years} yrs exp
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Plain-Language Optimizer Preferences */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
              <Sliders className="w-4 h-4 text-google-blue" />
              How the Optimizer Prioritizes Trade-offs
            </h3>
            <p className="text-xs text-google-textSecondary">
              When disruptions occur, RebalanceX balances competing priorities using pre-tuned weights:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-google-subtle/60 rounded-xl border border-google-border space-y-0.5">
                <div className="flex justify-between font-bold text-google-text">
                  <span>1. Protect Project Deadline</span>
                  <span className="text-[10px] font-bold text-google-red bg-google-redSurface px-2 py-0.2 rounded-full">
                    Highest Priority (8.0x)
                  </span>
                </div>
                <p className="text-google-textSecondary">
                  The engine strictly penalizes days running past the target deadline.
                </p>
              </div>

              <div className="p-3.5 bg-google-subtle/60 rounded-xl border border-google-border space-y-0.5">
                <div className="flex justify-between font-bold text-google-text">
                  <span>2. Minimize Plan Perturbation (Churn)</span>
                  <span className="text-[10px] font-bold text-google-blue bg-google-blueSurface px-2 py-0.2 rounded-full">
                    Medium Priority (3.5x)
                  </span>
                </div>
                <p className="text-google-textSecondary">
                  Keeps existing task assignments stable unless a change gives significant benefit.
                </p>
              </div>

              <div className="p-3.5 bg-google-subtle/60 rounded-xl border border-google-border space-y-0.5">
                <div className="flex justify-between font-bold text-google-text">
                  <span>3. Balance Team Workload</span>
                  <span className="text-[10px] font-bold text-google-teal bg-google-tealSurface px-2 py-0.2 rounded-full">
                    Standard (0.4x)
                  </span>
                </div>
                <p className="text-google-textSecondary">
                  Distributes hours evenly to prevent single points of failure and burnout.
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Hyperparameters Accordion */}
          <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-3">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-google-textSecondary hover:text-google-text"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-google-textMuted" />
                Advanced Solver Coefficients
              </span>
              {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isAdvancedOpen && (
              <div className="pt-2 border-t border-google-border text-xs text-google-textSecondary space-y-2 animate-in fade-in duration-150 font-mono">
                <div className="flex justify-between py-1 border-b border-google-border/60">
                  <span>WEIGHT_DEADLINE_DELAY:</span>
                  <span className="font-bold text-google-text">8.0</span>
                </div>
                <div className="flex justify-between py-1 border-b border-google-border/60">
                  <span>WEIGHT_PLAN_CHURN:</span>
                  <span className="font-bold text-google-text">3.5</span>
                </div>
                <div className="flex justify-between py-1 border-b border-google-border/60">
                  <span>WEIGHT_LOAD_VARIANCE:</span>
                  <span className="font-bold text-google-text">0.4</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>PENALTY_SKILL_MISMATCH:</span>
                  <span className="font-bold text-google-text">15.0</span>
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
