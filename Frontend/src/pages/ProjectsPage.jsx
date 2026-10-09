import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Plus, ArrowRight, FolderKanban, Shield, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { NewProjectModal } from '../components/modals/NewProjectModal';

export function ProjectsPage() {
  const { projects, setActiveProjectId, isProjectLoading } = useProject();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  // Filter projects if user is scoped, otherwise show authorized projects
  const authorizedProjects = projects;

  const handleOpenProject = (projectId) => {
    setActiveProjectId(projectId);
    navigate('/overview');
  };

  const onTrackCount = authorizedProjects.filter((p) => {
    const sm = p.schedule_metrics || {};
    const duration = sm.project_duration_days || 0;
    const deadline = p.deadline_days || 30;
    return duration > 0 && duration <= deadline;
  }).length;

  const riskCount = authorizedProjects.filter((p) => {
    const sm = p.schedule_metrics || {};
    const duration = sm.project_duration_days || 0;
    const deadline = p.deadline_days || 30;
    return duration > deadline;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge bg-[#202724]/10 text-[#202724] font-bold uppercase tracking-wider text-[10px]">
              Directory
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Enterprise Portfolio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Project Directory &amp; Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Select a project to inspect team allocations, critical path deliverables, and simulated recovery plans.
          </p>
        </div>

        {role !== 'member' && (
          <button
            onClick={() => setIsNewProjectOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Portfolio Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/95 p-5 rounded-2xl border border-[#D5DED8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Authorized Projects
            </div>
            <div className="text-2xl font-bold font-tabular text-slate-900 mt-0.5">
              {authorizedProjects.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/95 p-5 rounded-2xl border border-[#D5DED8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              On Track Delivery
            </div>
            <div className="text-2xl font-bold font-tabular text-emerald-800 mt-0.5">
              {onTrackCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/95 p-5 rounded-2xl border border-[#D5DED8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Deadline / Scope Risks
            </div>
            <div className="text-2xl font-bold font-tabular text-amber-900 mt-0.5">
              {riskCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#E2EAE5] bg-[#F7FAF8]/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Active Workspaces</h2>
            <p className="text-xs text-slate-500">Live projects configured in RebalanceX</p>
          </div>
          <span className="badge bg-slate-100 text-slate-700 font-medium">
            {authorizedProjects.length} Projects
          </span>
        </div>

        {isProjectLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading projects...
          </div>
        ) : authorizedProjects.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 space-y-3">
            <p>No projects found for your account.</p>
            {role !== 'member' && (
              <button
                onClick={() => setIsNewProjectOpen(true)}
                className="btn-primary text-xs"
              >
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#F7FAF8] border-b border-[#E2EAE5] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Project Name</th>
                  <th className="px-6 py-3.5">Manager</th>
                  <th className="px-6 py-3.5">Operational Status</th>
                  <th className="px-6 py-3.5 font-tabular">Deadline</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBF0EC] bg-white">
                {authorizedProjects.map((p) => {
                  const sm = p.schedule_metrics || {};
                  const duration = sm.project_duration_days || 0;
                  const deadline = p.deadline_days || 30;
                  const isOver = duration > deadline;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#F7FAF8] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                          {p.description || 'Enterprise delivery workspace'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-xs font-medium">
                        {p.manager_name || 'Engineering Lead'}
                      </td>
                      <td className="px-6 py-4">
                        {duration === 0 ? (
                          <span className="badge bg-slate-100 text-slate-700 border border-slate-200">
                            Planning Setup
                          </span>
                        ) : isOver ? (
                          <span className="badge bg-amber-50 text-amber-800 border border-amber-300 font-semibold">
                            Deadline Risk ({duration}d / {deadline}d)
                          </span>
                        ) : (
                          <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                            On Track ({duration}d)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-tabular text-slate-700 text-xs">
                        {deadline} days
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenProject(p.id)}
                          className="btn-primary py-1.5 px-3.5 text-xs inline-flex items-center gap-1.5"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isNewProjectOpen && <NewProjectModal onClose={() => setIsNewProjectOpen(false)} />}
    </div>
  );
}
