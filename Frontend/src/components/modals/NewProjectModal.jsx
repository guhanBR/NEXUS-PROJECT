import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, FolderPlus } from 'lucide-react';
import { api } from '../../api/client';
import { useProject } from '../../context/ProjectContext';
import { useQueryClient } from '@tanstack/react-query';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  target_team_size: z.coerce.number().min(1).max(10),
  deadline_days: z.coerce.number().min(5).max(365),
  domains: z.string().optional(),
});

export function NewProjectModal({ onClose }) {
  const { showToast, setActiveProjectId } = useProject();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      target_team_size: 4,
      deadline_days: 30,
      domains: 'FinTech, Microservices',
    },
  });

  const onSubmit = async (data) => {
    try {
      const domainsList = data.domains
        ? data.domains.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: data.name,
        description: data.description,
        target_team_size: data.target_team_size,
        deadline_days: data.deadline_days,
        required_skills: [
          { skill: 'Python', min_level: 3, mandatory: true },
          { skill: 'React', min_level: 2, mandatory: true },
        ],
        domains: domainsList,
      };

      const res = await api.createProject(payload);
      showToast('Project created successfully!', 'success');
      await queryClient.invalidateQueries(['projects']);
      if (res.project?.id) {
        setActiveProjectId(res.project.id);
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create project.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18201C]/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#D5DED8]">
        <div className="px-6 py-5 border-b border-[#E2EAE5] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#202724] text-white flex items-center justify-center shadow-xs">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create New Project</h3>
              <p className="text-[11px] text-slate-500">Initialize a new enterprise delivery workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Project Name
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Real-Time Autonomous Analytics"
              className="input"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Project Scope & Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Scope, deliverables, and engineering goals"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Team Size
              </label>
              <input
                type="number"
                {...register('target_team_size')}
                className="input"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Deadline (Days)
              </label>
              <input
                type="number"
                {...register('deadline_days')}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Domain Tags (Comma-separated)
            </label>
            <input
              {...register('domains')}
              placeholder="e.g. FinTech, Cloud, Microservices"
              className="input"
            />
          </div>

          <div className="pt-4 border-t border-[#E2EAE5] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
