import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Gauge,
  GitCommit,
  ShieldCheck,
  Sparkles,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { AddTaskModal } from '../components/modals/AddTaskModal';

export function OverviewPage() {
  const { activeProject, isProjectLoading, activeProposal } = useProject();
  const navigate = useNavigate();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  if (isProjectLoading || !activeProject) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-500">
        Loading project details...
      </div>
    );
  }

  const sm = activeProject.schedule_metrics || {};
  const tasks = activeProject.tasks || [];
  const teamMembers = activeProject.team_members || [];
  const critIds = new Set(sm.critical_path_task_ids || []);
  const critTasks = tasks.filter((t) => critIds.has(t.id));

  const projectDuration = sm.project_duration_days || 0;
  const deadlineDays = activeProject.deadline_days || 30;
  const isOverDeadline = projectDuration > deadlineDays;

  // Next action recommendation
  let nextAction = {
    title: 'Test a What-If Recovery Scenario',
    description: 'Simulate developer outages or compressed timelines to inspect automated rebalancing options.',
    buttonText: 'Simulate Scenario',
    onClick: () => navigate('/recovery'),
  };

  if (teamMembers.length === 0) {
    nextAction = {
      title: 'Form & Confirm Project Team',
      description: 'Use the Smart Team Formation engine to assemble candidate specialists based on project skill requirements.',
      buttonText: 'Build Team',
      onClick: () => navigate('/team-formation'),
    };
  } else if (projectDuration === 0) {
    nextAction = {
      title: 'Generate Schedule (CPM)',
      description: 'Compute start/end dates and calculate the critical path for your deliverables.',
      buttonText: 'Generate Schedule',
      onClick: () => navigate('/task-planning'),
    };
  } else if (activeProposal) {
    nextAction = {
      title: 'Review Pending Recovery Proposal',
      description: 'A calculated recovery plan is waiting for your review. Inspect changes and approve or reject.',
      buttonText: 'Review Recovery',
      onClick: () => navigate('/recovery'),
    };
  }

  return (
    <div className="space-y-6">
      {/* Project Summary Banner */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="badge bg-[#202724]/10 text-[#202724] font-bold uppercase tracking-wider text-[10px]">
              Active Project
            </span>
            <span className="badge bg-amber-50 text-amber-900 border border-amber-200 font-tabular text-xs">
              Target Deadline: {deadlineDays} Days
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight">
            {activeProject.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            {activeProject.description || 'Enterprise project workspace with automated resource balancing and critical path analysis.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="btn-secondary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add task</span>
          </button>
          <button
            onClick={nextAction.onClick}
            className="btn-primary text-xs inline-flex items-center gap-2"
          >
            <span>{nextAction.buttonText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Important Next Action / Health Proposal Banner */}
      <div className="bg-gradient-to-r from-[#202724] to-[#2C3631] text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Strategic Recommended Action
          </div>
          <div className="font-serif text-lg font-normal text-white">{nextAction.title}</div>
          <div className="text-xs text-white/75 max-w-xl">{nextAction.description}</div>
        </div>

        <button
          onClick={nextAction.onClick}
          className="inline-flex items-center justify-between gap-3 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all z-10 flex-shrink-0 shadow-lg"
        >
          <span>{nextAction.buttonText}</span>
          <ArrowRight className="w-4 h-4 text-slate-900" />
        </button>
      </div>

      {/* Key Project Summary Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/95 p-5 rounded-2xl border border-[#D5DED8] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Calculated Duration
          </div>
          <div className="text-2xl font-serif font-normal text-slate-900 font-tabular">
            {projectDuration > 0 ? `${projectDuration} days` : 'Not computed'}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Target: {deadlineDays} days {isOverDeadline && (
              <span className="text-red-600 font-bold ml-1">(Overdue)</span>
            )}
          </div>
        </div>

        <div className="bg-white/95 p-5 rounded-2xl border border-[#D5DED8] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Team Members
          </div>
          <div className="text-2xl font-serif font-normal text-slate-900 font-tabular">
            {teamMembers.length}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Target: {activeProject.target_team_size || 4} specialists
          </div>
        </div>

        <div className="bg-white/95 p-5 rounded-2xl border border-[#D5DED8] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Total Tasks
          </div>
          <div className="text-2xl font-serif font-normal text-slate-900 font-tabular">
            {tasks.length}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Work Breakdown Structure
          </div>
        </div>

        <div className="bg-white/95 p-5 rounded-2xl border border-[#D5DED8] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Critical Path Tasks
          </div>
          <div className="text-2xl font-serif font-normal text-slate-900 font-tabular">
            {critTasks.length}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Zero-slack dependency sequence
          </div>
        </div>
      </div>

      {/* 2-Column: Critical Path List & Confirmed Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Path Tasks */}
        <div className="bg-white/95 rounded-2xl border border-[#D5DED8] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EAE5]">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              Critical Path Tasks ({critTasks.length})
            </h3>
            <button
              onClick={() => navigate('/task-planning')}
              className="text-xs text-slate-700 hover:text-slate-900 font-semibold underline underline-offset-2"
            >
              View Gantt &rarr;
            </button>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {critTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No critical path tasks identified. Generate a schedule in the Tasks tab.</p>
            ) : (
              critTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE4DF] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900">#{t.id}: {t.title}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t.required_skill} &bull; {t.estimated_hours}h estimated
                    </div>
                  </div>
                  <span className="badge bg-red-50 text-red-800 border border-red-200 font-semibold font-tabular">
                    Day {t.start_day}-{t.end_day}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Confirmed Team */}
        <div className="bg-white/95 rounded-2xl border border-[#D5DED8] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EAE5]">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              Confirmed Team ({teamMembers.length})
            </h3>
            <button
              onClick={() => navigate('/team-formation')}
              className="text-xs text-slate-700 hover:text-slate-900 font-semibold underline underline-offset-2"
            >
              Manage Team &rarr;
            </button>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {teamMembers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                <p>No team confirmed yet.</p>
                <button
                  onClick={() => navigate('/team-formation')}
                  className="btn-primary text-xs"
                >
                  Build team
                </button>
              </div>
            ) : (
              teamMembers.map((m) => (
                <div
                  key={m.candidate_id}
                  className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE4DF] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{m.name}</span>
                    <span className="text-slate-500 ml-2">({m.role_title})</span>
                  </div>
                  <span className="badge bg-[#202724]/10 text-slate-800 font-medium">
                    {m.experience_years} yrs exp &bull; {m.weekly_capacity_hours || 40}h/wk
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isAddTaskOpen && <AddTaskModal onClose={() => setIsAddTaskOpen(false)} />}
    </div>
  );
}
