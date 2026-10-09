import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, CheckSquare } from 'lucide-react';
import { api } from '../../api/client';
import { useProject } from '../../context/ProjectContext';
import { useQueryClient } from '@tanstack/react-query';

const taskSchema = z.object({
  title: z.string().min(2, 'Task title required'),
  description: z.string().optional(),
  required_skill: z.string().min(1, 'Required skill required'),
  min_skill_level: z.coerce.number().min(1).max(5),
  estimated_hours: z.coerce.number().min(1).max(500),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dependencies: z.string().optional(),
});

export function AddTaskModal({ onClose }) {
  const { activeProjectId, showToast } = useProject();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      required_skill: 'Python',
      min_skill_level: 3,
      estimated_hours: 24,
      priority: 'high',
      dependencies: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const depList = data.dependencies
        ? data.dependencies
            .split(',')
            .map((s) => parseInt(s.trim()))
            .filter((n) => !isNaN(n))
        : [];

      await api.createTask(activeProjectId, {
        title: data.title,
        description: data.description,
        required_skill: data.required_skill,
        min_skill_level: data.min_skill_level,
        estimated_hours: data.estimated_hours,
        priority: data.priority,
        dependencies: depList,
      });

      // Recalculate CPM schedule
      await api.generateSchedule(activeProjectId);
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast('Task added and CPM schedule updated!', 'success');
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
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-google-text text-sm">Add Project Task Deliverable</h3>
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
              Task Title
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Asynchronous Webhook Dispatcher"
              className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
            />
            {errors.title && <p className="text-[11px] text-google-red mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Delivery requirements and specs"
              className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
                Required Skill
              </label>
              <select
                {...register('required_skill')}
                className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue bg-white"
              >
                <option value="Python">Python</option>
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="React">React</option>
                <option value="Docker">Docker</option>
                <option value="CyberSecurity">CyberSecurity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
                Min Skill Level (1-5)
              </label>
              <input
                type="number"
                {...register('min_skill_level')}
                className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
                Effort (Hours)
              </label>
              <input
                type="number"
                {...register('estimated_hours')}
                className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue bg-white"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
              Prerequisite Dependency IDs (Comma-separated, e.g. 1, 2)
            </label>
            <input
              {...register('dependencies')}
              placeholder="None or e.g. 1, 3"
              className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue font-mono"
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
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
