import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import {
  Hash,
  Send,
  Users,
  Shield,
  Layers,
  AlertTriangle,
  Code,
  Terminal,
  Compass,
  Sparkles,
  CheckCheck,
} from 'lucide-react';

export function ProjectRoomsPage() {
  const { user, role } = useAuth();
  const { activeProject, members } = useProject();

  const rooms = [
    {
      id: 'general',
      name: 'general-project-sync',
      label: 'General Project Sync',
      icon: Hash,
      topic: 'High-level milestones, general updates, and cross-discipline coordination',
      membersCount: 8,
      field: 'all',
    },
    {
      id: 'frontend',
      name: 'frontend-architecture',
      label: 'Frontend UI & Client State',
      icon: Code,
      topic: 'React component standards, design token consistency, client state, and responsive layouts',
      membersCount: 4,
      field: 'frontend',
    },
    {
      id: 'backend',
      name: 'backend-apis-optimization',
      label: 'Backend APIs & CPM Solver',
      icon: Terminal,
      topic: 'FastAPI endpoints, critical path algorithms, NSGA-II fitness evaluations, and DB schemas',
      membersCount: 4,
      field: 'backend',
    },
    {
      id: 'blockers',
      name: 'critical-blockers-escalation',
      label: 'Critical Blockers & Escalations',
      icon: AlertTriangle,
      topic: 'Zero-slack bottlenecks, dependency delays, and urgent recovery requests',
      membersCount: 6,
      field: 'all',
    },
  ];

  const [activeRoomId, setActiveRoomId] = useState('general');
  const [messageText, setMessageText] = useState('');
  const [roomMessages, setRoomMessages] = useState({
    general: [
      {
        id: 'r-1',
        senderName: activeProject?.manager_name || 'Priya Patel',
        senderRole: 'manager',
        text: `Welcome all specialists to the "${activeProject?.name || 'Project'}" general channel. Please review your CPM deliverables and report blockers early.`,
        timestamp: '09:30 AM',
      },
      {
        id: 'r-2',
        senderName: 'Rohan Verma',
        senderRole: 'member',
        text: 'Reviewing the initial dependency graph. All UPI & DB baseline packages are linked.',
        timestamp: '09:45 AM',
      },
    ],
    frontend: [
      {
        id: 'r-f-1',
        senderName: 'Ananya Iyer',
        senderRole: 'member',
        text: 'Design tokens and dark/light contrast standards are synced with the UI skill guidelines.',
        timestamp: '10:00 AM',
      },
    ],
    backend: [
      {
        id: 'r-b-1',
        senderName: 'Vikram Malhotra',
        senderRole: 'member',
        text: 'Topological sort CPM calculations verified for zero-slack milestones on Tata Quantum stack.',
        timestamp: '10:10 AM',
      },
    ],
    blockers: [
      {
        id: 'r-bl-1',
        senderName: 'Sneha Reddy',
        senderRole: 'member',
        text: 'No active blockers currently logged. Baseline schedule is green for RBI compliance.',
        timestamp: '09:00 AM',
      },
    ],
  });

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages, activeRoomId]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text) return;

    const newMsg = {
      id: `rmsg-${Date.now()}`,
      senderName: user?.name || 'Current User',
      senderRole: role || 'member',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRoomMessages((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMsg],
    }));

    setMessageText('');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-center justify-between shadow-2xs shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
              Project Collaboration
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Scoped Discussion Rooms
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-900 border border-amber-300/40">
              ⚡ Team Ryzen Matrix
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Project Discussion Rooms
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Scope: <strong>{activeProject?.name || 'Workspace'}</strong></span>
        </div>
      </div>

      {/* Main Room Layout */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex overflow-hidden min-h-0">
        
        {/* Left: Rooms Navigation Sidebar */}
        <div className="w-72 sm:w-80 border-r border-slate-100 flex flex-col shrink-0 bg-slate-50/50">
          <div className="p-3.5 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Authorized Channels
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Role: <strong className="text-slate-700 capitalize">{role}</strong>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {rooms.map((room) => {
              const Icon = room.icon;
              const isSelected = activeRoomId === room.id;
              const count = roomMessages[room.id]?.length || 0;

              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100/80 text-slate-800 border border-slate-200/60'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-white/20 text-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        #{room.name}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {count}
                      </span>
                    </div>
                    <span className={`text-[10px] font-medium line-clamp-1 mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {room.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Room Feed & Input */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Room Topic Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-sm font-bold text-slate-900 truncate">
                  {activeRoom.name}
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {activeRoom.field}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {activeRoom.topic}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 shrink-0">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeRoom.membersCount} participants</span>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#F9FBFA]/50">
            {roomMessages[activeRoomId]?.map((msg) => {
              const isMe = msg.senderName === user?.name;
              return (
                <div key={msg.id} className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {msg.senderName}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {msg.senderRole}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-800 font-medium leading-relaxed shadow-2xs max-w-[90%] sm:max-w-[75%]">
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3.5 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder={`Message #${activeRoom.name}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
