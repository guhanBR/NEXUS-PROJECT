import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { MyWorkspacePage } from './pages/MyWorkspacePage';
import { TeamFormationPage } from './pages/TeamFormationPage';
import { TaskPlanningPage } from './pages/TaskPlanningPage';
import { ResourceMatrixPage } from './pages/ResourceMatrixPage';
import { CrisisSimulatorPage } from './pages/CrisisSimulatorPage';
import { RebalanceDiffPage } from './pages/RebalanceDiffPage';
import { DecisionHistoryPage } from './pages/DecisionHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If team member tries to access restricted manager/admin page, redirect to my workspace
    if (role === 'member') {
      return <Navigate to="/my-workspace" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Routes>
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
            <Route index element={<OverviewPage />} />
            <Route path="/my-workspace" element={<MyWorkspacePage />} />
            <Route path="/team-formation" element={<TeamFormationPage />} />
            <Route path="/task-planning" element={<TaskPlanningPage />} />
            <Route path="/resource-matrix" element={<ResourceMatrixPage />} />
            <Route
              path="/crisis-simulator"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <CrisisSimulatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rebalance-diff"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <RebalanceDiffPage />
                </ProtectedRoute>
              }
            />
            <Route path="/decision-audit" element={<DecisionHistoryPage />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ProjectProvider>
    </AuthProvider>
  );
}
