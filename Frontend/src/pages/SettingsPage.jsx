import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Sliders, Database, UserPlus } from 'lucide-react';
import { AddMemberModal } from '../components/modals/AddMemberModal';



export function SettingsPage() {
  const { members } = useProject();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">System Configuration & Talent Pool</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Tune solver objective loss weights, manage candidate talent profiles, and view engine parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solver Weights */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" /> Optimizer Loss Function Weights
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Deadline Delay Penalty Weight</span>
                <span className="font-mono text-blue-600">8.0x</span>
              </div>
              <p className="text-slate-500 mt-0.5">Severe penalty per day delivering past target deadline.</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Workload Imbalance Weight</span>
                <span className="font-mono text-blue-600">0.4x</span>
              </div>
              <p className="text-slate-500 mt-0.5">Penalizes standard deviation of capacity utilization across team.</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Plan Churn / Perturbation Penalty</span>
                <span className="font-mono text-blue-600">3.5x</span>
              </div>
              <p className="text-slate-500 mt-0.5">Preserves existing plan stability when changes have marginal benefit.</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Skill Mismatch Penalty</span>
                <span className="font-mono text-blue-600">15.0x</span>
              </div>
              <p className="text-slate-500 mt-0.5">Hard penalty if candidate skill level is below task requirement.</p>
            </div>
          </div>
        </div>

        {/* Candidate Directory */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" /> Candidate Talent Pool Directory
            </h3>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add Candidate
            </button>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {members.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1"
              >
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{c.name}</span>
                  <span className="text-slate-500 font-normal">{c.role_title}</span>
                </div>
                <div className="text-slate-500">
                  {Object.entries(c.skills || {})
                    .map(([s, l]) => `${s}: L${l}`)
                    .join(', ')}{' '}
                  &bull; {c.weekly_capacity_hours}h/wk &bull; {c.experience_years} yrs exp
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAddMemberOpen && <AddMemberModal onClose={() => setIsAddMemberOpen(false)} />}
    </div>
  );
}
