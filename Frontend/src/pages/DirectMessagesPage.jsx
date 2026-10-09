import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import {
  Send,
  Search,
  User,
  Shield,
  MessageSquare,
  Sparkles,
  Clock,
  CheckCheck,
  Check,
  Phone,
  Video,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

export function DirectMessagesPage() {
  const { user, role } = useAuth();
  const { activeProject, members } = useProject();

  // Active contact list derived from project specialists + management
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messagesByContact, setMessagesByContact] = useState({});
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Generate authorized conversation partners based on role and project members
    const team = activeProject?.team_members || members || [];
    const contactList = [];

    if (role === 'member') {
      // Members can chat with Delivery Lead/Admin and Teammates
      contactList.push({
        id: 'lead-1',
        name: activeProject?.manager_name || 'Sarah Chen (Delivery Lead)',
        role: 'manager',
        roleTitle: 'Project Manager',
        status: 'Active in Workspace',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      });
      team.filter((m) => m.name !== user?.name).forEach((m) => {
        contactList.push({
          id: m.candidate_id || m.id || `member-${m.name}`,
          name: m.name,
          role: 'member',
          roleTitle: m.role_title || 'Engineer',
          status: 'Confirmed Specialist',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
        });
      });
    } else if (role === 'manager') {
      // Managers can chat with Admin and all project members
      contactList.push({
        id: 'admin-1',
        name: 'Alex Rivera (System Administrator)',
        role: 'admin',
        roleTitle: 'Workspace Admin',
        status: 'Governance Scope',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80',
      });
      team.forEach((m) => {
        contactList.push({
          id: m.candidate_id || m.id || `member-${m.name}`,
          name: m.name,
          role: 'member',
          roleTitle: m.role_title || 'Team Member',
          status: 'Project Member',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
        });
      });
    } else {
      // Admin can chat with Managers and all Specialists
      contactList.push({
        id: 'manager-1',
        name: activeProject?.manager_name || 'Sarah Chen (Delivery Manager)',
        role: 'manager',
        roleTitle: 'Project Manager',
        status: 'Lead Oversight',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      });
      team.forEach((m) => {
        contactList.push({
          id: m.candidate_id || m.id || `member-${m.name}`,
          name: m.name,
          role: 'member',
          roleTitle: m.role_title || 'Specialist',
          status: 'Roster Member',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
        });
      });
    }

    setContacts(contactList);
    if (contactList.length > 0 && !selectedContact) {
      setSelectedContact(contactList[0]);
    }

    // Default seed conversation logs
    const seedLogs = {};
    contactList.forEach((c) => {
      seedLogs[c.id] = [
        {
          id: `m-init-${c.id}`,
          senderId: c.id,
          senderName: c.name,
          text: `Hi ${user?.name?.split(' ')[0] || 'there'}, touching base regarding deliverables on "${activeProject?.name || 'our project'}".`,
          timestamp: '10:15 AM',
          status: 'delivered',
        },
      ];
    });
    setMessagesByContact(seedLogs);
  }, [activeProject, members, role, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesByContact, selectedContact]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !selectedContact || isSending) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'me',
      senderName: user?.name || 'Me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessagesByContact((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }));

    setMessageText('');
    setIsSending(true);

    // Realistic server confirmation update
    setTimeout(() => {
      setMessagesByContact((prev) => ({
        ...prev,
        [selectedContact.id]: prev[selectedContact.id].map((m) =>
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        ),
      }));
      setIsSending(false);
    }, 300);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMessages = selectedContact ? messagesByContact[selectedContact.id] || [] : [];

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-center justify-between shadow-2xs shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
              {role === 'admin' ? 'Admin Portal' : role === 'manager' ? 'Management' : 'Member Workspace'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Authorized Direct Messages
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-900 border border-amber-300/40">
              ⚡ Team Ryzen Matrix
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Direct Messages & Coordination
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Peer Scope: <strong>{activeProject?.name || 'Workspace'}</strong></span>
        </div>
      </div>

      {/* Split View: Contacts Sidebar + Active Thread */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex overflow-hidden min-h-0">
        
        {/* Left: Contact Directory */}
        <div className="w-72 sm:w-80 border-r border-slate-100 flex flex-col shrink-0 bg-slate-50/50">
          <div className="p-3.5 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              const contactMsgs = messagesByContact[contact.id] || [];
              const lastMsg = contactMsgs[contactMsgs.length - 1];

              return (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100/80 text-slate-800 border border-slate-200/60'
                  }`}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0 bg-slate-200"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(contact.name)}`;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {contact.name}
                      </span>
                      {lastMsg && (
                        <span className={`text-[9px] font-mono ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                          {lastMsg.timestamp}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-medium truncate ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                        {contact.roleTitle}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Message Stream & Input */}
        {selectedContact ? (
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Conversation Top Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedContact.name)}`;
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {selectedContact.name}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedContact.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block truncate">
                    {selectedContact.roleTitle} &bull; {selectedContact.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Channel Open</span>
                </div>
              </div>
            </div>

            {/* Message Thread List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#F9FBFA]/50">
              {activeMessages.map((msg) => {
                const isMe = msg.senderId === (user?.id || 'me');
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1 shadow-2xs ${
                        isMe
                          ? 'bg-slate-900 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] text-slate-400 font-mono">
                      <span>{msg.timestamp}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'delivered' ? (
                            <CheckCheck className="w-3 h-3 text-emerald-600 inline" />
                          ) : (
                            <Check className="w-3 h-3 text-slate-400 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3.5 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder={`Message ${selectedContact.name}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
              />
              <button
                type="submit"
                disabled={!messageText.trim() || isSending}
                className="px-4 py-2.5 rounded-2xl bg-[#FF5E2B] hover:bg-[#E54A17] active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300" />
            <span className="font-semibold text-slate-600">Select a team member to start direct messaging</span>
          </div>
        )}
      </div>
    </div>
  );
}
