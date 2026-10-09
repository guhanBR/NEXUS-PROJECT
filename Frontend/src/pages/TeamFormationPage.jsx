import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../api/client';
import {
  Users,
  UserCheck,
  Sparkles,
  Plus,
  Shield,
  CheckCircle2,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AddMemberModal } from '../components/modals/AddMemberModal';

export function TeamFormationPage() {
  const {
    activeProject,
    activeProjectId,
    members,
    showToast,
  } = useProject();

  const queryClient = useQueryClient();

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposedTeam, setProposedTeam] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const teamMembers = activeProject?.team_members || [];

  const handleBuildTeam = async () => {
    setIsGenerating(true);
    try {
      const res = await api.formTeam(activeProjectId, {
        team_size: activeProject?.target_team_size || 4,
        weights: { skill_match: 0.4, availability: 0.3, cost: 0.2, experience: 0.1 },
      });

      setProposedTeam(res.team || res);
      showToast('Optimal candidate team generated. Review and confirm below.', 'success');
    } catch (err) {
      showToast(err.message || 'Team formation failed.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmTeam = async () => {
    if (!proposedTeam || !proposedTeam.members) return;
    setIsConfirming(true);

    try {
      const candidateIds = proposedTeam.members.map((m) => m.id || m.candidate_id);
      await api.confirmTeam(activeProjectId, { candidate_ids: candidateIds });
      await queryClient.invalidateQueries(['project', activeProjectId]);
      setProposedTeam(null);
      showToast('Team roster confirmed for project!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to confirm team.', 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge bg-[#202724]/10 text-[#202724] font-bold uppercase tracking-wider text-[10px]">
              Step 01
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Autonomous Talent Allocation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Team Formation &amp; Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Match engineer competencies against project deliverables, inspect capacity balances, and optimize team coverage.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="btn-secondary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Candidate</span>
          </button>
          <button
            onClick={handleBuildTeam}
            disabled={isGenerating}
            className="btn-primary text-xs"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Optimizing Team...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Build Team (AI)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Proposed Team Review Banner */}
      {proposedTeam && proposedTeam.members && (
        <div className="bg-gradient-to-r from-[#202724] to-[#2B3530] text-white rounded-2xl p-6 shadow-xl border border-white/15 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 inline-block mb-1">
                Generated Team Recommendation
              </span>
              <h3 className="text-xl font-bold text-white">
                Proposed Squad ({proposedTeam.members.length} Specialists)
              </h3>
              <p className="text-xs text-white/75 mt-0.5">
                Evaluated against project skill constraints with multi-objective fitness score.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setProposedTeam(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
              >
                Discard
              </button>
              <button
                onClick={handleConfirmTeam}
                disabled={isConfirming}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition shadow-md"
              >
                {isConfirming ? 'Confirming...' : 'Confirm Team Roster'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {proposedTeam.members.map((m) => (
              <div key={m.id || m.candidate_id} className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
                <div className="font-semibold text-white text-sm">{m.name}</div>
                <div className="text-xs text-white/70">{m.role_title}</div>
                <div className="text-[11px] text-amber-300 font-medium mt-2">
                  Weekly Capacity: {m.weekly_capacity_hours || 40}h/wk
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Project Team Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#E2EAE5] bg-[#F7FAF8]/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Confirmed Project Members</h2>
            <p className="text-xs text-slate-500">Assigned specialists working on active project deliverables</p>
          </div>
          <span className="badge bg-[#202724]/10 text-slate-800 font-medium">
            {teamMembers.length} Members Confirmed
          </span>
        </div>

        {teamMembers.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 space-y-3">
            <p>No team members assigned to this project yet.</p>
            <button
              onClick={handleBuildTeam}
              className="btn-primary text-xs"
            >
              Build team
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F7FAF8] border-b border-[#E2EAE5] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Member Name</th>
                  <th className="px-6 py-3.5">Responsibility / Role</th>
                  <th className="px-6 py-3.5">Experience</th>
                  <th className="px-6 py-3.5">Skills & Rating</th>
                  <th className="px-6 py-3.5 font-tabular">Weekly Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBF0EC] bg-white">
                {teamMembers.map((m) => (
                  <tr key={m.candidate_id} className="hover:bg-[#F7FAF8]">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {m.name}
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-xs">
                      {m.role_title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-tabular text-xs">
                      {m.experience_years} years
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(m.skills || {}).map(([skill, lvl]) => (
                          <span key={skill} className="px-2 py-0.5 rounded-md bg-[#EEF2EF] text-[#242C28] text-[11px] font-medium border border-[#D5DED8]">
                            {skill}: L{lvl}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-tabular text-slate-700 text-xs">
                      {m.weekly_capacity_hours || 40} hrs/wk
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Talent Pool Directory */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#E2EAE5] bg-[#F7FAF8]/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Enterprise Talent Pool</h2>
            <p className="text-xs text-slate-500">All registered candidate engineers available for matching</p>
          </div>
          <span className="badge bg-slate-100 text-slate-700 font-medium font-tabular">
            {members.length} Candidates in Pool
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#F7FAF8] border-b border-[#E2EAE5] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3">Candidate</th>
                <th className="px-6 py-3">Primary Role</th>
                <th className="px-6 py-3">Skills Map</th>
                <th className="px-6 py-3 font-tabular">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF0EC] bg-white">
              {members.map((cand) => (
                <tr key={cand.id} className="hover:bg-[#F7FAF8]">
                  <td className="px-6 py-3 font-semibold text-slate-900">{cand.name}</td>
                  <td className="px-6 py-3 text-slate-600">{cand.role_title}</td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(cand.skills || {}).map(([s, l]) => (
                        <span key={s} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                          {s} ({l})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-3 font-tabular text-slate-600">
                    {cand.weekly_capacity_hours || 40}h/wk
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddMemberOpen && <AddMemberModal onClose={() => setIsAddMemberOpen(false)} />}
    </div>
  );
}
