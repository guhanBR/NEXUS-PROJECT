import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { api } from '../../api/client';
import { useProject } from '../../context/ProjectContext';
import { useQueryClient } from '@tanstack/react-query';

const memberSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role_title: z.string().min(2, 'Role title required'),
  skills: z.string().min(2, 'Skills JSON required'),
  experience_years: z.coerce.number().min(0),
  weekly_capacity_hours: z.coerce.number().min(5).max(80),
});

export function AddMemberModal({ onClose }) {
  const { showToast } = useProject();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      role_title: 'Full-Stack Developer',
      skills: '{"Python": 4, "Docker": 3, "React": 3}',
      experience_years: 2.5,
      weekly_capacity_hours: 40,
    },
  });

  const onSubmit = async (data) => {
    try {
      let parsedSkills = {};
      try {
        parsedSkills = JSON.parse(data.skills);
      } catch {
        parsedSkills = { Python: 3 };
      }

      await api.createMember({
        name: data.name,
        role_title: data.role_title,
        skills: parsedSkills,
        experience_years: data.experience_years,
        weekly_capacity_hours: data.weekly_capacity_hours,
      });

      await queryClient.invalidateQueries(['members']);
      showToast('Candidate added to talent pool!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Add Candidate to Talent Pool</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Full Name
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Jordan Lee"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Role Title
            </label>
            <input
              {...register('role_title')}
              placeholder="e.g. Backend Lead"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Skills JSON Map (e.g. {"{\"Python\": 4, \"Docker\": 3}"})
            </label>
            <input
              {...register('skills')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                step="0.5"
                {...register('experience_years')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Weekly Capacity (Hours)
              </label>
              <input
                type="number"
                {...register('weekly_capacity_hours')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              {isSubmitting ? 'Adding...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
