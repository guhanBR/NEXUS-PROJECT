import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import {
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Users,
  Calendar,
  Send,
  Sparkles,
  Info,
} from 'lucide-react';

export function OvertimeManagementPage() {
  const { user, role } = useAuth();
  const { activeProject, members } = useProject();

  const [requests, setRequests] = useState([
    {
      id: 'ot-101',
      recipientName: 'Rohan Verma',
      recipientId: 'cand-1',
      projectTitle: activeProject?.name || 'Tata FinTech Quantum Core Alpha',
      taskTitle: 'PostgreSQL Connection Pooling & Stress Benchmark',
      requestedHours: 6,
      proposedDate: 'Saturday, 16 July 2026',
      reason: 'Accelerate zero-slack critical path deliverable before RBI & NPCI compliance audit',
      status: 'pending', // 'pending' | 'accepted' | 'declined'
      issuedBy: 'Priya Patel (Delivery Lead)',
      issuedAt: '14 July 2026',
    },
    {
      id: 'ot-102',
      recipientName: 'Priya Sharma',
      recipientId: 'cand-2',
      projectTitle: activeProject?.name || 'Tata FinTech Quantum Core Alpha',
      taskTitle: 'CyberSecurity Role-Based RBAC Enforcement',
      requestedHours: 4,
      proposedDate: 'Sunday, 17 July 2026',
      reason: 'OAuth2 token rotation verification for UPI Gateway',
      status: 'accepted',
      issuedBy: 'Aarav Sharma (Admin)',
      issuedAt: '13 July 2026',
    },
  ]);

  // Form state for Admin to issue a new request
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formRecipient, setFormRecipient] = useState(members[0]?.name || 'Rohan Verma');
  const [formTask, setFormTask] = useState(activeProject?.tasks?.[0]?.title || 'Core Deliverable');
  const [formHours, setFormHours] = useState(4);
  const [formDate, setFormDate] = useState('2026-07-18');
  const [formReason, setFormReason] = useState('');

  const handleIssueRequest = (e) => {
    e.preventDefault();
    if (!formReason.trim()) return;

    const newReq = {
      id: `ot-${Date.now()}`,
      recipientName: formRecipient,
      recipientId: `cand-${Date.now()}`,
      projectTitle: activeProject?.name || 'Active Project',
      taskTitle: formTask,
      requestedHours: Number(formHours),
      proposedDate: formDate,
      reason: formReason.trim(),
      status: 'pending',
      issuedBy: `${user?.name || 'Admin'} (${role})`,
      issuedAt: new Date().toLocaleDateString(),
    };

    setRequests((prev) => [newReq, ...prev]);
    setIsModalOpen(false);
    setFormReason('');
  };

  const handleResponse = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  // Filter requests based on role
  const visibleRequests = role === 'member'
    ? requests.filter((r) => r.recipientName === user?.name || r.recipientName === 'Alex Morgan')
    : requests;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
              {role === 'admin'
                ? 'Overtime Requests'
                : role === 'manager'
                ? 'Overtime Overview'
                : 'My Overtime Requests'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Voluntary Allocation Framework
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-900 border border-amber-300/40">
              ⚡ Team Ryzen Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
            {role === 'member'
              ? 'My Voluntary Overtime Requests'
              : 'Voluntary Overtime Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
            Overtime is strictly voluntary. Declining an overtime request has zero negative impact on recorded performance ratings or allocation standing.
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Issue Overtime Request</span>
          </button>
        )}
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {role === 'member' ? 'Your Pending & Responded Requests' : 'All Project Overtime Requests'}
            </h2>
            <p className="text-xs text-slate-500">Recorded request lifecycle states</p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {visibleRequests.length} Request(s)
          </span>
        </div>

        {visibleRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No active overtime requests for this workspace.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleRequests.map((req) => (
              <div key={req.id} className="p-6 space-y-3 hover:bg-slate-50/50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        {req.taskTitle}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : req.status === 'declined'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Recipient: <strong className="text-slate-800">{req.recipientName}</strong> &bull; Requested by: {req.issuedBy} ({req.issuedAt})
                    </p>
                  </div>

                  {/* Actions for Member when status is pending */}
                  {role === 'member' && req.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResponse(req.id, 'declined')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => handleResponse(req.id, 'accepted')}
                        className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Voluntarily Accept</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Proposed Hours</span>
                    <span className="font-bold text-slate-800">{req.requestedHours} Extra Hours</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Window</span>
                    <span className="font-bold text-slate-800">{req.proposedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Reason / Impact</span>
                    <span className="text-slate-700">{req.reason}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Issue Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Issue Voluntary Overtime Request
                </h3>
                <p className="text-xs text-slate-500">
                  Notify specialist with context, proposed hours, and deadline reasoning
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleIssueRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Recipient Specialist
                </label>
                <select
                  value={formRecipient}
                  onChange={(e) => setFormRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                >
                  {members.map((m) => (
                    <option key={m.id || m.candidate_id} value={m.name}>
                      {m.name} ({m.role_title || 'Engineer'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Associated Task / Deliverable
                </label>
                <input
                  type="text"
                  value={formTask}
                  onChange={(e) => setFormTask(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Proposed Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason for Overtime Request
                </label>
                <textarea
                  rows="3"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Explain why extra capacity is requested and its project impact..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Send Voluntary Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
