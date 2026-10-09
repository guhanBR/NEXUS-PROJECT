import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
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
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Create New Project</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Project Name
            </label>
            <input
              {...register('name')}
              placeholder="e.g. HealthTech AI Nexus"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Mission Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Scope and deliverables"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Team Size
              </label>
              <input
                type="number"
                {...register('target_team_size')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Deadline (Days)
              </label>
              <input
                type="number"
                {...register('deadline_days')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Domain Tags (Comma-separated)
            </label>
            <input
              {...register('domains')}
              placeholder="e.g. FinTech, Cloud, AI"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
