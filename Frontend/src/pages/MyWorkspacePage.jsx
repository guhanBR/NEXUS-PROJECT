import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  CheckSquare,
  Clock,
  Calendar,
  AlertCircle,
  Briefcase,
  Activity,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  CircleDot,
  Hourglass,
  Sparkles,
} from 'lucide-react';

export function MyWorkspacePage() {
  const { user } = useAuth();
  const { activeProject, activeProjectId, showToast } = useProject();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const tasks = activeProject?.tasks || [];
  const teamMembers = activeProject?.team_members || [];

  // Find member representation in the active project
  const memberInProject = teamMembers.find(
    (m) =>
      m.candidate_id === user?.id ||
      m.email?.toLowerCase() === user?.email?.toLowerCase() ||
      m.name?.toLowerCase() === user?.name?.toLowerCase()
  );

  const myCandidateId = memberInProject?.candidate_id || user?.id;

  // Filter tasks assigned to this authenticated member
  const myTasks = tasks.filter((t) => t.assigned_candidate_id === myCandidateId);

  // Status filtered tasks
  const filteredTasks = myTasks.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const todoTasks = myTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = myTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = myTasks.filter((t) => t.status === 'completed');

  // Workload calculations
  const assignedHours = myTasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0);
  const capacityHours = user?.weekly_capacity_hours || 40;
  const utilPct = Math.min(100, Math.round((assignedHours / (capacityHours * 4)) * 100)); // 4-week sprint

  const handleUpdateStatus = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    try {
      showToast(`Updating task #${taskId} status to "${newStatus}"...`);
      await api.updateTask(taskId, { status: newStatus });
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast(`Task #${taskId} updated successfully!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update task status.', 'error');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-google-blue bg-google-blueSurface px-2.5 py-0.5 rounded-full">
              My Workspace
            </span>
            <span className="text-xs text-google-textMuted font-mono">
              {user?.name} &bull; {memberInProject?.role_in_project || user?.role_title || 'Engineer'}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-google-text">
            Personal Task Dashboard
          </h2>
          <p className="text-xs text-google-textSecondary mt-0.5">
            View your active assignments in <strong>{activeProject?.name}</strong>, update progress statuses, and manage workload.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-white border border-google-border rounded-2xl shadow-google-xs flex items-center gap-3 text-xs">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: user?.avatar_color || '#0B57D0' }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <span className="font-bold text-google-text block">{user?.name}</span>
              <span className="text-[11px] text-google-teal font-medium">
                Project Role: {memberInProject?.role_in_project || user?.role_title || 'Contributor'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-google-border shadow-google-xs">
          <div className="flex items-center justify-between text-google-textMuted text-xs font-bold uppercase tracking-wider mb-2">
            <span>My Deliverables</span>
            <div className="w-7 h-7 rounded-full bg-google-blueSurface text-google-blue flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-google-text font-tabular">
            {myTasks.length} {myTasks.length === 1 ? 'Task' : 'Tasks'}
          </div>
          <div className="text-xs text-google-textSecondary mt-1">
            {inProgressTasks.length} In Progress &bull; {completedTasks.length} Done
          </div>
        </div>

        {/* Assigned Hours vs Sprint Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-google-border shadow-google-xs">
          <div className="flex items-center justify-between text-google-textMuted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Sprint Workload</span>
            <div className="w-7 h-7 rounded-full bg-google-tealSurface text-google-teal flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-google-text font-tabular">
            {assignedHours}h <span className="text-xs font-normal text-google-textMuted">/ {capacityHours * 4}h</span>
          </div>
          <div className="text-xs text-google-teal font-medium mt-1">
            {utilPct}% capacity utilization (4-wk sprint)
          </div>
        </div>

        {/* Critical Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-google-border shadow-google-xs">
          <div className="flex items-center justify-between text-google-textMuted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Critical Path Work</span>
            <div className="w-7 h-7 rounded-full bg-google-redSurface text-google-red flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-google-text font-tabular">
            {myTasks.filter((t) => t.is_critical_path).length} Deliverables
          </div>
          <div className="text-xs text-google-red font-medium mt-1">
            Directly impacts project completion date
          </div>
        </div>

        {/* Project Target Deadline */}
        <div className="bg-white p-5 rounded-2xl border border-google-border shadow-google-xs">
          <div className="flex items-center justify-between text-google-textMuted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Project Target</span>
            <div className="w-7 h-7 rounded-full bg-google-subtle text-google-blue flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-google-text font-tabular">
            {activeProject?.deadline_days || 30} Days
          </div>
          <div className="text-xs text-google-textSecondary mt-1">
            Makespan: {activeProject?.schedule_metrics?.project_duration_days || 0} days
          </div>
        </div>
      </div>

      {/* Interactive My Tasks Table with Live Status Controls */}
      <div className="bg-white rounded-2xl border border-google-border shadow-google-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-google-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-google-blue" />
              My Assigned Deliverables
            </h3>
            <p className="text-xs text-google-textSecondary mt-0.5">
              Update task progress status directly to keep the project schedule up to date.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-google-subtle rounded-xl border border-google-border text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-white text-google-text font-semibold shadow-xs'
                  : 'text-google-textSecondary hover:text-google-text'
              }`}
            >
              All ({myTasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('todo')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'todo'
                  ? 'bg-white text-google-text font-semibold shadow-xs'
                  : 'text-google-textSecondary hover:text-google-text'
              }`}
            >
              To Do ({todoTasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'in_progress'
                  ? 'bg-white text-google-text font-semibold shadow-xs'
                  : 'text-google-textSecondary hover:text-google-text'
              }`}
            >
              In Progress ({inProgressTasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'completed'
                  ? 'bg-white text-google-text font-semibold shadow-xs'
                  : 'text-google-textSecondary hover:text-google-text'
              }`}
            >
              Completed ({completedTasks.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-google-subtle text-google-textSecondary uppercase tracking-wider font-bold border-b border-google-border">
              <tr>
                <th className="p-3.5 px-6">ID</th>
                <th className="p-3.5 px-6">Task Title & Description</th>
                <th className="p-3.5 px-6">Skill Requirement</th>
                <th className="p-3.5 px-6">Effort (Hours)</th>
                <th className="p-3.5 px-6">Schedule Window</th>
                <th className="p-3.5 px-6">Priority</th>
                <th className="p-3.5 px-6">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-google-border text-google-text">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-google-textMuted">
                    No tasks matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isUpdating = updatingTaskId === t.id;
                  const isCrit = t.is_critical_path;

                  return (
                    <tr key={t.id} className="hover:bg-google-subtle/50 transition-colors">
                      <td className="p-3.5 px-6 font-bold text-google-text font-mono">#{t.id}</td>
                      <td className="p-3.5 px-6">
                        <div className="font-semibold text-google-text flex items-center gap-2">
                          <span>{t.title}</span>
                          {isCrit && (
                            <span className="text-[10px] font-bold text-google-red bg-google-redSurface px-2 py-0.2 rounded-full">
                              Critical Path
                            </span>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-[11px] text-google-textMuted mt-0.5 max-w-sm truncate">
                            {t.description}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5 px-6">
                        <span className="text-[11px] font-medium bg-google-subtle px-2 py-0.5 rounded-md border border-google-border text-google-text">
                          {t.required_skill} L{t.min_skill_level}
                        </span>
                      </td>
                      <td className="p-3.5 px-6 font-mono text-google-textSecondary">
                        <strong>{t.estimated_hours}h</strong>
                      </td>
                      <td className="p-3.5 px-6 font-mono text-google-textSecondary">
                        Day {t.start_day} - {t.end_day}
                      </td>
                      <td className="p-3.5 px-6">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded-full ${
                            t.priority === 'critical'
                              ? 'bg-google-redSurface text-google-red'
                              : t.priority === 'high'
                              ? 'bg-google-amberSurface text-google-amber'
                              : 'bg-google-blueSurface text-google-blue'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="p-3.5 px-6">
                        {/* Status Switcher Select */}
                        <select
                          value={t.status || 'todo'}
                          disabled={isUpdating}
                          onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-google-blue cursor-pointer transition ${
                            t.status === 'completed'
                              ? 'bg-google-tealSurface text-google-teal border-google-teal/30'
                              : t.status === 'in_progress'
                              ? 'bg-google-blueSurface text-google-blue border-google-blue/30'
                              : 'bg-white text-google-text border-google-border'
                          }`}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
