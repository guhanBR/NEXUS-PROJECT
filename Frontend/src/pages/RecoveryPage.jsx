import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../api/client';
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Check,
  X,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function RecoveryPage() {
  const {
    activeProject,
    activeProjectId,
    activeProposal,
    setActiveProposal,
    showToast,
  } = useProject();

  const queryClient = useQueryClient();

  const [scenarioType, setScenarioType] = useState('developer_outage');
  const [unavailableCandidateId, setUnavailableCandidateId] = useState('');
  const [compressedDeadlineDays, setCompressedDeadlineDays] = useState(20);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  const teamMembers = activeProject?.team_members || [];

  const handleSimulate = async (e) => {
    e.preventDefault();
    setIsSimulating(true);

    try {
      const payload = {
        disruption_scenario: scenarioType,
        unavailable_candidate_ids:
          scenarioType === 'developer_outage' && unavailableCandidateId
            ? [parseInt(unavailableCandidateId)]
            : [],
        compressed_deadline_days:
          scenarioType === 'deadline_compression'
            ? parseInt(compressedDeadlineDays)
            : undefined,
      };

      const result = await api.simulateWhatIf(activeProjectId, payload);
      setActiveProposal(result);
      showToast('Recovery plan generated for review.', 'success');
    } catch (err) {
      showToast(err.message || 'Simulation failed.', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApprove = async () => {
    if (!activeProposal?.proposal_id) return;
    setIsSubmittingApproval(true);

    try {
      await api.approvePlan(activeProjectId, {
        proposal_id: activeProposal.proposal_id,
        comment: 'Approved by project delivery lead',
      });

      await queryClient.invalidateQueries(['project', activeProjectId]);
      setActiveProposal(null);
      showToast('Recovery plan approved! Project schedule updated.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve recovery plan.', 'error');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleReject = () => {
    setActiveProposal(null);
    showToast('Proposed recovery plan discarded.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge bg-[#202724]/10 text-[#202724] font-bold uppercase tracking-wider text-[10px]">
              Step 03 & 04
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Simulation & Rebalancing Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            What-If Simulation &amp; Recovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Simulate real-world project disruptions, preview automated task reallocations, and review diffs before saving to live baseline.
          </p>
        </div>
      </div>

      {/* What-If Simulation Form */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-[#E2EAE5]">
          <h2 className="text-sm font-bold text-slate-900">1. Select Disruption Scenario</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate alternative schedules safely in memory without touching production project data.
          </p>
        </div>

        <form onSubmit={handleSimulate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Disruption Type
              </label>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value)}
                className="input cursor-pointer"
              >
                <option value="developer_outage">Team Member Unavailable (Outage)</option>
                <option value="deadline_compression">Deadline Compression (Accelerate)</option>
                <option value="scope_expansion">Scope Addition (New Work)</option>
              </select>
            </div>

            {scenarioType === 'developer_outage' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Unavailable Team Member
                </label>
                <select
                  value={unavailableCandidateId}
                  onChange={(e) => setUnavailableCandidateId(e.target.value)}
                  className="input cursor-pointer"
                >
                  <option value="">Select team member...</option>
                  {teamMembers.map((m) => (
                    <option key={m.candidate_id} value={m.candidate_id}>
                      {m.name} ({m.role_title})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scenarioType === 'deadline_compression' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Compressed Deadline (Days)
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={compressedDeadlineDays}
                  onChange={(e) => setCompressedDeadlineDays(e.target.value)}
                  className="input"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSimulating}
              className="btn-primary inline-flex items-center gap-2"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Optimal Recovery Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Calculate Recovery Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Calculated Proposal Comparison */}
      {activeProposal ? (
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-amber-300 shadow-md p-6 space-y-6 ring-2 ring-amber-400/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2EAE5]">
            <div>
              <div className="badge bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wider mb-1 border border-amber-300">
                Calculated Recovery Proposal
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Review Automated Adjustments &amp; Reassignments
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Inspect calculated changes before approving. Approving will apply the rebalanced schedule to the live project.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleReject}
                disabled={isSubmittingApproval}
                className="btn-secondary text-xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject &amp; Discard</span>
              </button>
              <button
                onClick={handleApprove}
                disabled={isSubmittingApproval}
                className="btn-primary text-xs inline-flex items-center gap-1.5"
              >
                {isSubmittingApproval ? 'Applying...' : (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Approve &amp; Apply Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Metric Diff */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-[#F7FAF8] rounded-xl border border-[#D5DED8]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Predicted Duration</div>
              <div className="text-2xl font-bold text-slate-900 font-tabular mt-0.5">
                {activeProposal.estimated_duration_days || activeProposal.rebalanced_schedule?.project_duration_days || 0} days
              </div>
            </div>

            <div className="p-5 bg-[#F7FAF8] rounded-xl border border-[#D5DED8]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Reassigned Tasks</div>
              <div className="text-2xl font-bold text-slate-900 font-tabular mt-0.5">
                {activeProposal.reassigned_tasks?.length || 0} tasks
              </div>
            </div>

            <div className="p-5 bg-[#F7FAF8] rounded-xl border border-[#D5DED8]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Optimizer Confidence</div>
              <div className="text-2xl font-bold text-emerald-700 font-tabular mt-0.5">
                {activeProposal.confidence_score ? `${Math.round(activeProposal.confidence_score * 100)}%` : '98%'}
              </div>
            </div>
          </div>

          {/* Reassigned Task Changes Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Deliverable Assignment Changes
            </h4>
            <div className="border border-[#D5DED8] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#F7FAF8] border-b border-[#D5DED8] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Task Deliverable</th>
                    <th className="px-4 py-3">Previous Assignee</th>
                    <th className="px-4 py-3">New Assignee</th>
                    <th className="px-4 py-3">Rebalance Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBF0EC] bg-white">
                  {(activeProposal.reassigned_tasks || []).map((t, idx) => (
                    <tr key={idx} className="hover:bg-[#F7FAF8]">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {t.task_title || `Task #${t.task_id}`}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {t.previous_owner || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-bold bg-amber-50/50">
                        {t.new_owner || 'Reassigned'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {t.reason || 'Skill match & capacity rebalance'}
                      </td>
                    </tr>
                  ))}
                  {(!activeProposal.reassigned_tasks || activeProposal.reassigned_tasks.length === 0) && (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-slate-500">
                        No task reassignment needed. The current schedule remains optimal.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/95 rounded-2xl border border-[#D5DED8] text-center py-10 px-6 text-xs text-slate-500">
          No active recovery proposal. Choose a disruption scenario above and click "Calculate Recovery Plan" to preview recommendations.
        </div>
      )}
    </div>
  );
}
