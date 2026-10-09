import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [activeProjectId, setActiveProjectId] = useState(1);
  const [activeProposal, setActiveProposal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch all projects
  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });

  // Automatically select valid project if not set
  React.useEffect(() => {
    if (projects.length > 0) {
      const exists = projects.some((p) => p.id === activeProjectId);
      if (!exists) {
        setActiveProjectId(projects[0].id);
      }
    }
  }, [projects, activeProjectId]);

  // Fetch active project detail
  const { data: activeProject, isLoading: isProjectLoading, refetch: refetchProject } = useQuery({
    queryKey: ['project', activeProjectId],
    queryFn: () => api.getProject(activeProjectId),
    enabled: !!activeProjectId,
  });

  // Fetch members
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: api.getMembers,
  });

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleResetDemo = async () => {
    try {
      showToast('Resetting demo environment to baseline...');
      await api.seedDemo();
      await queryClient.invalidateQueries();
      setActiveProjectId(1);
      showToast('Demo environment reset successfully!', 'success');
    } catch (err) {
      showToast('Reset failed: ' + err.message, 'error');
    }
  };

  const runLiveDemoSequence = async () => {
    showToast('🚀 Step 1/4: Opening Smart Team Formation...', 'info');
    navigate('/team-formation');
    
    await new Promise((r) => setTimeout(r, 1500));
    showToast('📊 Step 2/4: Reviewing Critical Path Gantt Schedule...', 'info');
    navigate('/task-planning');

    await new Promise((r) => setTimeout(r, 1800));
    showToast('🚨 Step 3/4: Simulating Backend Lead Outage Disruption...', 'warning');
    navigate('/crisis-simulator');
  };

  return (
    <ProjectContext.Provider
      value={{
        activeProjectId,
        setActiveProjectId,
        activeProject,
        isProjectLoading,
        projects,
        isProjectsLoading,
        members,
        activeProposal,
        setActiveProposal,
        refetchProject,
        showToast,
        handleResetDemo,
        runLiveDemoSequence,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all transform animate-bounce-short ${
              t.type === 'error'
                ? 'bg-rose-600'
                : t.type === 'success'
                ? 'bg-emerald-600'
                : t.type === 'warning'
                ? 'bg-amber-600'
                : 'bg-slate-900'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
