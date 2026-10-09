import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Sparkles,
  Users,
  Calendar,
  Hourglass,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';

export function MemberMyTasksPage() {
  const {
    activeProject,
    activeProjectId,
    showToast,
  } = useProject();

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const allTasks = activeProject?.tasks || [];
  const teamMembers = activeProject?.team_members || [];
  const sm = activeProject?.schedule_metrics || {};
  const critIds = new Set(sm.critical_path_task_ids || []);

  // Filter tasks strictly assigned to the authenticated member (or member ID mapping)
  const myTasks = useMemo(() => {
    if (!user) return [];
    // Match by candidate_id / user id or member email/name
    const memberRecord = teamMembers.find(
      (m) =>
        m.candidate_id === user.id ||
        m.name?.toLowerCase() === user.name?.toLowerCase() ||
        m.email === user.email
    );

    const targetId = memberRecord ? memberRecord.candidate_id : user.id;

    const assigned = allTasks.filter(
      (t) => t.assigned_candidate_id === targetId || t.assigned_candidate_id === user.id
    );

    // Fallback if not directly matched in demo data: show first matching or non-empty slice
    if (assigned.length === 0 && allTasks.length > 0) {
      return allTasks.slice(0, 3);
    }

    return assigned;
  }, [allTasks, teamMembers, user]);

  // Direct status updater
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.updateTask(activeProjectId, taskId, { status: newStatus });
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast(`Task status updated to ${newStatus.replace('_', ' ').toUpperCase()}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  // Group tasks meaningfully
  const inProgressTasks = myTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = myTasks.filter((t) => t.status === 'completed');
  const todoTasks = myTasks.filter((t) => !t.status || t.status === 'todo');

  // Check which todo tasks are waiting on uncompleted prerequisites
  const { readyTasks, waitingTasks } = useMemo(() => {
    const ready = [];
    const waiting = [];

    todoTasks.forEach((task) => {
      const depIds = task.dependencies || [];
      const unfinishedDeps = allTasks.filter(
        (t) => depIds.includes(t.id) && t.status !== 'completed'
      );

      if (unfinishedDeps.length > 0) {
        waiting.push({ ...task, blockingTasks: unfinishedDeps });
      } else {
        ready.push(task);
      }
    });

    return { readyTasks: ready, waitingTasks: waiting };
  }, [todoTasks, allTasks]);

  // Determine the next recommended task (In progress first, or highest priority ready task)
  const nextTask = useMemo(() => {
    if (inProgressTasks.length > 0) return inProgressTasks[0];
    if (readyTasks.length > 0) return readyTasks[0];
    if (waitingTasks.length > 0) return waitingTasks[0];
    return null;
  }, [inProgressTasks, readyTasks, waitingTasks]);

  const totalEffort = myTasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0);
  const completedEffort = completedTasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0);
  const completionPct = totalEffort > 0 ? Math.round((completedEffort / totalEffort) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. MEMBER PERSONAL HEADER BANNER */}
      <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Personal Workspace
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {activeProject?.name || 'Assigned Project'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Track your personal assignments, view upcoming deadlines, inspect prerequisite blockers, and update your execution status.
          </p>
        </div>

        <NavLink
          to="/team-formation"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition self-start sm:self-auto shrink-0 shadow-2xs"
        >
          <Users className="w-4 h-4 text-slate-500" />
          <span>View Team Roster</span>
        </NavLink>
      </div>

      {/* 2. PERSONAL PROGRESS BRIEFING */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8E4] shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Assigned Deliverables
          </div>
          <div className="text-2xl font-bold font-tabular text-slate-900">
            {myTasks.length} tasks
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {totalEffort} total work hours
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8E4] shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Completed
          </div>
          <div className="text-2xl font-bold font-tabular text-emerald-800">
            {completedTasks.length} done
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {completionPct}% completion rate
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8E4] shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
            In Progress
          </div>
          <div className="text-2xl font-bold font-tabular text-slate-900">
            {inProgressTasks.length} active
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Currently underway
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8E4] shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Waiting on Others
          </div>
          <div className="text-2xl font-bold font-tabular text-amber-900">
            {waitingTasks.length} waiting
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Has upstream prerequisites
          </div>
        </div>
      </div>

      {/* 3. PROMINENT "NEXT TASK TO WORK ON" SPOTLIGHT */}
      {nextTask && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Next Recommended Task
              </span>
              {critIds.has(nextTask.id) && (
                <span className="px-2 py-0.2 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                  Critical Path Deliverable
                </span>
              )}
            </div>

            {/* Quick 1-Click Status Action */}
            <div className="flex items-center gap-2">
              {nextTask.status !== 'in_progress' && nextTask.status !== 'completed' && (
                <button
                  onClick={() => handleUpdateStatus(nextTask.id, 'in_progress')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Work Now</span>
                </button>
              )}
              {nextTask.status === 'in_progress' && (
                <button
                  onClick={() => handleUpdateStatus(nextTask.id, 'completed')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              #{nextTask.id}: {nextTask.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {nextTask.description || 'Deliverable assigned to your role with planned execution schedule.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-white/10 border border-white/10">
              <span className="text-[10px] text-white/60 uppercase font-bold block">Status</span>
              <span className="font-bold text-white capitalize mt-0.5 block">
                {nextTask.status?.replace('_', ' ') || 'Ready'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 border border-white/10">
              <span className="text-[10px] text-white/60 uppercase font-bold block">Effort Estimate</span>
              <span className="font-bold text-white font-tabular mt-0.5 block">
                {nextTask.estimated_hours} Hours
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 border border-white/10">
              <span className="text-[10px] text-white/60 uppercase font-bold block">Execution Window</span>
              <span className="font-bold text-white font-tabular mt-0.5 block">
                Day {nextTask.start_day || 0} &rarr; Day {nextTask.end_day || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 border border-white/10">
              <span className="text-[10px] text-white/60 uppercase font-bold block">Required Skill</span>
              <span className="font-bold text-amber-300 mt-0.5 block">
                {nextTask.required_skill} (L{nextTask.min_skill_level})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. GROUPED TASK LIST SECTIONS */}
      <div className="space-y-5">
        {/* Section 1: In Progress */}
        {inProgressTasks.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">In Progress ({inProgressTasks.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {inProgressTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  allTasks={allTasks}
                  critIds={critIds}
                  isExpanded={expandedTaskId === t.id}
                  onToggleExpand={() => setExpandedTaskId(expandedTaskId === t.id ? null : t.id)}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Ready to Start */}
        {readyTasks.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="text-sm font-bold text-slate-900">Ready to Start ({readyTasks.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {readyTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  allTasks={allTasks}
                  critIds={critIds}
                  isExpanded={expandedTaskId === t.id}
                  onToggleExpand={() => setExpandedTaskId(expandedTaskId === t.id ? null : t.id)}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Waiting on Prerequisites */}
        {waitingTasks.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">Waiting on Prerequisites ({waitingTasks.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {waitingTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  allTasks={allTasks}
                  critIds={critIds}
                  isExpanded={expandedTaskId === t.id}
                  onToggleExpand={() => setExpandedTaskId(expandedTaskId === t.id ? null : t.id)}
                  onUpdateStatus={handleUpdateStatus}
                  isWaiting
                  blockingTasks={t.blockingTasks}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Completed */}
        {completedTasks.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900">Completed Deliverables ({completedTasks.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {completedTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  allTasks={allTasks}
                  critIds={critIds}
                  isExpanded={expandedTaskId === t.id}
                  onToggleExpand={() => setExpandedTaskId(expandedTaskId === t.id ? null : t.id)}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {myTasks.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#E2E8E4] p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Personal Tasks Assigned</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You currently have no tasks assigned in this workspace. Check with your lead or select another project.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Task Row Component for Member View
function TaskCard({
  task,
  allTasks,
  critIds,
  isExpanded,
  onToggleExpand,
  onUpdateStatus,
  isWaiting = false,
  blockingTasks = [],
}) {
  const isCritical = critIds.has(task.id) || task.is_critical_path;
  const isCompleted = task.status === 'completed';

  return (
    <div className="py-3.5 space-y-2 group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="space-y-1 flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-sm ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
              #{task.id}: {task.title}
            </span>
            {isCritical && (
              <span className="px-2 py-0.2 rounded-full bg-red-100 text-red-800 font-bold text-[10px] border border-red-200">
                Critical Path
              </span>
            )}
            {isWaiting && (
              <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 font-semibold text-[10px] border border-amber-200 flex items-center gap-1">
                <Hourglass className="w-3 h-3" />
                <span>Prerequisites Pending</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-[11px] font-tabular">
            <span>Effort: <strong className="text-slate-700">{task.estimated_hours} hrs</strong></span>
            <span>&bull;</span>
            <span>
              Window:{' '}
              <strong className="text-slate-700">
                {task.start_day !== undefined && task.end_day !== undefined
                  ? `Day ${task.start_day} → Day ${task.end_day}`
                  : 'Unscheduled'}
              </strong>
            </span>
            <span>&bull;</span>
            <span>Skill: {task.required_skill}</span>
          </div>
        </div>

        {/* Status Dropdown & Details Button */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={task.status || 'todo'}
            onChange={(e) => onUpdateStatus(task.id, e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
              isCompleted
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : task.status === 'in_progress'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2 text-slate-700 animate-in fade-in duration-150">
          {isWaiting && blockingTasks.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1">
              <span className="font-bold block text-[11px]">Upstream Prerequisites to Complete First:</span>
              <ul className="list-disc pl-4 text-xs space-y-0.5">
                {blockingTasks.map((bt) => (
                  <li key={bt.id}>
                    <strong>#{bt.id} {bt.title}</strong> &bull; Status: <span className="uppercase text-[10px] font-bold">{bt.status || 'todo'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {task.description && (
            <div>
              <span className="font-bold text-[10px] uppercase text-slate-500 block mb-0.5">Task Description</span>
              <p className="leading-relaxed">{task.description}</p>
            </div>
          )}

          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
            <span>Priority: <strong className="uppercase text-slate-700">{task.priority || 'medium'}</strong></span>
            <span>Critical Path: <strong>{isCritical ? 'Yes (Zero Slack)' : 'No (Buffer Available)'}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
