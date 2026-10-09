import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, CheckSquare, Plus } from 'lucide-react';
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

      await api.generateSchedule(activeProjectId);
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast('Task added and schedule recalculated!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to add task.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18201C]/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#D5DED8]">
        <div className="px-6 py-5 border-b border-[#E2EAE5] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#202724] text-white flex items-center justify-center shadow-xs">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add Task Deliverable</h3>
              <p className="text-[11px] text-slate-500">Configure WBS item and required capability</p>
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
              Task Title
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Asynchronous Webhook Dispatcher"
              className="input"
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Deliverable Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Scope, requirements, and engineering targets"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Required Skill
              </label>
              <select
                {...register('required_skill')}
                className="input cursor-pointer"
              >
                <option value="Python">Python</option>
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="React">React</option>
                <option value="Docker">Docker</option>
                <option value="CyberSecurity">CyberSecurity</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Min Skill Level (1-5)
              </label>
              <input
                type="number"
                {...register('min_skill_level')}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Effort (Hours)
              </label>
              <input
                type="number"
                {...register('estimated_hours')}
                className="input"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                {...register('priority')}
                className="input cursor-pointer"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Prerequisite Dependencies (Comma-separated IDs, e.g. 1, 2)
            </label>
            <input
              {...register('dependencies')}
              placeholder="None or e.g. 1, 3"
              className="input font-mono"
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
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
