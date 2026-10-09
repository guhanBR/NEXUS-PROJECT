import React from 'react';
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
} from 'lucide-react';
import { api } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';

export function RebalanceDiffPage() {
  const { activeProposal, activeProjectId, showToast } = useProject();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!activeProposal) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <GitCompare className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">No Active Rebalancing Proposal</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please run a scenario in the Crisis Simulator to generate a before-and-after rebalancing plan.
        </p>
        <button
          onClick={() => navigate('/crisis-simulator')}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
        >
          Go to Crisis Simulator &rarr;
        </button>
      </div>
    );
  }

  const p = activeProposal;
  const origSchedule = p.original_schedule || {};
  const propSchedule = p.proposed_schedule || {};
  const reassignedTasks = p.reassigned_tasks || [];

  const handleApprove = async () => {
    try {
      showToast('Approving proposed plan and persisting state...');
      await api.approveProposal(p.proposal_id);
      await queryClient.invalidateQueries(['project', activeProjectId]);
      await queryClient.invalidateQueries(['history', activeProjectId]);
      showToast('Plan approved and active project baseline updated!', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReject = async () => {
    try {
      showToast('Rejecting proposal...');
      await api.rejectProposal(p.proposal_id);
      await queryClient.invalidateQueries(['history', activeProjectId]);
      showToast('Proposal rejected. Baseline retained.', 'warning');
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Rebalancing Proposal & Diff Comparison</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Inspect the proposed reallocation, evaluate timeline shifts, and approve or reject the plan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReject}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <X className="w-4 h-4 text-rose-600" /> Reject Proposed Plan
          </button>
          <button
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <CheckCheck className="w-4 h-4" /> Approve & Persist Plan
          </button>
        </div>
      </div>

      {/* Proposal Summary Scorecard */}
      <div className="bg-gradient-to-r from-slate-50 via-emerald-50 to-teal-50 border border-emerald-300/80 rounded-xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            Solver: {p.solver_status?.toUpperCase() || 'OPTIMAL'} ({p.solver_engine || 'Constraint MILP Engine'})
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Proposal #{p.proposal_id}: Reallocated {p.reassigned_count} deliverable(s) with {p.objective_score}/100
            Objective Score
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Original Duration: <strong>{origSchedule.project_duration_days || 0}d</strong> &rarr; Proposed Duration:{' '}
            <strong>{propSchedule.project_duration_days || 0}d</strong> &bull; Churn: {p.reassigned_count} task(s)
          </p>
        </div>
      </div>

      {/* Split Comparison Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Plan */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" /> Baseline Plan (Original)
          </h4>
          <p className="text-xs text-slate-500 font-mono">
            Makespan: {origSchedule.project_duration_days} days &bull; Tasks: {(origSchedule.tasks || []).length}
          </p>
          <div className="space-y-2 mt-2">
            {(origSchedule.tasks || []).map((t) => (
              <div
                key={t.id}
                className="p-2.5 bg-white rounded-lg border border-slate-200/80 text-xs flex justify-between items-center text-slate-700"
              >
                <span>
                  #{t.id}: {t.title}
                </span>
                <span className="font-mono text-slate-500">Day {t.start_day}-{t.end_day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proposed Plan */}
        <div className="bg-emerald-50/50 rounded-xl border border-emerald-300 p-6 space-y-3">
          <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Proposed Plan (Optimized)
          </h4>
          <p className="text-xs text-emerald-700 font-mono">
            Makespan: {propSchedule.project_duration_days} days &bull; Tasks: {(propSchedule.tasks || []).length}
          </p>
          <div className="space-y-2 mt-2">
            {(propSchedule.tasks || []).map((t) => {
              const isMoved = reassignedTasks.some((r) => r.task_id === t.id);
              return (
                <div
                  key={t.id}
                  className={`p-2.5 rounded-lg text-xs flex justify-between items-center ${
                    isMoved
                      ? 'bg-emerald-100/70 border border-emerald-300 font-semibold text-emerald-950'
                      : 'bg-white border border-slate-200/80 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    #{t.id}: {t.title}
                    {isMoved && (
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                        REASSIGNED
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-emerald-800">Day {t.start_day}-{t.end_day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reassigned Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-blue-600" /> Reassigned Tasks & Timeline Delta
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 px-6">Task Title</th>
                <th className="p-3.5 px-6">Required Skill</th>
                <th className="p-3.5 px-6">Previous Assignee</th>
                <th className="p-3.5 px-6">Proposed Assignee</th>
                <th className="p-3.5 px-6">Original Slot</th>
                <th className="p-3.5 px-6">New Slot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {reassignedTasks.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3.5 px-6 font-semibold">{r.title}</td>
                  <td className="p-3.5 px-6">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                      {r.required_skill}
                    </span>
                  </td>
                  <td className="p-3.5 px-6 line-through text-rose-500">{r.from_candidate_name}</td>
                  <td className="p-3.5 px-6 font-bold text-emerald-700">{r.to_candidate_name}</td>
                  <td className="p-3.5 px-6 font-mono text-slate-500">Day {r.orig_start_day}-{r.orig_end_day}</td>
                  <td className="p-3.5 px-6 font-mono font-bold text-blue-600">
                    Day {r.new_start_day}-{r.new_end_day}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Rationales & Explanations */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-600" /> Transparent Decision Rationales & Evidence
        </h3>

        <div className="space-y-3">
          {(p.explanations || []).map((exp, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border-l-4 border-blue-600 space-y-1">
              <h5 className="text-xs font-bold text-slate-900">{exp.title}</h5>
              <p className="text-xs text-slate-600 leading-relaxed">{exp.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Notes */}
      {(p.risks || []).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" /> Solver Risk & Feasibility Notes
          </h3>
          <div className="space-y-1.5 text-xs text-slate-600">
            {p.risks.map((rk, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{rk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
