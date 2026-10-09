import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { OverviewPage } from './pages/OverviewPage';
import { TeamFormationPage } from './pages/TeamFormationPage';
import { TaskPlanningPage } from './pages/TaskPlanningPage';
import { AdminTaskPlanningPage } from './pages/AdminTaskPlanningPage';
import { MemberMyTasksPage } from './pages/MemberMyTasksPage';
import { RecoveryPage } from './pages/RecoveryPage';
import { DecisionHistoryPage } from './pages/DecisionHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { DirectMessagesPage } from './pages/DirectMessagesPage';
import { ProjectRoomsPage } from './pages/ProjectRoomsPage';
import { PerformanceAllocationPage } from './pages/PerformanceAllocationPage';
import { OvertimeManagementPage } from './pages/OvertimeManagementPage';
import { ProgressMonitorPage } from './pages/ProgressMonitorPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Workspaces */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* 1. Projects & Portfolio Workspaces */}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/admin/portfolio" element={<ProjectsPage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/manager/project-oversight" element={<OverviewPage />} />
            <Route path="/member/project-workspace" element={<OverviewPage />} />

            {/* 2. Workforce Directory & AI Team Builder */}
            <Route path="/team-formation" element={<TeamFormationPage />} />
            <Route path="/workforce" element={<TeamFormationPage />} />
            <Route path="/ai-team-builder" element={<TeamFormationPage />} />
            <Route path="/manager/team-overview" element={<TeamFormationPage />} />
            <Route path="/manager/team-recommendations" element={<TeamFormationPage />} />

            {/* 3. Progress Monitor & Team Progress */}
            <Route path="/progress-monitor" element={<ProgressMonitorPage />} />
            <Route path="/manager/task-progress" element={<ProgressMonitorPage />} />
            <Route path="/member/team-progress" element={<ProgressMonitorPage />} />

            {/* 4. Task Planning, Task Control & My Tasks */}
            <Route path="/task-planning" element={<TaskPlanningPage />} />
            <Route path="/admin/task-planning" element={<AdminTaskPlanningPage />} />
            <Route path="/task-control" element={<AdminTaskPlanningPage />} />
            <Route path="/member/my-tasks" element={<MemberMyTasksPage />} />

            {/* 5. Scenario Lab & Recovery */}
            <Route path="/recovery" element={<RecoveryPage />} />
            <Route path="/crisis-simulator" element={<RecoveryPage />} />
            <Route path="/rebalance-diff" element={<RecoveryPage />} />
            <Route path="/manager/recovery-review" element={<RecoveryPage />} />

            {/* 6. Direct Messages */}
            <Route path="/messages" element={<DirectMessagesPage />} />
            <Route path="/direct-messages" element={<DirectMessagesPage />} />

            {/* 7. Project Rooms */}
            <Route path="/project-rooms" element={<ProjectRoomsPage />} />

            {/* 8. Performance & Allocation */}
            <Route path="/performance-allocation" element={<PerformanceAllocationPage />} />
            <Route path="/manager/performance-reports" element={<PerformanceAllocationPage />} />
            <Route path="/member/performance-profile" element={<PerformanceAllocationPage />} />

            {/* 9. Overtime Requests */}
            <Route path="/overtime-requests" element={<OvertimeManagementPage />} />
            <Route path="/manager/overtime-overview" element={<OvertimeManagementPage />} />
            <Route path="/member/my-overtime" element={<OvertimeManagementPage />} />

            {/* 10. Audit History & Settings */}
            <Route path="/decision-audit" element={<DecisionHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ProjectProvider>
    </AuthProvider>
  );
}
