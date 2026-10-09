import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminTaskPlanningPage } from './AdminTaskPlanningPage';
import { MemberMyTasksPage } from './MemberMyTasksPage';

/**
 * TaskPlanningPage acts as a dynamic compatibility router:
 * - When authenticated user is a Member -> renders MemberMyTasksPage (Personal execution view)
 * - When authenticated user is an Admin/Manager/Lead -> renders AdminTaskPlanningPage (Workload & CPM Planning view)
 */
export function TaskPlanningPage() {
  const { role } = useAuth();

  if (role === 'member') {
    return <MemberMyTasksPage />;
  }

  return <AdminTaskPlanningPage />;
}
