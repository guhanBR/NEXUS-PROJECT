import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { Zap, Play, Info } from 'lucide-react';
import { api } from '../api/client';

export function CrisisSimulatorPage() {
  const { activeProject, activeProjectId, setActiveProposal, showToast } = useProject();
  const navigate = useNavigate();

  const [scenarioType, setScenarioType] = useState('member_unavailable');
  const [selectedCandId, setSelectedCandId] = useState(2); // Default to Priya Sharma (Backend Lead)
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
    showToast('Executing Autonomous Resource Rebalancer (PS#18)...');
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
      showToast('Rebalancing proposal calculated!', 'success');
      navigate('/rebalance-diff');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Crisis Simulator & Disruption Engine</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Inject real-world operational crises and trigger the Autonomous Constraint Rebalancer (PS#18).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Disruption Builder Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Disruption Scenario Builder
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Select Disruption Archetype
              </label>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="member_unavailable">1. Team Member Sudden Outage / Sick Leave</option>
                <option value="deadline_shortened">2. Target Deadline Compressed / Shortened</option>
                <option value="urgent_task_added">3. Urgent Hotfix / Emergency Feature Injected</option>
                <option value="duration_overrun">4. Task Duration Overrun (+100% Scope Creep)</option>
                <option value="priority_escalation">5. Task Priority Escalated to Critical</option>
              </select>
            </div>

            {/* Dynamic Parameter Fields */}
            {scenarioType === 'member_unavailable' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Outage Team Member
                </label>
                <select
                  value={selectedCandId}
                  onChange={(e) => setSelectedCandId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                >
                  {teamMembers.map((m) => (
                    <option key={m.candidate_id} value={m.candidate_id}>
                      {m.name} ({m.role_in_project})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  This member will become completely unavailable. All their tasks will be re-routed to qualified
                  peers.
                </p>
              </div>
            )}

            {scenarioType === 'deadline_shortened' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  New Accelerated Deadline: <strong className="text-blue-600 font-mono">{deadlineDays} Days</strong>
                </label>
                <input
                  type="range"
                  min={10}
                  max={activeProject?.deadline_days || 30}
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {scenarioType === 'urgent_task_added' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Emergency Deliverable Title
                  </label>
                  <input
                    value={urgentTitle}
                    onChange={(e) => setUrgentTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Required Skill
                    </label>
                    <select
                      value={urgentSkill}
                      onChange={(e) => setUrgentSkill(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 text-sm bg-white"
                    >
                      <option value="CyberSecurity">CyberSecurity</option>
                      <option value="Python">Python</option>
                      <option value="PostgreSQL">PostgreSQL</option>
                      <option value="React">React</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Effort (Hours)
                    </label>
                    <input
                      type="number"
                      value={urgentHours}
                      onChange={(e) => setUrgentHours(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {scenarioType === 'duration_overrun' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Scope Expanding Task
                </label>
                <select
                  value={overrunTaskId}
                  onChange={(e) => setOverrunTaskId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.id}: {t.title} ({t.estimated_hours}h)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 font-medium text-rose-600">+100% Duration multiplier applied.</p>
              </div>
            )}

            {scenarioType === 'priority_escalation' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Task to Escalate
                </label>
                <select
                  value={escalatedTaskId}
                  onChange={(e) => setEscalatedTaskId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.id}: {t.title} ({t.priority})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm inline-flex items-center justify-center gap-2 text-sm disabled:opacity-50 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              {isSimulating ? 'Optimizing Plan...' : 'Run Autonomous Rebalancer'}
            </button>
          </div>
        </div>

        {/* Right: Technical Explanation */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" /> Optimization Engine Formulation
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            When an operational disruption occurs, RebalanceX evaluates the Directed Acyclic Graph (DAG) of the
            project and executes a Mixed-Integer constraint optimizer:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border-l-4 border-blue-600">
              <strong className="text-slate-900 font-bold block mb-0.5">1. Hard Constraint Verification</strong>
              <span className="text-slate-600">
                Guarantees all reassigned tasks strictly satisfy prerequisite DAG dependencies, minimum required skill
                thresholds, and zero allocations to unavailable personnel.
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border-l-4 border-emerald-600">
              <strong className="text-slate-900 font-bold block mb-0.5">2. Multi-Objective Minimization</strong>
              <span className="text-slate-600">
                Minimizes project makespan deadline delay (weight: 8.0), workload imbalance across engineers (weight:
                0.4), and plan perturbation/churn (weight: 3.5).
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border-l-4 border-purple-600">
              <strong className="text-slate-900 font-bold block mb-0.5">3. Transparent Decision Evidence</strong>
              <span className="text-slate-600">
                Synthesizes mathematical proof explaining why deliverables moved, enabling engineering leaders to inspect
                before approving.
              </span>
            </div>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
            <strong className="font-bold block">Recommended Hackathon Demonstration:</strong>
            <p>
              Select <strong>"1. Team Member Sudden Outage"</strong> with <strong>Priya Sharma</strong> (Backend Lead).
              Priya owns critical path tasks #2 and #3. RebalanceX will automatically re-route critical API deliverables
              to Alex Morgan without violating schema dependencies!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
