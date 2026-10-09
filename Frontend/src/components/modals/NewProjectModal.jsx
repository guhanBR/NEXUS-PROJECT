import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Plus, FolderPlus } from 'lucide-react';
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
      showToast('Project workspace created successfully!', 'success');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-google-modal w-full max-w-lg overflow-hidden border border-google-border">
        <div className="px-6 py-4 border-b border-google-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-google-blueSurface text-google-blue flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-google-text text-sm">Create New Project Workspace</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-google-textMuted hover:bg-google-subtle hover:text-google-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
              Project Name
            </label>
            <input
              {...register('name')}
              placeholder="e.g. HealthTech AI Nexus"
              className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
            />
            {errors.name && <p className="text-[11px] text-google-red mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
              Mission Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Scope, deliverables, and engineering goals"
              className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
                Target Team Size
              </label>
              <input
                type="number"
                {...register('target_team_size')}
                className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
                Deadline (Days)
              </label>
              <input
                type="number"
                {...register('deadline_days')}
                className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
              Domain Focus Areas (Comma-separated)
            </label>
            <input
              {...register('domains')}
              placeholder="e.g. FinTech, Cloud, Microservices"
              className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
            />
          </div>

          <div className="pt-4 border-t border-google-border flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="google-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="google-btn-primary"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
