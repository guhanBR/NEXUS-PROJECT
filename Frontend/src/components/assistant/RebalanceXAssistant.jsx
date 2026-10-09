import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Trash2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Users,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  ArrowRight,
  Zap,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export function RebalanceXAssistant() {
  const {
    activeProject,
    activeProjectId,
    projects,
    members,
    activeProposal,
  } = useProject();

  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Initial welcome message when chat is opened
  useEffect(() => {
    if (messages.length === 0 && activeProject) {
      const welcome = generateWelcomeMessage(role, user, activeProject);
      setMessages([welcome]);
    }
  }, [activeProject, role, user]);

  // Role-specific suggested prompt questions
  const suggestedQuestions = getSuggestedQuestions(role, user, activeProject);

  const handleClearChat = () => {
    if (activeProject) {
      const welcome = generateWelcomeMessage(role, user, activeProject);
      setMessages([welcome]);
    } else {
      setMessages([]);
    }
  };

  const handleSend = async (queryText = inputQuery) => {
    const text = (queryText || '').trim();
    if (!text || isTyping) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate intelligent analytical reasoning latency
    setTimeout(() => {
      const assistantResponse = processProjectQuery(text, {
        activeProject,
        projects,
        members,
        activeProposal,
        user,
        role,
        navigate,
      });

      setMessages((prev) => [...prev, assistantResponse]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      {/* Floating Chat Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-2xl hover:shadow-slate-900/40 border border-white/20 transition-all duration-300 hover:scale-105 group"
          aria-label="Open RebalanceX Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_#F59E0B] group-hover:rotate-12 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wide">Ask Assistant</span>
          {activeProject && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
          )}
        </button>
      )}

      {/* Floating Assistant Modal / Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header Bar */}
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-white truncate">
                    RebalanceX Assistant
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9px] font-bold text-amber-300 uppercase tracking-wider">
                    {role || 'lead'}
                  </span>
                </div>
                <div className="text-[10px] text-white/70 truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_4px_#10B981]" />
                  <span className="truncate">
                    Scope: <strong className="text-white font-medium">{activeProject?.name || 'Authorized Portfolio'}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAF9]/80 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3.5 space-y-2 leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-[#E2E8E4] rounded-bl-xs'
                  }`}
                >
                  {/* Message Content */}
                  <div className="space-y-2">
                    {msg.text && (
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                    )}

                    {/* Optional Grounded Data Table */}
                    {msg.table && (
                      <div className="overflow-x-auto my-2 rounded-xl border border-slate-200">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 font-bold text-slate-700 uppercase tracking-wider">
                            <tr>
                              {msg.table.headers.map((h, i) => (
                                <th key={i} className="px-2.5 py-1.5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {msg.table.rows.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                {row.map((cell, j) => (
                                  <td key={j} className="px-2.5 py-1.5">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Optional Source / Action Links */}
                    {msg.links && msg.links.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.links.map((link, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              navigate(link.to);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-[11px] font-bold transition"
                          >
                            <span>{link.label}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span className="font-semibold text-slate-600">Analyzing live project telemetry...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Section */}
          <div className="px-3.5 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 shrink-0 no-scrollbar">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition shrink-0 border border-slate-200/80"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask about ${activeProject?.name ? `"${activeProject.name}"` : 'projects, tasks, team...'}`}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// Helper 1: Welcome message factory
function generateWelcomeMessage(role, user, project) {
  const name = user?.name?.split(' ')[0] || 'there';
  const roleTitle = role === 'admin' ? 'Administrator' : role === 'manager' ? 'Delivery Lead' : 'Team Specialist';

  return {
    id: 'welcome-1',
    sender: 'assistant',
    text: `Hello ${name}! I am your project-aware RebalanceX Assistant. I have live read-only access to **${project?.name || 'your workspaces'}**.\n\nAsk me about critical path deliverables, deadlines, team capacity, pending recovery proposals, or milestone progress.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    links: [
      { label: 'View Dashboard', to: '/overview' },
      { label: 'WBS & Schedule', to: '/task-planning' },
    ],
  };
}

// Helper 2: Suggested questions based on authenticated role
function getSuggestedQuestions(role, user, project) {
  if (role === 'admin') {
    return [
      'Show the projects I can oversee',
      'Which projects have deadline risks?',
      'Who manages each workspace?',
    ];
  }

  if (role === 'member') {
    return [
      'What are my assigned tasks?',
      'What is due next on my schedule?',
      'Who is on my confirmed team?',
    ];
  }

  // Default: Manager / Lead
  return [
    'What needs attention in this project?',
    'Which tasks are on the critical path?',
    'Who has available workload capacity?',
    'Explain the latest recovery proposal',
  ];
}

// Helper 3: Intelligent grounded response synthesis engine
function processProjectQuery(query, ctx) {
  const q = query.toLowerCase();
  const { activeProject, projects, members, activeProposal, user, role } = ctx;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const tasks = activeProject?.tasks || [];
  const sm = activeProject?.schedule_metrics || {};
  const teamMembers = activeProject?.team_members || [];
  const critIds = new Set(sm.critical_path_task_ids || []);
  const duration = sm.project_duration_days || activeProject?.deadline_days || 28;
  const deadline = activeProject?.deadline_days || 30;

  // 1. Critical path / Schedule questions
  if (q.includes('critical') || q.includes('cpm') || q.includes('path') || q.includes('schedule') || q.includes('timeline')) {
    const critTasks = tasks.filter((t) => critIds.has(t.id) || t.is_critical_path);

    if (critTasks.length === 0) {
      return {
        id: Date.now(),
        sender: 'assistant',
        text: `The CPM scheduler has calculated a **${duration}-day baseline** for "${activeProject?.name}". All tasks currently have adequate buffer slack.`,
        timestamp: time,
        links: [{ label: 'View Gantt Schedule', to: '/task-planning' }],
      };
    }

    return {
      id: Date.now(),
      sender: 'assistant',
      text: `There are **${critTasks.length} deliverables on the Critical Path** (0-day slack). Any delay on these tasks will push the project completion beyond ${duration} days:`,
      table: {
        headers: ['ID', 'Deliverable', 'Duration', 'Assignee'],
        rows: critTasks.map((t) => {
          const owner = teamMembers.find((m) => m.candidate_id === t.assigned_candidate_id);
          return [
            `#${t.id}`,
            t.title,
            `Day ${t.start_day || 0} → ${t.end_day || 0} (${t.estimated_hours}h)`,
            owner?.name || 'Unassigned',
          ];
        }),
      },
      links: [{ label: 'Open Gantt Timeline', to: '/task-planning' }],
      timestamp: time,
    };
  }

  // 2. Member assigned tasks / "my tasks"
  if (q.includes('my task') || q.includes('assigned to me') || q.includes('due next') || (role === 'member' && q.includes('task'))) {
    const myTasks = user?.id
      ? tasks.filter((t) => t.assigned_candidate_id === user.id)
      : tasks.slice(0, 2);

    if (myTasks.length === 0) {
      return {
        id: Date.now(),
        sender: 'assistant',
        text: `You currently have no direct deliverables assigned in "${activeProject?.name}". Check with your delivery lead or review open work.`,
        timestamp: time,
        links: [{ label: 'Review All Tasks', to: '/task-planning' }],
      };
    }

    return {
      id: Date.now(),
      sender: 'assistant',
      text: `You have **${myTasks.length} assigned deliverable(s)** in "${activeProject?.name}":`,
      table: {
        headers: ['Task', 'Effort', 'Scheduled Window', 'Status'],
        rows: myTasks.map((t) => [
          t.title,
          `${t.estimated_hours} hrs`,
          `Day ${t.start_day || 0} → ${t.end_day || 0}`,
          (t.status || 'todo').toUpperCase(),
        ]),
      },
      links: [{ label: 'Update Task Status', to: '/task-planning' }],
      timestamp: time,
    };
  }

  // 3. Team / Capacity questions
  if (q.includes('team') || q.includes('capacity') || q.includes('roster') || q.includes('who is on') || q.includes('engineer') || q.includes('members')) {
    if (teamMembers.length === 0) {
      return {
        id: Date.now(),
        sender: 'assistant',
        text: `"${activeProject?.name}" does not have a confirmed team yet. Use the autonomous Smart Team Formation engine to generate an optimal squad.`,
        timestamp: time,
        links: [{ label: 'Form Team Roster', to: '/team-formation' }],
      };
    }

    return {
      id: Date.now(),
      sender: 'assistant',
      text: `"${activeProject?.name}" has **${teamMembers.length} confirmed specialists** with a total capacity of ${teamMembers.reduce((acc, m) => acc + (m.weekly_capacity_hours || 40), 0)}h/week:`,
      table: {
        headers: ['Specialist', 'Role Title', 'Weekly Capacity', 'Experience'],
        rows: teamMembers.map((m) => [
          m.name,
          m.role_title,
          `${m.weekly_capacity_hours || 40}h/wk`,
          `${m.experience_years} yrs`,
        ]),
      },
      links: [{ label: 'Inspect Team Roster', to: '/team-formation' }],
      timestamp: time,
    };
  }

  // 4. Recovery proposal / What-if questions
  if (q.includes('recovery') || q.includes('proposal') || q.includes('outage') || q.includes('what-if') || q.includes('disruption')) {
    if (activeProposal) {
      const reassignments = activeProposal.reassigned_tasks || [];
      return {
        id: Date.now(),
        sender: 'assistant',
        text: `There is an active **Recovery Plan Proposal** with predicted duration of **${activeProposal.estimated_duration_days || duration} days** (${Math.round((activeProposal.confidence_score || 0.98) * 100)}% solver confidence) and **${reassignments.length} automated task reallocations**:`,
        table: reassignments.length > 0 ? {
          headers: ['Task', 'Previous Owner', 'New Owner', 'Reason'],
          rows: reassignments.map((r) => [
            r.task_title || `Task #${r.task_id}`,
            r.previous_owner || 'Unassigned',
            r.new_owner || 'Reassigned',
            r.reason || 'Skill balance',
          ]),
        } : null,
        links: [{ label: 'Review & Approve Plan', to: '/recovery' }],
        timestamp: time,
      };
    }

    return {
      id: Date.now(),
      sender: 'assistant',
      text: `There are currently no pending recovery proposals for "${activeProject?.name}". You can test developer absences or deadline acceleration safely in memory.`,
      timestamp: time,
      links: [{ label: 'Simulate What-If Outage', to: '/recovery' }],
    };
  }

  // 5. Portfolio / All Projects questions (Admin / Manager)
  if (q.includes('project') || q.includes('portfolio') || q.includes('oversee') || q.includes('directory')) {
    return {
      id: Date.now(),
      sender: 'assistant',
      text: `You have access to **${projects.length} authorized workspace(s)**:`,
      table: {
        headers: ['Project Name', 'Manager', 'Deadline', 'Status'],
        rows: projects.map((p) => [
          p.name,
          p.manager_name || 'Engineering Lead',
          `${p.deadline_days || 30} days`,
          (p.schedule_metrics?.project_duration_days || 0) > (p.deadline_days || 30) ? 'Risk' : 'On Track',
        ]),
      },
      links: [{ label: 'Open Project Directory', to: '/projects' }],
      timestamp: time,
    };
  }

  // 6. Attention / General Project Status
  if (q.includes('attention') || q.includes('status') || q.includes('health') || q.includes('summary') || q.includes('risk')) {
    const isOver = duration > deadline;
    return {
      id: Date.now(),
      sender: 'assistant',
      text: `**Executive Briefing for "${activeProject?.name}":**\n\n- **Target Deadline:** ${deadline} Days\n- **Estimated Duration:** ${duration} Days (${isOver ? '⚠️ Over Deadline' : '✅ On Track'})\n- **Total Planned Effort:** ${tasks.reduce((a, t) => a + (t.estimated_hours || 0), 0)} Hours\n- **Confirmed Squad:** ${teamMembers.length} Specialists\n- **Zero-Slack Tasks:** ${critIds.size} Critical Path Deliverables`,
      links: [
        { label: 'View Overview Briefing', to: '/overview' },
        { label: 'Check CPM Schedule', to: '/task-planning' },
      ],
      timestamp: time,
    };
  }

  // 7. Fallback helpful guide
  return {
    id: Date.now(),
    sender: 'assistant',
    text: `I've analyzed "${activeProject?.name}". You can ask me specific questions such as:\n- *"Which tasks are on the critical path?"*\n- *"Who has available workload capacity?"*\n- *"What are my assigned deliverables?"*\n- *"Explain the latest recovery proposal"*`,
    timestamp: time,
    links: [
      { label: 'View Dashboard', to: '/overview' },
      { label: 'Inspect Team Roster', to: '/team-formation' },
    ],
  };
}
