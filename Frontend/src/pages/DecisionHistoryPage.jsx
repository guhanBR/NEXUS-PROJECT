import React from 'react';
import { useProject } from '../context/ProjectContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { History, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function DecisionHistoryPage() {
  const { activeProjectId } = useProject();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['history', activeProjectId],
    queryFn: () => api.getHistory(activeProjectId),
    enabled: !!activeProjectId,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Decision Audit Trail</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Immutable audit record of all project scheduling, team formations, and rebalancing decisions.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" /> Event Timeline
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No decision events recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {logs.map((l) => (
              <div
                key={l.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {l.action_taken === 'APPROVED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    )}
                    {l.event_title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        l.action_taken === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {l.action_taken}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{l.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">{l.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
