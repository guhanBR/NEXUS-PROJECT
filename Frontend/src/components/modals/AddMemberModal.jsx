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
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-google-modal w-full max-w-lg overflow-hidden border border-google-border">
        <div className="px-6 py-4 border-b border-google-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-google-blueSurface text-google-blue flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-google-text text-sm">Add Candidate to Talent Pool</h3>
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
              Full Name
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Jordan Lee"
              className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
            />
            {errors.name && <p className="text-[11px] text-google-red mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
              Role Title
            </label>
            <input
              {...register('role_title')}
              placeholder="e.g. Backend Lead"
              className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
              Skills JSON Map (e.g. {`{"Python": 4, "Docker": 3}`})
            </label>
            <input
              {...register('skills')}
              className="w-full px-3.5 py-2 rounded-xl border border-google-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-google-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                step="0.5"
                {...register('experience_years')}
                className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
                Weekly Capacity (Hours)
              </label>
              <input
                type="number"
                {...register('weekly_capacity_hours')}
                className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue"
              />
            </div>
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
              {isSubmitting ? 'Adding...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
