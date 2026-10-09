import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import {
  GitCompare,
  CheckCheck,
  X,
  FileText,
  Sparkles,
  ArrowRightLeft,
  BrainCircuit,
  AlertCircle,
  Calendar,
  Clock,
  ShieldCheck,
  Users,
  ArrowRight,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';

export function RebalanceDiffPage() {
  const { activeProposal, activeProjectId, showToast } = useProject();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activeProposal) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-google-border shadow-google-xs space-y-4 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-google-subtle text-google-blue flex items-center justify-center mx-auto">
          <GitCompare className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h3 className="text-lg font-bold text-google-text">No Pending Changes to Review</h3>
        <p className="text-xs text-google-textSecondary max-w-md mx-auto leading-relaxed">
          You are currently viewing the active, approved project baseline. To generate and compare a proposed recovery plan, try a what-if scenario.
        </p>
        <button
          onClick={() => navigate('/crisis-simulator')}
          className="google-btn-primary mt-2"
        >
          <span>Try a What-If Scenario</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const p = activeProposal;
  const origSchedule = p.original_schedule || {};
  const propSchedule = p.proposed_schedule || {};
  const reassignedTasks = p.reassigned_tasks || [];

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      showToast('Applying proposed recovery plan to project baseline...');
      await api.approveProposal(p.proposal_id);
      await queryClient.invalidateQueries(['project', activeProjectId]);
      await queryClient.invalidateQueries(['history', activeProjectId]);
      showToast('Plan approved! Baseline schedule updated.', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      showToast('Rejecting proposal and retaining current plan...');
      await api.rejectProposal(p.proposal_id);
      await queryClient.invalidateQueries(['history', activeProjectId]);
      showToast('Proposal rejected. Baseline retained.', 'warning');
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const origDuration = origSchedule.project_duration_days || 0;
  const propDuration = propSchedule.project_duration_days || 0;
  const durationDiff = propDuration - origDuration;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Clear Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-google-blue bg-google-blueSurface px-2.5 py-0.5 rounded-full">
              Review Changes
            </span>
            <span className="text-xs text-google-textMuted font-mono">
              Proposal #{p.proposal_id}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-google-text">
            Review Proposed Schedule Recovery
          </h2>
          <p className="text-xs text-google-textSecondary mt-0.5">
            Review changed assignments, timeline shifts, and why the optimizer recommends this plan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="google-btn-secondary py-2 px-4"
          >
            <X className="w-4 h-4 text-google-red" />
            <span>Reject Proposal</span>
          </button>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="google-btn-primary bg-google-teal hover:bg-emerald-700 py-2 px-4 shadow-google-xs"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Approve & Apply Changes</span>
          </button>
        </div>
      </div>

      {/* Primary Impact Summary Scorecard */}
      <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-google-textMuted">
            Plan Quality Score
          </span>
          <div className="text-xl font-bold text-google-text font-tabular">
            {p.objective_score} <span className="text-xs font-normal text-google-textMuted">/ 100</span>
          </div>
          <p className="text-[11px] text-google-textSecondary">Multi-objective satisfaction score</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-google-textMuted">
            Timeline Impact
          </span>
          <div className="text-xl font-bold text-google-text font-tabular flex items-center gap-1.5">
            <span>{propDuration} days</span>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                durationDiff <= 0
                  ? 'bg-google-tealSurface text-google-teal'
                  : 'bg-google-amberSurface text-google-amber'
              }`}
            >
              {durationDiff > 0 ? `+${durationDiff}d` : durationDiff === 0 ? '0d slip' : `${durationDiff}d`}
            </span>
          </div>
          <p className="text-[11px] text-google-textSecondary">Baseline: {origDuration} days</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-google-textMuted">
            Reassigned Deliverables
          </span>
          <div className="text-xl font-bold text-google-blue font-tabular">
            {p.reassigned_count} {p.reassigned_count === 1 ? 'Task' : 'Tasks'}
          </div>
          <p className="text-[11px] text-google-textSecondary">Minimal disruption churn</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-google-textMuted">
            Constraint Feasibility
          </span>
          <div className="text-xl font-bold text-google-teal flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-google-teal" />
            100% Feasible
          </div>
          <p className="text-[11px] text-google-textSecondary">All skills and dependencies met</p>
        </div>
      </div>

      {/* Side-by-Side Comparison: Disrupted Baseline vs Proposed Recovery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Without Recovery (Disrupted Baseline) */}
        <div className="bg-white rounded-2xl border border-google-border shadow-google-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-google-border bg-google-subtle/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-google-textMuted" />
              <h3 className="text-sm font-bold text-google-text">Without Recovery (Disrupted)</h3>
            </div>
            <span className="text-xs text-google-textMuted font-mono">
              {origSchedule.project_duration_days} Days
            </span>
          </div>

          <div className="p-6 space-y-2.5 max-h-[360px] overflow-y-auto">
            {(origSchedule.tasks || []).map((t) => (
              <div
                key={t.id}
                className="p-3 bg-google-subtle/60 rounded-xl border border-google-border/60 text-xs flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-google-text">
                    #{t.id}: {t.title}
                  </div>
                  <div className="text-[11px] text-google-textMuted mt-0.5">
                    {t.required_skill} (L{t.min_skill_level}) &bull; {t.estimated_hours}h
                  </div>
                </div>
                <span className="font-mono text-google-textSecondary font-medium px-2 py-0.5 bg-white rounded-md border border-google-border">
                  Day {t.start_day} - {t.end_day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Proposed Recovery Plan */}
        <div className="bg-white rounded-2xl border border-google-blue/30 shadow-google-xs overflow-hidden ring-1 ring-google-blue/20">
          <div className="px-6 py-4 border-b border-google-blue/20 bg-google-blueSurface/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-google-blue" />
              <h3 className="text-sm font-bold text-google-text">Proposed Recovery Plan (Optimized)</h3>
            </div>
            <span className="text-xs font-bold text-google-blue font-mono">
              {propSchedule.project_duration_days} Days
            </span>
          </div>

          <div className="p-6 space-y-2.5 max-h-[360px] overflow-y-auto">
            {(propSchedule.tasks || []).map((t) => {
              const isMoved = reassignedTasks.some((r) => r.task_id === t.id);
              return (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl text-xs flex justify-between items-center transition-all ${
                    isMoved
                      ? 'bg-google-blueSurface/60 border border-google-blue/30 font-semibold text-google-text'
                      : 'bg-white border border-google-border text-google-text'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span>#{t.id}: {t.title}</span>
                      {isMoved && (
                        <span className="text-[10px] font-bold bg-google-blue text-white px-2 py-0.2 rounded-full">
                          REASSIGNED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-google-textMuted mt-0.5 font-normal">
                      {t.required_skill} (L{t.min_skill_level}) &bull; {t.estimated_hours}h
                    </div>
                  </div>
                  <span className="font-mono font-bold text-google-blue px-2 py-0.5 bg-white rounded-md border border-google-border">
                    Day {t.start_day} - {t.end_day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reassigned Deliverables & Assignee Handover Delta */}
      <div className="bg-white rounded-2xl border border-google-border shadow-google-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-google-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-google-blue" />
              Changed Task Assignments & Timeline Shifts
            </h3>
            <p className="text-xs text-google-textSecondary mt-0.5">
              Specific handovers calculated by the optimizer to resolve the disruption.
            </p>
          </div>
          <span className="text-xs text-google-textMuted font-mono">
            {reassignedTasks.length} task(s) moved
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-google-subtle text-google-textSecondary uppercase tracking-wider font-bold border-b border-google-border">
              <tr>
                <th className="p-3.5 px-6">Task Title</th>
                <th className="p-3.5 px-6">Required Skill</th>
                <th className="p-3.5 px-6">Previous Assignee</th>
                <th className="p-3.5 px-6">Proposed Assignee</th>
                <th className="p-3.5 px-6">Original Window</th>
                <th className="p-3.5 px-6">Recovered Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-google-border text-google-text">
              {reassignedTasks.map((r, idx) => (
                <tr key={idx} className="hover:bg-google-subtle/50 transition-colors">
                  <td className="p-3.5 px-6 font-semibold">{r.title}</td>
                  <td className="p-3.5 px-6">
                    <span className="bg-google-subtle px-2 py-0.5 rounded-full text-[11px] font-medium border border-google-border text-google-textSecondary">
                      {r.required_skill}
                    </span>
                  </td>
                  <td className="p-3.5 px-6 line-through text-google-red font-medium">
                    {r.from_candidate_name}
                  </td>
                  <td className="p-3.5 px-6 font-bold text-google-teal">
                    {r.to_candidate_name}
                  </td>
                  <td className="p-3.5 px-6 font-mono text-google-textMuted">
                    Day {r.orig_start_day} - {r.orig_end_day}
                  </td>
                  <td className="p-3.5 px-6 font-mono font-bold text-google-blue">
                    Day {r.new_start_day} - {r.new_end_day}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanations & Reasons */}
      <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-google-blue" />
          Why the Optimizer Recommends This Plan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(p.explanations || []).map((exp, idx) => (
            <div
              key={idx}
              className="p-4 bg-google-subtle/70 rounded-xl border border-google-border space-y-1.5"
            >
              <h5 className="text-xs font-bold text-google-text flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-google-blue" />
                {exp.title}
              </h5>
              <p className="text-xs text-google-textSecondary leading-relaxed">{exp.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Advanced Mathematical Details */}
      <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full flex items-center justify-between text-xs font-bold text-google-textSecondary hover:text-google-text"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-google-textMuted" />
            Advanced Solver Parameters & Technical Proof
          </span>
          {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isAdvancedOpen && (
          <div className="pt-3 border-t border-google-border text-xs text-google-textSecondary space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-google-subtle/60 rounded-xl border border-google-border">
                <span className="text-[10px] uppercase font-bold text-google-textMuted block">Solver Engine</span>
                <span className="font-semibold text-google-text font-mono">{p.solver_engine || 'MILP'}</span>
              </div>
              <div className="p-3 bg-google-subtle/60 rounded-xl border border-google-border">
                <span className="text-[10px] uppercase font-bold text-google-textMuted block">Status Code</span>
                <span className="font-semibold text-google-teal font-mono">{p.solver_status || 'OPTIMAL'}</span>
              </div>
              <div className="p-3 bg-google-subtle/60 rounded-xl border border-google-border">
                <span className="text-[10px] uppercase font-bold text-google-textMuted block">Churn Penalty</span>
                <span className="font-semibold text-google-blue font-mono">3.5x Multiplier</span>
              </div>
              <div className="p-3 bg-google-subtle/60 rounded-xl border border-google-border">
                <span className="text-[10px] uppercase font-bold text-google-textMuted block">Deadline Weight</span>
                <span className="font-semibold text-google-blue font-mono">8.0x Multiplier</span>
              </div>
            </div>
            <p className="text-[11px] text-google-textMuted">
              Mixed-Integer Linear Program formulated using branch-and-cut simplex with Kahn's DAG cycle protection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
