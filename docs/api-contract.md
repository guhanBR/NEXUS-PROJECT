# RebalanceX — API Contract

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | System health check and version telemetry |
| `GET` | `/health/database` | MongoDB Atlas ping and connection status |
| `GET` | `/api/projects` | List all active/planning projects |
| `POST` | `/api/projects` | Create a new project with deadline and skill criteria |
| `GET` | `/api/projects/{id}` | Get project details, team members, tasks, and CPM metrics |
| `GET` | `/api/members` | List talent pool candidates with skill ratings and capacity |
| `POST` | `/api/members` | Register a new candidate in talent pool |
| `POST` | `/api/projects/{id}/team/recommend` | Calculate optimal team composition (Problem Statement #11) |
| `POST` | `/api/projects/{id}/team/confirm` | Confirm recommended or custom team roster |
| `POST` | `/api/projects/{id}/tasks` | Create project task with effort, skills, priority, and dependencies |
| `PATCH` | `/api/tasks/{task_id}` | Modify task fields, status, or assignee |
| `POST` | `/api/projects/{id}/schedule` | Recalculate CPM schedule, early/late times, and critical paths |
| `POST` | `/api/projects/{id}/scenarios` | Execute crisis simulation & autonomous rebalancing (Problem Statement #18) |
| `POST` | `/api/projects/{id}/rebalance` | Alias for crisis simulation endpoint |
| `GET` | `/api/proposals/{id}` | Retrieve proposed plan details and decision explanations |
| `POST` | `/api/proposals/{id}/approve` | Approve proposed plan and persist changes to active schedule |
| `POST` | `/api/proposals/{id}/reject` | Reject proposal and retain current baseline plan |
| `GET` | `/api/projects/{id}/history` | Audit log of historical rebalancing decisions |
| `POST` | `/api/demo/seed` | Reset & seed database with reproducible demo scenario |
