import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { TeamFormationPage } from './pages/TeamFormationPage';
import { TaskPlanningPage } from './pages/TaskPlanningPage';
import { ResourceMatrixPage } from './pages/ResourceMatrixPage';
import { CrisisSimulatorPage } from './pages/CrisisSimulatorPage';
import { RebalanceDiffPage } from './pages/RebalanceDiffPage';
import { DecisionHistoryPage } from './pages/DecisionHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="/team-formation" element={<TeamFormationPage />} />
        <Route path="/task-planning" element={<TaskPlanningPage />} />
        <Route path="/resource-matrix" element={<ResourceMatrixPage />} />
        <Route path="/crisis-simulator" element={<CrisisSimulatorPage />} />
        <Route path="/rebalance-diff" element={<RebalanceDiffPage />} />
        <Route path="/decision-audit" element={<DecisionHistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
