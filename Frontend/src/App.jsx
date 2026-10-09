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
            {/* Projects Directory */}
            <Route path="/projects" element={<ProjectsPage />} />

            {/* Project Details Tabs */}
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/team-formation" element={<TeamFormationPage />} />
            
            {/* Distinct Task Planning & Personal Tasks Routes */}
            <Route path="/task-planning" element={<TaskPlanningPage />} />
            <Route path="/admin/task-planning" element={<AdminTaskPlanningPage />} />
            <Route path="/member/my-tasks" element={<MemberMyTasksPage />} />

            <Route path="/recovery" element={<RecoveryPage />} />
            <Route path="/crisis-simulator" element={<RecoveryPage />} />
            <Route path="/rebalance-diff" element={<RecoveryPage />} />
            <Route path="/decision-audit" element={<DecisionHistoryPage />} />

            {/* Secondary Settings */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ProjectProvider>
    </AuthProvider>
  );
}
