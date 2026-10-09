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

const STORAGE_KEY = 'ryzen_matrix_direct_messages_v2';

// Canonical ID normalization for unified threads
function getCanonicalUserId(user, role) {
  if (role === 'admin' || user?.role === 'admin') return 'admin-999';
  if (role === 'manager' || user?.role === 'manager') return 'manager-888';
  return String(user?.candidate_id || user?.id || user?.name || 'guest-member');
}

function getThreadId(id1, id2) {
  const clean1 = String(id1).trim();
  const clean2 = String(id2).trim();
  return [clean1, clean2].sort().join('___');
}

export function DirectMessagesPage() {
  const { user, role } = useAuth();
  const { activeProject, members } = useProject();

  const currentUserId = getCanonicalUserId(user, role);

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [allThreads, setAllThreads] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync with localStorage across tabs and role switches
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setAllThreads(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to parse messages from localStorage', err);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('ryzen-matrix-message-sync', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('ryzen-matrix-message-sync', handleStorage);
    };
  }, []);

  // Build authorized contact directory
  useEffect(() => {
    const team = activeProject?.team_members || members || [];
    const contactList = [];

    const adminContact = {
      id: 'admin-999',
      name: 'Aarav Sharma (Chief Architect)',
      role: 'admin',
      roleTitle: 'Workspace Admin',
      status: 'Governance Scope (Bengaluru)',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80',
    };

    const managerContact = {
      id: 'manager-888',
      name: activeProject?.manager_name || 'Priya Patel (Delivery Lead)',
      role: 'manager',
      roleTitle: 'Project Manager',
      status: 'Lead Oversight (Mumbai)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
    };

    if (role === 'member') {
      // Members can chat directly with Workspace Admin, Project Lead, and Teammates
      contactList.push(adminContact);
      contactList.push(managerContact);

      team
        .filter((m) => {
          const mId = String(m.candidate_id || m.id || m.name);
          return mId !== currentUserId && m.name !== user?.name;
        })
        .forEach((m) => {
          contactList.push({
            id: String(m.candidate_id || m.id || m.name),
            name: m.name,
            role: 'member',
            roleTitle: m.role_title || 'Software Specialist',
            status: 'Confirmed Specialist',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
          });
        });
    } else if (role === 'manager') {
      // Managers can chat with Admin and all Project Specialists
      contactList.push(adminContact);
      team.forEach((m) => {
        contactList.push({
          id: String(m.candidate_id || m.id || m.name),
          name: m.name,
          role: 'member',
          roleTitle: m.role_title || 'Team Member',
          status: 'Project Member',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
        });
      });
    } else {
      // Admin can chat with Managers and all Specialists
      contactList.push(managerContact);
      team.forEach((m) => {
        contactList.push({
          id: String(m.candidate_id || m.id || m.name),
          name: m.name,
          role: 'member',
          roleTitle: m.role_title || 'Specialist',
          status: 'Roster Member',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
        });
      });
    }

    setContacts(contactList);

    // Keep active selected contact or pick first
    setSelectedContact((prev) => {
      if (prev && contactList.some((c) => c.id === prev.id)) {
        return contactList.find((c) => c.id === prev.id);
      }
      return contactList[0] || null;
    });

    // Seed default baseline message for each contact if thread is completely empty
    setAllThreads((prev) => {
      let updated = { ...prev };
      let changed = false;

      contactList.forEach((c) => {
        const threadKey = getThreadId(currentUserId, c.id);
        if (!updated[threadKey] || updated[threadKey].length === 0) {
          updated[threadKey] = [
            {
              id: `m-init-${threadKey}`,
              senderId: c.id,
              senderName: c.name,
              text: `Hi ${user?.name?.split(' ')[0] || 'there'}, touching base regarding deliverables on "${activeProject?.name || 'our project'}". Let me know if you have any questions or blockers.`,
              timestamp: '09:00 AM',
              status: 'delivered',
            },
          ];
          changed = true;
        }
      });

      if (changed) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Storage save failed', e);
        }
      }
      return updated;
    });
  }, [activeProject, members, role, user, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allThreads, selectedContact]);

  const activeThreadKey = selectedContact ? getThreadId(currentUserId, selectedContact.id) : null;
  const activeMessages = activeThreadKey ? allThreads[activeThreadKey] || [] : [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !selectedContact || !activeThreadKey || isSending) return;

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUserId,
      senderName: user?.name || (role === 'admin' ? 'Aarav Sharma' : role === 'manager' ? 'Priya Patel' : 'Member'),
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    const updatedThreads = {
      ...allThreads,
      [activeThreadKey]: [...(allThreads[activeThreadKey] || []), newMsg],
    };

    setAllThreads(updatedThreads);
    setMessageText('');
    setIsSending(true);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedThreads));
      window.dispatchEvent(new CustomEvent('ryzen-matrix-message-sync'));
    } catch (err) {
      console.error('Storage write error', err);
    }

    // Realistic server delivered confirmation
    setTimeout(() => {
      setAllThreads((prev) => {
        const currentList = prev[activeThreadKey] || [];
        const confirmedList = currentList.map((m) =>
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        );
        const finalThreads = { ...prev, [activeThreadKey]: confirmedList };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalThreads));
          window.dispatchEvent(new CustomEvent('ryzen-matrix-message-sync'));
        } catch (e) {}
        return finalThreads;
      });
      setIsSending(false);
    }, 250);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col font-sans">
      {/* Header Banner */}
      <div className="bg-[#FFFBF4] rounded-2xl border border-[#D8CFBC]/60 p-4 sm:p-5 flex items-center justify-between shadow-2xs shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#11120D] text-[#FFFBF4]">
              {role === 'admin' ? 'Admin Portal' : role === 'manager' ? 'Management' : 'Member Workspace'}
            </span>
            <span className="text-xs text-[#565449] font-medium">
              Synchronized Direct Messages
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D8CFBC]/40 text-[#11120D] border border-[#D8CFBC]">
              ⚡ Team Ryzen Matrix
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#11120D] tracking-tight mt-1">
            Direct Messages & Coordination
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#565449] bg-[#D8CFBC]/20 px-3 py-1.5 rounded-xl border border-[#D8CFBC]/60">
          <Shield className="w-3.5 h-3.5 text-[#565449]" />
          <span>Encrypted Scope: <strong className="text-[#11120D]">{activeProject?.name || 'Workspace'}</strong></span>
        </div>
      </div>

      {/* Split View: Contacts Sidebar + Active Thread */}
      <div className="flex-1 bg-white rounded-3xl border border-[#D8CFBC]/70 shadow-xs flex overflow-hidden min-h-0">
        
        {/* Left: Contact Directory */}
        <div className={`w-full md:w-72 lg:w-80 border-r border-[#D8CFBC]/40 flex flex-col shrink-0 bg-[#FFFBF4]/60 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-[#D8CFBC]/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#565449]/70 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#D8CFBC] text-xs font-medium text-[#11120D] placeholder-[#565449]/60 focus:outline-none focus:ring-2 focus:ring-[#11120D]/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              const threadKey = getThreadId(currentUserId, contact.id);
              const contactMsgs = allThreads[threadKey] || [];
              const lastMsg = contactMsgs[contactMsgs.length - 1];

              return (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-[#11120D] text-[#FFFBF4] shadow-xs'
                      : 'bg-white hover:bg-[#D8CFBC]/25 text-[#11120D] border border-[#D8CFBC]/50'
                  }`}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0 bg-[#D8CFBC]/40"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(contact.name)}`;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#FFFBF4]' : 'text-[#11120D]'}`}>
                        {contact.name}
                      </span>
                      {lastMsg && (
                        <span className={`text-[9px] font-mono ${isSelected ? 'text-[#D8CFBC]' : 'text-[#565449]'}`}>
                          {lastMsg.timestamp}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-medium truncate ${isSelected ? 'text-[#D8CFBC]' : 'text-[#565449]'}`}>
                        {contact.roleTitle}
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider font-semibold px-1 rounded ${isSelected ? 'bg-white/20 text-[#FFFBF4]' : 'bg-[#D8CFBC]/30 text-[#565449]'}`}>
                        {contact.role}
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
          <div className={`flex-1 flex flex-col min-w-0 bg-white ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
            {/* Conversation Top Header */}
            <div className="px-4 sm:px-5 py-3.5 border-b border-[#D8CFBC]/40 flex items-center justify-between bg-[#FFFBF4]/80 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                {/* Mobile back button */}
                <button
                  onClick={() => setSelectedContact(null)}
                  className="md:hidden p-1.5 -ml-1 rounded-xl text-[#11120D] hover:bg-[#D8CFBC]/30 transition"
                  title="Back to contacts"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#D8CFBC] shrink-0"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedContact.name)}`;
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#11120D] truncate">
                      {selectedContact.name}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#11120D] text-[#FFFBF4]">
                      {selectedContact.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#565449] font-medium block truncate">
                    {selectedContact.roleTitle} &bull; {selectedContact.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#565449]">
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-[#11120D] bg-[#D8CFBC]/30 px-2.5 py-1 rounded-full border border-[#D8CFBC]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Real-Time Synchronized</span>
                </div>
              </div>
            </div>

            {/* Message Thread List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#FFFBF4]/20">
              {activeMessages.map((msg) => {
                const isMe = String(msg.senderId) === String(currentUserId);
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-semibold text-[#565449] mb-1 px-1">
                        {msg.senderName}
                      </span>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1 shadow-2xs ${
                        isMe
                          ? 'bg-[#11120D] text-[#FFFBF4] rounded-br-xs'
                          : 'bg-white text-[#11120D] border border-[#D8CFBC] rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] text-[#565449] font-mono">
                      <span>{msg.timestamp}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'delivered' ? (
                            <CheckCheck className="w-3 h-3 text-emerald-600 inline" />
                          ) : (
                            <Check className="w-3 h-3 text-[#565449] inline" />
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
              className="p-3.5 border-t border-[#D8CFBC]/40 bg-[#FFFBF4]/80 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder={`Message ${selectedContact.name}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-[#D8CFBC] text-xs font-medium text-[#11120D] placeholder-[#565449]/60 focus:outline-none focus:ring-2 focus:ring-[#11120D]/20"
              />
              <button
                type="submit"
                disabled={!messageText.trim() || isSending}
                className="px-5 py-2.5 rounded-2xl bg-[#11120D] hover:bg-[#565449] active:scale-95 text-[#FFFBF4] text-xs font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5 text-[#D8CFBC]" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#565449] text-xs p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-[#D8CFBC]" />
            <span className="font-semibold text-[#11120D]">Select a team member to start direct messaging</span>
          </div>
        )}
      </div>
    </div>
  );
}

