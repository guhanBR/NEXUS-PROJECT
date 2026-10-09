import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUp,
  Mic,
  MicOff,
  Trash2,
  Sparkles,
  ArrowRight,
  Battery,
  Wifi,
  Signal,
  X,
  Volume2,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export function RebalanceXAssistant() {
  const {
    activeProject,
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
  const [isListening, setIsListening] = useState(false);
  const [currentTime, setCurrentTime] = useState('19:02');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Live clock for mobile status bar (matches screenshot format 19:02)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

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

  // Suggestion prompt chips (includes Botpaddy style chips + project intelligence)
  const suggestionChips = [
    'Who is overloaded?',
    'What\'s on critical path?',
    'Simulate developer outage',
    'What are my assigned tasks?',
    'Show project deadlines',
    'Help me balance workload',
  ];

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSend = async (queryText = inputQuery) => {
    const text = (queryText || '').trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Realistic analytical latency with grounded telemetry computation
    setTimeout(() => {
      const assistantResponse = processProjectQuery(text, {
        activeProject,
        projects,
        members,
        activeProposal,
        user,
        role,
        currentTime,
      });

      setMessages((prev) => [...prev, assistantResponse]);
      setIsTyping(false);
    }, 450);
  };

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      handleSend(transcript);
    };

    if (!isListening) {
      recognition.start();
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) with Glowing Botpaddy Mini-Orb */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 rounded-full bg-white text-slate-900 shadow-2xl hover:shadow-orange-500/20 border border-slate-200 transition-all duration-300 hover:scale-105 group"
          aria-label="Open Soye Botpaddy Assistant"
        >
          {/* Glowing Orange Halo Avatar */}
          <div className="relative flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-[#FF5E2B] shadow-[0_0_12px_#FF5E2B] flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
              <div className="w-3.5 h-3.5 rounded-full bg-white" />
            </div>
          </div>
          <div className="text-left pr-1">
            <span className="text-xs font-bold text-slate-900 block leading-tight">Soye Botpaddy</span>
            <span className="text-[10px] text-slate-500 font-medium">RebalanceX AI</span>
          </div>
        </button>
      )}

      {/* Floating Botpaddy Modal / Mobile Card UI (Exact 1:1 Match to Reference) */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] h-[640px] max-h-[90vh] bg-white rounded-[36px] border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
          
          {/* Mobile Top Status Header (19:02, LTE, Battery, Back Button) */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between text-slate-900 shrink-0 select-none">
            {/* Back Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 -ml-2 rounded-full text-slate-800 hover:text-slate-950 hover:bg-slate-100 transition"
              title="Close Botpaddy"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>

            {/* Time */}
            <span className="text-xs font-bold tracking-tight text-slate-900 font-mono">
              {currentTime}
            </span>

            {/* Status Icons: LTE & Battery */}
            <div className="flex items-center gap-1.5 text-slate-900">
              <span className="text-[10px] font-extrabold tracking-wider">LTE</span>
              <div className="w-5 h-2.5 border border-slate-900 rounded-[3px] p-[1px] flex items-center">
                <div className="w-full h-full bg-slate-900 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Body Area: Welcome State or Active Message Stream */}
          <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col justify-between">
            {messages.length === 0 ? (
              /* Center Hero Empty State (Exact 1:1 Match to Image) */
              <div className="my-auto flex flex-col items-center justify-center text-center py-8">
                {/* Glowing Pulsating Orange Halo Ring Orb */}
                <div className="relative mb-8 flex items-center justify-center">
                  {/* Diffuse Outer Glow */}
                  <div className="w-24 h-24 rounded-full bg-[#FF5E2B]/30 blur-xl absolute -inset-2 botpaddy-glow-orb" />
                  
                  {/* Thick Orange Ring with White Center */}
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF5E2B] via-[#FF6E38] to-[#FF4B12] p-[14px] shadow-[0_0_30px_rgba(255,94,43,0.5)] botpaddy-glow-orb">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-inner" />
                  </div>
                </div>

                {/* Friendly Botpaddy Greeting */}
                <h2 className="text-xl sm:text-[22px] font-bold text-[#1A1F26] tracking-tight">
                  Hi I'm Soye, Ur Botpaddy
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1 max-w-[260px]">
                  Your autonomous project copilot. Ask me about tasks, schedules, or workload.
                </p>
              </div>
            ) : (
              /* Active Conversational Message Stream */
              <div className="space-y-3.5 py-2">
                {/* Top mini badge in conversational mode */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5E2B]" />
                    <span className="font-bold text-slate-700">Soye Active</span>
                  </div>
                  <button
                    onClick={handleClearChat}
                    className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {msg.sender === 'assistant' ? (
                      <div className="flex gap-2.5 max-w-[92%]">
                        {/* Mini Glowing Orb Avatar */}
                        <div className="w-6 h-6 rounded-full bg-[#FF5E2B] p-1 shadow-[0_0_8px_#FF5E2B] shrink-0 mt-1">
                          <div className="w-full h-full rounded-full bg-white" />
                        </div>

                        {/* Assistant Response Bubble */}
                        <div className="bg-[#F8FAF9] text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3.5 space-y-2.5 shadow-2xs text-xs leading-relaxed">
                          {msg.text && (
                            <p className="whitespace-pre-wrap font-medium text-slate-800">
                              {msg.text}
                            </p>
                          )}

                          {/* Data Table if applicable */}
                          {msg.table && (
                            <div className="overflow-x-auto my-1.5 rounded-xl border border-slate-200">
                              <table className="w-full text-left text-[10px]">
                                <thead className="bg-slate-100 font-bold text-slate-700 uppercase tracking-wider">
                                  <tr>
                                    {msg.table.headers.map((h, i) => (
                                      <th key={i} className="px-2 py-1">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {msg.table.rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                      {row.map((cell, j) => (
                                        <td key={j} className="px-2 py-1 font-medium">{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Action Navigation Links */}
                          {msg.links && msg.links.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                              {msg.links.map((link, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    navigate(link.to);
                                    setIsOpen(false);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-[10px] font-bold transition shadow-2xs"
                                >
                                  <span>{link.label}</span>
                                  <ArrowRight className="w-3 h-3 text-[#FF5E2B]" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* User Message Bubble */
                      <div className="max-w-[85%] bg-[#1A1F26] text-white rounded-2xl rounded-br-xs px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm">
                        {msg.text}
                      </div>
                    )}

                    <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs w-fit">
                    <div className="w-4 h-4 rounded-full bg-[#FF5E2B] p-[3px] animate-pulse">
                      <div className="w-full h-full rounded-full bg-white" />
                    </div>
                    <span className="font-semibold text-slate-600">Soye is thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Actions Section: Suggestion Chips + Input Bar */}
          <div className="p-4 pt-1 bg-white space-y-3 shrink-0">
            {/* Horizontal Scrollable Suggestion Chips (Matches Reference) */}
            <div className="overflow-x-auto flex gap-2 pb-1 no-scrollbar select-none">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="whitespace-nowrap px-4 py-2 rounded-full bg-[#F2F4F7] hover:bg-[#E5E7EB] active:scale-95 text-slate-700 text-xs font-semibold transition-all border border-slate-200/60 shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Pill-Shaped Input Bar (Matches Reference: Rounded pill, Mic Icon, Coral Send Circle) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="bg-[#F2F4F7] border border-slate-200/90 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-inner-xs"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about your project, tasks, or team..."
                className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-1.5"
              />

              {/* Speech-to-text Microphone Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-full transition ${
                  isListening
                    ? 'text-red-500 bg-red-100 animate-pulse'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={isListening ? 'Listening...' : 'Voice Input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Orange Circular Send Button with Upward Arrow */}
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="w-8 h-8 rounded-full bg-[#FF5E2B] hover:bg-[#E64B17] active:scale-95 text-white flex items-center justify-center shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                title="Send Message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Intelligent grounded response synthesis engine
function processProjectQuery(query, ctx) {
  const q = query.toLowerCase();
  const { activeProject, projects, members, activeProposal, user, role, currentTime } = ctx;

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
        timestamp: currentTime,
        links: [{ label: 'View Gantt Schedule', to: '/task-planning' }],
      };
    }

    return {
      id: Date.now(),
      sender: 'assistant',
      text: `There are **${critTasks.length} deliverables on the Critical Path** (0-day slack). Any delay will push project completion beyond ${duration} days:`,
      table: {
        headers: ['ID', 'Deliverable', 'Duration', 'Assignee'],
        rows: critTasks.map((t) => {
          const owner = teamMembers.find((m) => m.candidate_id === t.assigned_candidate_id);
          return [
            `#${t.id}`,
            t.title,
            `Day ${t.start_day || 0} → ${t.end_day || 0}`,
            owner?.name || 'Unassigned',
          ];
        }),
      },
      links: [{ label: 'Open Gantt Timeline', to: '/task-planning' }],
      timestamp: currentTime,
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
        text: `You currently have no direct deliverables assigned in "${activeProject?.name}". Review the tasks board to pick up open work.`,
        timestamp: currentTime,
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
          `${t.estimated_hours}h`,
          `Day ${t.start_day || 0} → ${t.end_day || 0}`,
          (t.status || 'todo').toUpperCase(),
        ]),
      },
      links: [{ label: 'Update Task Status', to: '/task-planning' }],
      timestamp: currentTime,
    };
  }

  // 3. Team / Overloaded / Capacity questions
  if (q.includes('overload') || q.includes('team') || q.includes('capacity') || q.includes('roster') || q.includes('who is on') || q.includes('engineer') || q.includes('members')) {
    if (teamMembers.length === 0) {
      return {
        id: Date.now(),
        sender: 'assistant',
        text: `"${activeProject?.name}" does not have a confirmed team yet. Use Smart Team Formation to assemble an optimal squad.`,
        timestamp: currentTime,
        links: [{ label: 'Form Team Roster', to: '/team-formation' }],
      };
    }

    return {
      id: Date.now(),
      sender: 'assistant',
      text: `"${activeProject?.name}" has **${teamMembers.length} confirmed specialists** with a total capacity of ${teamMembers.reduce((acc, m) => acc + (m.weekly_capacity_hours || 40), 0)}h/week:`,
      table: {
        headers: ['Specialist', 'Role Title', 'Capacity', 'Experience'],
        rows: teamMembers.map((m) => [
          m.name,
          m.role_title,
          `${m.weekly_capacity_hours || 40}h/wk`,
          `${m.experience_years} yrs`,
        ]),
      },
      links: [{ label: 'Inspect Team Roster', to: '/team-formation' }],
      timestamp: currentTime,
    };
  }

  // 4. Recovery proposal / Outage simulation questions
  if (q.includes('recovery') || q.includes('outage') || q.includes('proposal') || q.includes('simulate') || q.includes('what-if') || q.includes('disruption')) {
    if (activeProposal) {
      const reassignments = activeProposal.reassigned_tasks || [];
      return {
        id: Date.now(),
        sender: 'assistant',
        text: `Active **Recovery Proposal** has an estimated duration of **${activeProposal.estimated_duration_days || duration} days** (${Math.round((activeProposal.confidence_score || 0.98) * 100)}% solver confidence) and **${reassignments.length} automated reallocations**:`,
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
        timestamp: currentTime,
      };
    }

    return {
      id: Date.now(),
      sender: 'assistant',
      text: `No active disruption pending for "${activeProject?.name}". You can test developer absences or deadline acceleration in the sandbox.`,
      timestamp: currentTime,
      links: [{ label: 'Simulate What-If Outage', to: '/recovery' }],
    };
  }

  // 5. Portfolio / All Projects questions
  if (q.includes('project') || q.includes('portfolio') || q.includes('deadline') || q.includes('directory')) {
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
          (p.schedule_metrics?.project_duration_days || 0) > (p.deadline_days || 30) ? '⚠️ Risk' : '✅ On Track',
        ]),
      },
      links: [{ label: 'Open Project Directory', to: '/projects' }],
      timestamp: currentTime,
    };
  }

  // 6. Default / Fallback guidance
  return {
    id: Date.now(),
    sender: 'assistant',
    text: `I've analyzed "${activeProject?.name}". Ask me specific questions such as:\n• *"Who is overloaded?"*\n• *"What's on the critical path?"*\n• *"Simulate a developer outage"*\n• *"Show project deadlines"*`,
    timestamp: currentTime,
    links: [
      { label: 'View Overview Briefing', to: '/overview' },
      { label: 'Check CPM Schedule', to: '/task-planning' },
    ],
  };
}
