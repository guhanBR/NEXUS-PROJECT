import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  FileCode,
} from 'lucide-react';

export function DecisionHistoryPage() {
  const { activeProjectId } = useProject();
  const [expandedId, setExpandedId] = useState(null);

  const { data: auditEvents = [], isLoading } = useQuery({
    queryKey: ['audit-history', activeProjectId],
    queryFn: () => api.getHistory(activeProjectId),
    enabled: !!activeProjectId,
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge bg-[#202724]/10 text-[#202724] font-bold uppercase tracking-wider text-[10px]">
              Audit Trail
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Immutable Governance Log
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Decision &amp; Audit History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Traceable log of all team confirmations, automated CPM schedule calculations, and recovery approvals.
          </p>
        </div>
        <span className="badge bg-slate-100 text-slate-700 font-medium font-tabular text-xs">
          {auditEvents.length} Recorded Events
        </span>
      </div>

      {/* Events List */}
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D5DED8] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading audit history...
          </div>
        ) : auditEvents.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 space-y-2">
            <p>No decision events recorded for this project yet.</p>
            <p className="text-xs text-slate-400">Team confirmations and recovery approvals will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EBF0EC]">
            {auditEvents.map((event) => {
              const isApproved = event.action_taken === 'APPROVED' || event.action?.includes('APPROV');
              const isRejected = event.action_taken === 'REJECTED';
              const isExpanded = expandedId === event.id;

              return (
                <div key={event.id} className="p-6 hover:bg-[#F7FAF8] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5">
                        {isApproved ? (
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : isRejected ? (
                          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shadow-xs">
                            <XCircle className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shadow-xs">
                            <Clock className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {event.action_taken || event.action || 'Project Decision'}
                          </span>
                          <span className="badge bg-slate-100 text-slate-600 text-[10px] font-mono">
                            Event #{event.id}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600">
                          {event.notes || event.description || 'Autonomous schedule rebalancing action recorded.'}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-tabular pt-1">
                          <span>Recorded by: {event.author || 'Project Lead'}</span>
                          <span>&bull;</span>
                          <span>{event.created_at || 'Recently'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(event.id)}
                      className="btn-secondary py-1 px-3 text-xs flex items-center gap-1.5"
                    >
                      <FileCode className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isExpanded ? 'Hide Payload' : 'Inspect JSON'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Expandable JSON Diff / Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-[#E2EAE5] space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Audit Payload & Metrics:</div>
                      <pre className="p-4 bg-[#1E2622] text-[#E5ECE7] rounded-xl text-xs font-mono overflow-x-auto border border-white/10 shadow-inner">
                        {JSON.stringify(event.payload || event, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
