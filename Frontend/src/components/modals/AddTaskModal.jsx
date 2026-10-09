import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
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

      // Recalculate schedule
      await api.generateSchedule(activeProjectId);
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast('Task added and schedule updated!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Add Project Task</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Task Title
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Asynchronous Webhook Dispatcher"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Delivery requirements"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Required Skill
              </label>
              <select
                {...register('required_skill')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Python">Python</option>
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="React">React</option>
                <option value="Docker">Docker</option>
                <option value="CyberSecurity">CyberSecurity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Min Skill Level (1-5)
              </label>
              <input
                type="number"
                {...register('min_skill_level')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Effort (Hours)
              </label>
              <input
                type="number"
                {...register('estimated_hours')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Prerequisite Dependency IDs (Comma-separated, e.g. 1, 2)
            </label>
            <input
              {...register('dependencies')}
              placeholder="None or e.g. 1, 3"
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
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
