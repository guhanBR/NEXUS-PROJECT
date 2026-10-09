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

const ROOM_STORAGE_KEY = 'ryzen_matrix_room_messages_v2';

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
  const [roomMessages, setRoomMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(ROOM_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
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
          text: 'Design tokens and contrast standards are synced with the architectural 4-color palette.',
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
    };
  });

  const [mobileView, setMobileView] = useState('feed');
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const messagesEndRef = useRef(null);

  // Cross-tab and role switch listener
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(ROOM_STORAGE_KEY);
        if (saved) setRoomMessages(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('ryzen-matrix-room-sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ryzen-matrix-room-sync', handleSync);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages, activeRoomId]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text) return;

    const newMsg = {
      id: `rmsg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderName: user?.name || (role === 'admin' ? 'Aarav Sharma' : role === 'manager' ? 'Priya Patel' : 'Member'),
      senderRole: role || 'member',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = {
      ...roomMessages,
      [activeRoomId]: [...(roomMessages[activeRoomId] || []), newMsg],
    };

    setRoomMessages(updated);
    setMessageText('');

    try {
      localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('ryzen-matrix-room-sync'));
    } catch (e) {}
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col font-sans">
      {/* Header Banner */}
      <div className="bg-[#FFFBF4] rounded-2xl border border-[#D8CFBC]/60 p-4 sm:p-5 flex items-center justify-between shadow-2xs shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#11120D] text-[#FFFBF4]">
              Project Collaboration
            </span>
            <span className="text-xs text-[#565449] font-medium">
              Scoped Discussion Rooms
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D8CFBC]/40 text-[#11120D] border border-[#D8CFBC]">
              ⚡ Team Ryzen Matrix
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#11120D] tracking-tight mt-1">
            Project Discussion Rooms
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#565449] bg-[#D8CFBC]/20 px-3 py-1.5 rounded-xl border border-[#D8CFBC]/60">
          <Shield className="w-3.5 h-3.5 text-[#565449]" />
          <span>Active Scope: <strong className="text-[#11120D]">{activeProject?.name || 'Workspace'}</strong></span>
        </div>
      </div>

      {/* Main Room Layout */}
      <div className="flex-1 bg-white rounded-3xl border border-[#D8CFBC]/70 shadow-xs flex overflow-hidden min-h-0">
        
        {/* Left: Rooms Navigation Sidebar */}
        <div className={`w-full md:w-72 lg:w-80 border-r border-[#D8CFBC]/40 flex flex-col shrink-0 bg-[#FFFBF4]/60 ${mobileView === 'feed' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-[#D8CFBC]/40">
            <span className="text-xs font-bold text-[#11120D] uppercase tracking-wider block">
              Authorized Channels
            </span>
            <span className="text-[11px] text-[#565449] font-medium">
              Role: <strong className="text-[#11120D] capitalize">{role}</strong>
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
                  onClick={() => {
                    setActiveRoomId(room.id);
                    setMobileView('feed');
                  }}
                  className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'bg-[#11120D] text-[#FFFBF4] shadow-xs'
                      : 'bg-white hover:bg-[#D8CFBC]/25 text-[#11120D] border border-[#D8CFBC]/50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-white/20 text-[#FFFBF4]'
                        : 'bg-[#D8CFBC]/30 text-[#11120D]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#FFFBF4]' : 'text-[#11120D]'}`}>
                        #{room.name}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-[#FFFBF4]' : 'bg-[#D8CFBC]/30 text-[#11120D]'}`}>
                        {count}
                      </span>
                    </div>
                    <span className={`text-[10px] font-medium line-clamp-1 mt-0.5 ${isSelected ? 'text-[#D8CFBC]' : 'text-[#565449]'}`}>
                      {room.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Room Feed & Input */}
        <div className={`flex-1 flex flex-col min-w-0 bg-white ${mobileView === 'channels' ? 'hidden md:flex' : 'flex'}`}>
          {/* Room Topic Header */}
          <div className="px-4 sm:px-5 py-3.5 border-b border-[#D8CFBC]/40 flex items-center justify-between bg-[#FFFBF4]/80 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setMobileView('channels')}
                className="md:hidden p-1.5 -ml-1 rounded-xl text-[#11120D] hover:bg-[#D8CFBC]/30 transition"
                title="View channels"
              >
                <Hash className="w-4 h-4 text-[#11120D]" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#565449] shrink-0 hidden md:inline" />
                  <span className="text-sm font-bold text-[#11120D] truncate">
                    {activeRoom.name}
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#11120D] text-[#FFFBF4]">
                    {activeRoom.field}
                  </span>
                </div>
                <p className="text-[11px] text-[#565449] mt-0.5 line-clamp-1">
                  {activeRoom.topic}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#565449] bg-[#D8CFBC]/20 px-2.5 py-1 rounded-xl border border-[#D8CFBC]/60 shrink-0">
              <Users className="w-3.5 h-3.5 text-[#565449]" />
              <span>{activeRoom.membersCount} participants</span>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#FFFBF4]/20">
            {roomMessages[activeRoomId]?.map((msg) => {
              const isMe = msg.senderName === user?.name;
              return (
                <div key={msg.id} className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#11120D]">
                      {msg.senderName}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#D8CFBC]/30 text-[#11120D]">
                      {msg.senderRole}
                    </span>
                    <span className="text-[10px] text-[#565449] font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  <div className={`border rounded-2xl rounded-tl-xs p-3.5 text-xs font-medium leading-relaxed shadow-2xs max-w-[90%] sm:max-w-[75%] ${
                    isMe 
                      ? 'bg-[#11120D] text-[#FFFBF4] border-[#11120D]' 
                      : 'bg-white text-[#11120D] border-[#D8CFBC]'
                  }`}>
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
            className="p-3.5 border-t border-[#D8CFBC]/40 bg-[#FFFBF4]/80 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder={`Message #${activeRoom.name}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-[#D8CFBC] text-xs font-medium text-[#11120D] placeholder-[#565449]/60 focus:outline-none focus:ring-2 focus:ring-[#11120D]/20"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="px-5 py-2.5 rounded-2xl bg-[#11120D] hover:bg-[#565449] active:scale-95 text-[#FFFBF4] text-xs font-bold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5 text-[#D8CFBC]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

