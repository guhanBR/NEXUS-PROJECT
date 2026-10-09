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
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  UserPlus,
  Plus,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { AddTaskModal } from '../components/modals/AddTaskModal';
import { AddMemberModal } from '../components/modals/AddMemberModal';

export function OverviewPage() {
  const { activeProject, isProjectLoading, activeProjectId, activeProposal, members } = useProject();
  const navigate = useNavigate();

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const { data: history = [] } = useQuery({
    queryKey: ['history', activeProjectId],
    queryFn: () => api.getHistory(activeProjectId),
    enabled: !!activeProjectId,
  });

  if (isProjectLoading || !activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-google-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sm = activeProject.schedule_metrics || {};
  const tasks = activeProject.tasks || [];
  const teamMembers = activeProject.team_members || [];
  const critIds = new Set(sm.critical_path_task_ids || []);
  const critTasks = tasks.filter((t) => critIds.has(t.id));

  // Avg utilization
  const resUtils = Object.values(sm.resource_utilization || {});
  const avgUtil =
    resUtils.length > 0
      ? Math.round(resUtils.reduce((a, b) => a + (b.utilization_pct || 0), 0) / resUtils.length)
      : 0;

  const projectDuration = sm.project_duration_days || 0;
  const deadlineDays = activeProject.deadline_days || 30;
  const isOverDeadline = projectDuration > deadlineDays;

  // Real data-driven "Get Started" checklist
  const hasProject = Boolean(activeProject);
  const hasCandidates = members.length > 0;
  const hasTasks = tasks.length > 0;
  const hasTeam = teamMembers.length > 0;
  const hasSchedule = projectDuration > 0;
  const hasSimulated = Boolean(activeProposal);
  const hasApproved = history.some((h) => h.action_taken === 'APPROVED');

  const checklist = [
    {
      id: 1,
      title: 'Create or choose a project',
      description: `Active: "${activeProject.name}" (${deadlineDays}d deadline)`,
      completed: hasProject,
      actionText: 'Switch Project',
      action: () => {},
    },
    {
      id: 2,
      title: 'Add people and skills',
      description: `${members.length} candidates in talent pool`,
      completed: hasCandidates,
      actionText: 'Add Candidate',
      action: () => setIsAddMemberOpen(true),
    },
    {
      id: 3,
      title: 'Define tasks & dependencies',
      description: `${tasks.length} task(s) configured`,
      completed: hasTasks,
      actionText: 'Add Task',
      action: () => setIsAddTaskOpen(true),
    },
    {
      id: 4,
      title: 'Review and confirm team',
      description: hasTeam
        ? `${teamMembers.length} members confirmed`
        : 'Form optimal team with AI matching',
      completed: hasTeam,
      actionText: 'Build Team',
      action: () => navigate('/team-formation'),
    },
    {
      id: 5,
      title: 'Generate schedule (CPM)',
      description: hasSchedule
        ? `Timeline computed: ${projectDuration} days`
        : 'Calculate Critical Path schedule',
      completed: hasSchedule,
      actionText: 'View Schedule',
      action: () => navigate('/task-planning'),
    },
    {
      id: 6,
      title: 'Try a what-if scenario',
      description: hasSimulated
        ? 'Active proposal ready for review'
        : 'Test sudden outages or compressed deadlines',
      completed: hasSimulated,
      actionText: 'Simulate',
      action: () => navigate('/crisis-simulator'),
    },
    {
      id: 7,
      title: 'Review and approve changes',
      description: hasApproved
        ? 'Decision recorded in audit history'
        : 'Inspect before-and-after recovery diff',
      completed: hasApproved,
      actionText: hasSimulated ? 'Review Diff' : 'View History',
      action: () => (hasSimulated ? navigate('/rebalance-diff') : navigate('/decision-audit')),
    },
  ];

  const completedCount = checklist.filter((c) => c.completed).length;
  const progressPct = Math.round((completedCount / checklist.length) * 100);

  // Determine the next recommended action for the user
  let nextAction = {
    title: 'Simulate a Disruption Scenario',
    description: 'Test how RebalanceX automatically rebalances work when someone gets sick or deadlines change.',
    buttonText: 'Try a What-If Scenario',
    onClick: () => navigate('/crisis-simulator'),
  };

  if (!hasTeam) {
    nextAction = {
      title: 'Build & Confirm Project Team',
      description: 'Run the Smart Team Formation engine to assemble the best team matching project skill requirements.',
      buttonText: 'Build Team Now',
      onClick: () => navigate('/team-formation'),
    };
  } else if (!hasSchedule) {
    nextAction = {
      title: 'Generate Critical Path Schedule',
      description: 'Calculate start and finish dates for all project tasks with dependency chain analysis.',
      buttonText: 'Calculate Schedule',
      onClick: () => navigate('/task-planning'),
    };
  } else if (hasSimulated && !hasApproved) {
    nextAction = {
      title: 'Review Pending Rebalancing Proposal',
      description: 'An autonomous rebalancing plan is waiting for your review. Inspect changed assignments before approving.',
      buttonText: 'Review Proposed Changes',
      onClick: () => navigate('/rebalance-diff'),
    };
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-google-blue bg-google-blueSurface px-2.5 py-0.5 rounded-full">
              Overview
            </span>
            <span className="text-xs text-google-teal font-medium flex items-center gap-1 bg-google-tealSurface px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-google-teal" /> Saved Baseline
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-google-text">
            {activeProject.name}
          </h2>
          <p className="text-xs text-google-textSecondary mt-0.5">
            {activeProject.description || 'Enterprise project workspace with automated resource balancing.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="google-btn-secondary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
          <button
            onClick={nextAction.onClick}
            className="google-btn-primary"
          >
            <Sparkles className="w-4 h-4" />
            <span>{nextAction.buttonText}</span>
          </button>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      <div className="bg-white rounded-2xl border border-google-blue/30 shadow-google-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ring-1 ring-google-blue/10">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-google-blue flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Recommended Next Action
          </span>
          <h3 className="text-sm font-bold text-google-text">{nextAction.title}</h3>
          <p className="text-xs text-google-textSecondary">{nextAction.description}</p>
        </div>
        <button
          onClick={nextAction.onClick}
          className="google-btn-primary self-start sm:self-auto text-xs px-4 py-2"
        >
          <span>{nextAction.buttonText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Makespan */}
        <div className="bg-white p-5 rounded-2xl border border-google-border shadow-google-xs">
          <div className="flex items-center justify-between text-google-textMuted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Project Duration</span>
            <div className="w-7 h-7 rounded-full bg-google-blueSurface text-google-blue flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-google-text font-tabular">
            {projectDuration > 0 ? `${projectDuration} days` : 'Not computed'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-google-textSecondary mt-1">
            <span>Target: {deadlineDays} days</span>
            {isOverDeadline ? (
              <span className="text-[10px] font-bold text-google-red bg-google-redSurface px-1.5 py-0.2 rounded-full">
                Exceeds Deadline
              </span>
            ) : (
              <span className="text-[10px] font-bold text-google-teal bg-google-tealSurface px-1.5 py-0.2 rounded-full">
                Within Deadline
              </span>
            )}
          </div>
        </div>

        {/* Team Utilization */}
        <div className="bg-white p-5 rounded-2xl border border-google-border shadow-google-xs">
          <div className="flex items-center justify-between text-google-textMuted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Team Workload</span>
            <div className="w-7 h-7 rounded-full bg-google-tealSurface text-google-teal flex items-center justify-center">
              <Gauge className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-google-text font-tabular">
            {teamMembers.length > 0 ? `${avgUtil}%` : 'No team yet'}
          </div>
          <div className="text-xs text-google-teal font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Balanced allocation
          </div>
        </div>

        {/* Critical Path Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-google-border shadow-google-xs">
          <div className="flex items-center justify-between text-google-textMuted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Critical Path</span>
            <div className="w-7 h-7 rounded-full bg-google-redSurface text-google-red flex items-center justify-center">
              <GitCommit className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-google-text font-tabular">
            {critTasks.length} {critTasks.length === 1 ? 'Task' : 'Tasks'}
          </div>
          <div className="text-xs text-google-textMuted mt-1">Zero-slack delivery sequence</div>
        </div>

        {/* Team Size */}
        <div className="bg-white p-5 rounded-2xl border border-google-border shadow-google-xs">
          <div className="flex items-center justify-between text-google-textMuted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Active Team</span>
            <div className="w-7 h-7 rounded-full bg-google-subtle text-google-blue flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-google-text font-tabular">
            {teamMembers.length} {teamMembers.length === 1 ? 'Specialist' : 'Specialists'}
          </div>
          <div className="text-xs text-google-blue font-medium mt-1">
            Target: {activeProject.target_team_size || 4} members
          </div>
        </div>
      </div>

      {/* 2-Column: Get Started Checklist + Key Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Get Started Checklist */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-google-blue" />
                Getting Started Checklist
              </h3>
              <p className="text-xs text-google-textSecondary mt-0.5">
                Complete these 7 steps to master project planning & autonomous rebalancing.
              </p>
            </div>
            <span className="text-xs font-bold text-google-blue font-tabular bg-google-blueSurface px-2.5 py-1 rounded-full">
              {completedCount} / {checklist.length} Done ({progressPct}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-google-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-google-blue rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="divide-y divide-google-border/60">
            {checklist.map((step) => (
              <div
                key={step.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-google-subtle/40 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-google-teal flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-google-textMuted flex-shrink-0 stroke-[1.5]" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-google-text flex items-center gap-2">
                      <span>{step.id}. {step.title}</span>
                      {step.completed && (
                        <span className="text-[10px] text-google-teal font-bold bg-google-tealSurface px-1.5 py-0.2 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-google-textSecondary">{step.description}</p>
                  </div>
                </div>

                <button
                  onClick={step.action}
                  className="google-btn-secondary py-1 px-2.5 text-xs flex-shrink-0"
                >
                  <span>{step.actionText}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Critical Path & Team Snapshot */}
        <div className="lg:col-span-5 space-y-6">
          {/* Critical Path Tasks */}
          <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
                <Clock className="w-4 h-4 text-google-blue" />
                Critical Path Deliverables
              </h3>
              <button
                onClick={() => navigate('/task-planning')}
                className="text-xs font-semibold text-google-blue hover:underline"
              >
                Gantt Timeline &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {critTasks.length === 0 ? (
                <p className="text-xs text-google-textMuted">No critical path tasks identified.</p>
              ) : (
                critTasks.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-google-subtle/60 rounded-xl border border-google-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-google-text truncate">
                        #{t.id}: {t.title}
                      </div>
                      <div className="text-[11px] text-google-textMuted mt-0.5">
                        {t.required_skill} (L{t.min_skill_level}) &bull; {t.estimated_hours}h
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-google-red bg-google-redSurface px-2 py-0.5 rounded-full font-mono whitespace-nowrap">
                      Day {t.start_day}-{t.end_day}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Team Workload Snapshot */}
          <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
                <Users className="w-4 h-4 text-google-blue" />
                Team Workload Snapshot
              </h3>
              <button
                onClick={() => navigate('/resource-matrix')}
                className="text-xs font-semibold text-google-blue hover:underline"
              >
                Full Workload &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {teamMembers.length === 0 ? (
                <div className="text-center py-4 text-xs text-google-textMuted space-y-2">
                  <p>No team confirmed yet.</p>
                  <button
                    onClick={() => navigate('/team-formation')}
                    className="google-btn-secondary text-xs"
                  >
                    Build Team &rarr;
                  </button>
                </div>
              ) : (
                teamMembers.slice(0, 4).map((m) => {
                  const util = sm.resource_utilization?.[m.candidate_id] || {
                    assigned_hours: 0,
                    capacity_hours: 160,
                    utilization_pct: 0,
                  };
                  const pct = Math.min(100, util.utilization_pct || 0);

                  return (
                    <div key={m.candidate_id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-google-text truncate">{m.name}</span>
                        <span className="text-google-textSecondary font-tabular">
                          {util.assigned_hours}h / {util.capacity_hours}h
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-google-subtle rounded-full overflow-hidden">
                        <div
                          className="h-full bg-google-teal rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals for Direct Creation from Overview */}
      {isAddTaskOpen && <AddTaskModal onClose={() => setIsAddTaskOpen(false)} />}
      {isAddMemberOpen && <AddMemberModal onClose={() => setIsAddMemberOpen(false)} />}
    </div>
  );
}
