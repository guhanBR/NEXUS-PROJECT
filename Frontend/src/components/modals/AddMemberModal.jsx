import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, UserCheck } from 'lucide-react';
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
      showToast(err.message || 'Failed to add candidate.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18201C]/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#D5DED8]">
        <div className="px-6 py-5 border-b border-[#E2EAE5] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#202724] text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-normal text-slate-900 text-lg">Add Candidate to Pool</h3>
              <p className="text-[11px] text-slate-500">Register engineer profile, skills map, and capacity</p>
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
              Full Name
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Jordan Lee"
              className="input"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Role Title
            </label>
            <input
              {...register('role_title')}
              placeholder="e.g. Senior Backend Engineer"
              className="input"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Skills JSON Map (e.g. {`{"Python": 4, "Docker": 3}`})
            </label>
            <input
              {...register('skills')}
              className="input font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                step="0.5"
                {...register('experience_years')}
                className="input"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Weekly Capacity (Hours)
              </label>
              <input
                type="number"
                {...register('weekly_capacity_hours')}
                className="input"
              />
            </div>
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
              {isSubmitting ? 'Adding...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
