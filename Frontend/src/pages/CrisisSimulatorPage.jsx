import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Play,
  Info,
  AlertTriangle,
  Users,
  Calendar,
  Clock,
  Flame,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { api } from '../api/client';

export function CrisisSimulatorPage() {
  const { activeProject, activeProjectId, setActiveProposal, showToast } = useProject();
  const navigate = useNavigate();

  const [scenarioType, setScenarioType] = useState('member_unavailable');
  const [selectedCandId, setSelectedCandId] = useState(2); // Default to Priya Sharma
  const [deadlineDays, setDeadlineDays] = useState((activeProject?.deadline_days || 25) - 7);
  const [urgentTitle, setUrgentTitle] = useState('Critical Zero-Day Vulnerability Hotfix');
  const [urgentSkill, setUrgentSkill] = useState('CyberSecurity');
  const [urgentHours, setUrgentHours] = useState(24);
  const [overrunTaskId, setOverrunTaskId] = useState(3);
  const [escalatedTaskId, setEscalatedTaskId] = useState(5);
  const [isSimulating, setIsSimulating] = useState(false);

  const teamMembers = activeProject?.team_members || [];
  const tasks = activeProject?.tasks || [];

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    showToast('Calculating optimal recovery plan with AI optimizer (PS#18)...');
    try {
      let params = {};
      if (scenarioType === 'member_unavailable') {
        params = { candidate_id: Number(selectedCandId) };
      } else if (scenarioType === 'deadline_shortened') {
        params = { new_deadline_days: Number(deadlineDays) };
      } else if (scenarioType === 'urgent_task_added') {
        params = {
          urgent_task: {
            title: urgentTitle,
            required_skill: urgentSkill,
            min_skill_level: 3,
            estimated_hours: Number(urgentHours),
            dependencies: [],
          },
        };
      } else if (scenarioType === 'duration_overrun') {
        params = {
          task_id: Number(overrunTaskId),
          duration_multiplier: 2.0,
        };
      } else if (scenarioType === 'priority_escalation') {
        params = {
          escalated_task_id: Number(escalatedTaskId),
        };
      }

      const res = await api.simulateCrisis(activeProjectId, {
        type: scenarioType,
        params,
      });

      setActiveProposal(res);
      showToast('Scenario computed! Ready to review proposed changes.', 'success');
      navigate('/rebalance-diff');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Human-readable scenario descriptions
  const getScenarioSummary = () => {
    if (scenarioType === 'member_unavailable') {
      const cand = teamMembers.find((m) => m.candidate_id === Number(selectedCandId));
      return `Simulating sudden outage for ${cand?.name || 'selected member'}. All their deliverables will be safely re-routed to qualified colleagues.`;
    }
    if (scenarioType === 'deadline_shortened') {
      return `Target deadline is compressed from ${activeProject?.deadline_days || 30} days to ${deadlineDays} days. The optimizer will attempt to parallelize work to avoid delays.`;
    }
    if (scenarioType === 'urgent_task_added') {
      return `An emergency deliverable "${urgentTitle}" (${urgentHours}h of ${urgentSkill}) is injected into the project.`;
    }
    if (scenarioType === 'duration_overrun') {
      const t = tasks.find((tk) => tk.id === Number(overrunTaskId));
      return `Task #${overrunTaskId} "${t?.title || 'selected'}" encounters scope creep and requires +100% more effort.`;
    }
    if (scenarioType === 'priority_escalation') {
      const t = tasks.find((tk) => tk.id === Number(escalatedTaskId));
      return `Task #${escalatedTaskId} "${t?.title || 'selected'}" is escalated to Critical priority.`;
    }
    return '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-google-blue bg-google-blueSurface px-2.5 py-0.5 rounded-full">
            What-If Simulator &bull; Sandbox Mode
          </span>
          <span className="text-xs text-google-textMuted font-mono">
            {activeProject?.name}
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-google-text">Try a What-If Scenario</h2>
        <p className="text-xs text-google-textSecondary mt-0.5">
          Test disruptions without risk. See how RebalanceX reorganizes tasks and protects your deadline.
        </p>
      </div>

      {/* Reassurance Banner */}
      <div className="bg-google-blueSurface/50 border border-google-blue/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-google-text">
        <Info className="w-5 h-5 text-google-blue flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-google-blue block mb-0.5">
            This tests a scenario. Your saved plan changes only after approval.
          </strong>
          <span className="text-google-textSecondary">
            Feel free to experiment with sudden leaves, accelerated deadlines, or urgent tasks. Nothing in your real project baseline is touched until you explicitly click "Approve & Apply Plan".
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Disruption Configuration */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-google-blue" />
              1. Choose a Scenario Type
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1.5">
                What situation do you want to test?
              </label>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-google-border text-xs font-semibold text-google-text focus:outline-none focus:ring-2 focus:ring-google-blue bg-white cursor-pointer"
              >
                <option value="member_unavailable">Someone is unavailable (Sick leave / Sudden outage)</option>
                <option value="deadline_shortened">The deadline changes (Accelerated schedule)</option>
                <option value="urgent_task_added">An urgent task is added (Emergency hotfix)</option>
                <option value="duration_overrun">A task needs more time (Scope expansion)</option>
                <option value="priority_escalation">A task's priority changes (Critical escalation)</option>
              </select>
            </div>

            {/* Dynamic Specific Controls */}
            {scenarioType === 'member_unavailable' && (
              <div className="p-4 bg-google-subtle/70 rounded-xl border border-google-border space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary">
                  Select Unavailable Team Member
                </label>
                <select
                  value={selectedCandId}
                  onChange={(e) => setSelectedCandId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-google-border text-xs font-medium bg-white"
                >
                  {teamMembers.map((m) => (
                    <option key={m.candidate_id} value={m.candidate_id}>
                      {m.name} ({m.role_in_project})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-google-textMuted">
                  RebalanceX will reassign all tasks assigned to this person to eligible peers with matching skill proficiencies.
                </p>
              </div>
            )}

            {scenarioType === 'deadline_shortened' && (
              <div className="p-4 bg-google-subtle/70 rounded-xl border border-google-border space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-google-textSecondary uppercase tracking-wider">
                  <span>New Target Deadline:</span>
                  <span className="font-mono text-google-blue text-sm font-bold">{deadlineDays} Days</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={activeProject?.deadline_days || 30}
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(e.target.value)}
                  className="w-full accent-google-blue"
                />
                <div className="flex justify-between text-[11px] text-google-textMuted font-mono">
                  <span>10 Days (Aggressive)</span>
                  <span>{activeProject?.deadline_days || 30} Days (Current)</span>
                </div>
              </div>
            )}

            {scenarioType === 'urgent_task_added' && (
              <div className="p-4 bg-google-subtle/70 rounded-xl border border-google-border space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
                    Emergency Deliverable Title
                  </label>
                  <input
                    value={urgentTitle}
                    onChange={(e) => setUrgentTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-google-border text-xs bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
                      Required Skill
                    </label>
                    <select
                      value={urgentSkill}
                      onChange={(e) => setUrgentSkill(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-google-border text-xs bg-white"
                    >
                      <option value="CyberSecurity">CyberSecurity</option>
                      <option value="Python">Python</option>
                      <option value="PostgreSQL">PostgreSQL</option>
                      <option value="React">React</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary mb-1">
                      Effort (Hours)
                    </label>
                    <input
                      type="number"
                      value={urgentHours}
                      onChange={(e) => setUrgentHours(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-google-border text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {scenarioType === 'duration_overrun' && (
              <div className="p-4 bg-google-subtle/70 rounded-xl border border-google-border space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary">
                  Select Task Expanding in Scope
                </label>
                <select
                  value={overrunTaskId}
                  onChange={(e) => setOverrunTaskId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-google-border text-xs bg-white"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.id}: {t.title} ({t.estimated_hours}h)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-google-amber font-medium">
                  +100% duration will be applied to test if this causes a critical path slip.
                </p>
              </div>
            )}

            {scenarioType === 'priority_escalation' && (
              <div className="p-4 bg-google-subtle/70 rounded-xl border border-google-border space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-google-textSecondary">
                  Select Task to Escalate to Critical
                </label>
                <select
                  value={escalatedTaskId}
                  onChange={(e) => setEscalatedTaskId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-google-border text-xs bg-white"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.id}: {t.title} ({t.priority})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Scenario Summary Card */}
            <div className="p-4 bg-google-subtle/60 rounded-xl border border-google-border space-y-1">
              <span className="text-[11px] font-bold text-google-textMuted uppercase tracking-wider block">
                Scenario Summary:
              </span>
              <p className="text-xs text-google-text font-medium leading-relaxed">
                {getScenarioSummary()}
              </p>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full google-btn-primary py-3 text-xs font-bold rounded-full shadow-google-xs flex items-center justify-center gap-2 disabled:opacity-50 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isSimulating ? 'Calculating Optimal Plan...' : 'Calculate Recovery Plan'}</span>
            </button>
          </div>
        </div>

        {/* Right: How It Works & Demonstration Tips */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-google-blue" />
            How Autonomous Rebalancing Works
          </h3>

          <p className="text-xs text-google-textSecondary leading-relaxed">
            Instead of manually reshuffling tasks on spreadsheets, RebalanceX uses Mixed-Integer constraint optimization to find the best resolution:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-google-subtle/70 rounded-xl border border-google-border space-y-1">
              <strong className="text-google-text font-bold block">
                1. Respects Hard Dependencies
              </strong>
              <span className="text-google-textSecondary">
                Tasks are never scheduled before their prerequisite deliverables finish.
              </span>
            </div>

            <div className="p-3.5 bg-google-subtle/70 rounded-xl border border-google-border space-y-1">
              <strong className="text-google-text font-bold block">
                2. Matches Required Skills & Levels
              </strong>
              <span className="text-google-textSecondary">
                Reallocated work only goes to team members with certified proficiency.
              </span>
            </div>

            <div className="p-3.5 bg-google-subtle/70 rounded-xl border border-google-border space-y-1">
              <strong className="text-google-text font-bold block">
                3. Minimizes Disruption & Churn
              </strong>
              <span className="text-google-textSecondary">
                The optimizer reassigns only what is necessary, preserving plan stability.
              </span>
            </div>
          </div>

          <div className="p-4 bg-google-tealSurface/50 border border-google-teal/30 rounded-xl text-xs text-google-teal space-y-1">
            <strong className="font-bold block">Try This Live Demo:</strong>
            <p className="text-google-text">
              Select <strong>"Someone is unavailable"</strong> with <strong>Priya Sharma</strong> (Backend Lead). Click "Calculate Recovery Plan" to see how tasks #2 and #3 are autonomously re-routed to Alex Morgan with zero deadline delay!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
