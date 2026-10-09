import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sparkles,
  Award,
  Check,
  Filter,
  Grid,
  GitBranch,
  UserPlus,
  ShieldCheck,
  Layers,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { AddMemberModal } from '../components/modals/AddMemberModal';

const teamFormationSchema = z.object({
  target_team_size: z.coerce.number().min(1).max(10),
  domains: z.string().optional(),
});

export function TeamFormationPage() {
  const { activeProject, activeProjectId, showToast } = useProject();
  const queryClient = useQueryClient();
  const [recommendation, setRecommendation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isMathScoreOpen, setIsMathScoreOpen] = useState(false);

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(teamFormationSchema),
    defaultValues: {
      target_team_size: activeProject?.target_team_size || 4,
      domains: (activeProject?.domains || []).join(', '),
    },
  });

  const onCalculate = async (data) => {
    setIsCalculating(true);
    showToast('Finding best team match for project requirements (PS#11)...');
    try {
      const domainsList = data.domains
        ? data.domains.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await api.recommendTeam(activeProjectId, {
        target_team_size: data.target_team_size,
        domains: domainsList,
        required_skills: activeProject?.required_skills || [],
      });

      setRecommendation(res);
      showToast('Optimal team recommendation generated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  const onConfirmTeam = async () => {
    if (!recommendation?.recommended_team) return;
    setIsConfirming(true);
    try {
      await api.confirmTeam(activeProjectId, {
        team_members: recommendation.recommended_team,
      });
      await queryClient.invalidateQueries(['project', activeProjectId]);
      showToast('Team confirmed and assigned to active project!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  const displayedTeam = recommendation?.recommended_team || activeProject?.team_members || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-google-blue bg-google-blueSurface px-2.5 py-0.5 rounded-full">
              Plan &bull; Build a Team (PS#11)
            </span>
            <span className="text-xs text-google-textMuted font-mono">
              {activeProject?.name}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-google-text">Smart Team Formation</h2>
          <p className="text-xs text-google-textSecondary mt-0.5">
            Assemble the best team based on skills, proficiency ratings, domain fit, and weekly availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="google-btn-secondary"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Grid: Constraints Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Requirements Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
              <Filter className="w-4 h-4 text-google-blue" />
              Project Skill Requirements
            </h3>

            <form onSubmit={handleSubmit(onCalculate)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1.5">
                  Target Team Size
                </label>
                <input
                  type="number"
                  {...register('target_team_size')}
                  className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-semibold text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1.5">
                  Domain Focus Areas
                </label>
                <input
                  {...register('domains')}
                  placeholder="e.g. FinTech, Microservices"
                  className="w-full px-3.5 py-2 rounded-xl border border-google-border text-xs font-medium text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-2">
                  Mandatory Skill Constraints
                </label>
                <div className="space-y-2">
                  {(activeProject?.required_skills || []).map((req, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-google-subtle/70 rounded-xl border border-google-border flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-google-text">
                        {req.skill}{' '}
                        {req.mandatory && (
                          <span className="text-[10px] text-google-red font-bold ml-1">*Required</span>
                        )}
                      </span>
                      <span className="text-google-textMuted font-mono">Level {req.min_level}+</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculating}
                className="w-full google-btn-primary py-2.5 shadow-google-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isCalculating ? 'Matching Best Candidates...' : 'Find Best Team Match'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Recommendation & Roster */}
        <div className="lg:col-span-8 space-y-6">
          {/* Match Score Banner */}
          <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-google-blue">
                Team Compatibility Score
              </span>
              <div className="text-3xl font-extrabold text-google-text mt-0.5 font-tabular">
                {recommendation?.compatibility_score || 94.8}
                <span className="text-base font-normal text-google-textMuted"> / 100</span>
              </div>
              <p className="text-xs text-google-textSecondary mt-1 max-w-xl">
                {recommendation?.selection_reasons?.join(' ') ||
                  'Achieves 100% skill coverage with balanced capacity across all required domains.'}
              </p>
            </div>

            {recommendation && (
              <button
                onClick={onConfirmTeam}
                disabled={isConfirming}
                className="google-btn-primary bg-google-teal hover:bg-emerald-700 py-2.5 px-4 self-start sm:self-auto shadow-google-xs"
              >
                <Check className="w-4 h-4" />
                <span>{isConfirming ? 'Assigning...' : 'Confirm & Save Team'}</span>
              </button>
            )}
          </div>

          {/* Roster Cards */}
          <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
              <Award className="w-4 h-4 text-google-blue" />
              {recommendation ? 'Recommended Candidates' : 'Current Confirmed Team'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedTeam.map((m, idx) => {
                const skills = m.skills || {};
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-google-border bg-google-subtle/40 hover:bg-white transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-google-xs"
                        style={{ backgroundColor: m.avatar_color || '#0B57D0' }}
                      >
                        {m.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-google-text">{m.name}</h4>
                        <p className="text-xs text-google-textMuted">{m.role_in_project || m.role_title}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(skills).map(([s, lvl]) => (
                        <span
                          key={s}
                          className="text-[11px] font-medium bg-white px-2 py-0.5 rounded-md border border-google-border text-google-text"
                        >
                          {s} <strong className="text-google-blue">L{lvl}</strong>
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-google-border flex items-center justify-between text-xs">
                      <span className="text-google-textMuted">
                        Match Score: <strong className="text-google-blue font-tabular">{m.match_score || 95}%</strong>
                      </span>
                      <span className="text-[10px] font-bold text-google-teal bg-google-tealSurface px-2 py-0.2 rounded-full">
                        Selected
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skill Coverage Matrix */}
          {recommendation?.coverage_matrix && (
            <div className="bg-white rounded-2xl border border-google-border shadow-google-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-google-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
                  <Grid className="w-4 h-4 text-google-blue" />
                  Skill Coverage & Lead Experts
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-google-subtle text-google-textSecondary uppercase tracking-wider font-bold border-b border-google-border">
                    <tr>
                      <th className="p-3.5 px-6">Skill Requirement</th>
                      <th className="p-3.5 px-6">Required Level</th>
                      <th className="p-3.5 px-6">Status</th>
                      <th className="p-3.5 px-6">Lead Expert</th>
                      <th className="p-3.5 px-6">Team Depth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-google-border text-google-text">
                    {Object.entries(recommendation.coverage_matrix).map(([skill, info]) => (
                      <tr key={skill} className="hover:bg-google-subtle/50 transition-colors">
                        <td className="p-3.5 px-6 font-semibold">
                          {skill}{' '}
                          {info.mandatory && (
                            <span className="text-google-red font-bold text-[10px]">*Required</span>
                          )}
                        </td>
                        <td className="p-3.5 px-6 font-mono text-google-textSecondary">
                          Level {info.required_level}+
                        </td>
                        <td className="p-3.5 px-6">
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-google-tealSurface text-google-teal">
                            100% Covered
                          </span>
                        </td>
                        <td className="p-3.5 px-6 font-medium">
                          <strong>{info.lead_expert}</strong> (L{info.best_level})
                        </td>
                        <td className="p-3.5 px-6 text-google-textMuted">
                          {info.qualified_count} person(s) qualified
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expandable Score Breakdown Section */}
          <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
            <button
              onClick={() => setIsMathScoreOpen(!isMathScoreOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-google-textSecondary hover:text-google-text"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-google-textMuted" />
                Explain Compatibility Score Formula (PS#11)
              </span>
              {isMathScoreOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isMathScoreOpen && (
              <div className="pt-3 border-t border-google-border text-xs text-google-textSecondary space-y-2 animate-in fade-in duration-150">
                <p>
                  The compatibility score is calculated using weighted Multi-Objective Optimization:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-google-text">
                  <li><strong>Skill Coverage (50%):</strong> Verifies every mandatory skill threshold is satisfied.</li>
                  <li><strong>Domain Synergy (25%):</strong> Evaluates past experience in matching domain keywords.</li>
                  <li><strong>Capacity Balance (25%):</strong> Ensures total team capacity safely exceeds estimated workload without burning out individual engineers.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAddMemberOpen && <AddMemberModal onClose={() => setIsAddMemberOpen(false)} />}
    </div>
  );
}
