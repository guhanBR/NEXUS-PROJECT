import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { History, ShieldAlert, CheckCircle2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export function DecisionHistoryPage() {
  const { activeProjectId, activeProject } = useProject();
  const [expandedId, setExpandedId] = useState(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['history', activeProjectId],
    queryFn: () => api.getHistory(activeProjectId),
    enabled: !!activeProjectId,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-google-blue bg-google-blueSurface px-2.5 py-0.5 rounded-full">
            History &bull; Audit Trail
          </span>
          <span className="text-xs text-google-textMuted font-mono">
            {activeProject?.name}
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-google-text">Project Decision History</h2>
        <p className="text-xs text-google-textSecondary mt-0.5">
          Review past optimization events, confirmed team selections, and approved schedule changes.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-google-border shadow-google-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-google-text flex items-center gap-2">
            <History className="w-4 h-4 text-google-blue" />
            Decision Timeline
          </h3>
          <span className="text-xs text-google-textMuted font-mono">
            {logs.length} logged record(s)
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-google-textMuted">
            Loading decision history...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-google-textMuted space-y-2">
            <FileText className="w-8 h-8 text-google-textMuted mx-auto opacity-50" />
            <p>No decision events recorded yet for this project.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((l) => {
              const isApproved = l.action_taken === 'APPROVED';
              const isExpanded = expandedId === l.id;

              return (
                <div
                  key={l.id}
                  className="p-4 bg-google-subtle/50 rounded-xl border border-google-border space-y-2 hover:bg-white transition-colors cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : l.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-google-text flex items-center gap-2">
                      {isApproved ? (
                        <CheckCircle2 className="w-4 h-4 text-google-teal" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-google-red" />
                      )}
                      {l.event_title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          isApproved
                            ? 'bg-google-tealSurface text-google-teal'
                            : 'bg-google-redSurface text-google-red'
                        }`}
                      >
                        {l.action_taken}
                      </span>
                      <span className="text-xs text-google-textMuted font-mono">
                        {l.timestamp}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-google-textMuted" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-google-textMuted" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-google-textSecondary leading-relaxed">{l.summary}</p>

                  {isExpanded && (
                    <div className="pt-2 border-t border-google-border text-xs text-google-textSecondary space-y-1 animate-in fade-in duration-150">
                      <div className="flex justify-between text-[11px] text-google-textMuted">
                        <span>Record ID: #{l.id}</span>
                        <span>Project ID: #{l.project_id}</span>
                      </div>
                      <p className="text-[11px] text-google-textMuted">
                        This action was executed and saved to the persistence store.
                      </p>
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
