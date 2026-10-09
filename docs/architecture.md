# RebalanceX — System Architecture

## Overview
**RebalanceX** is an autonomous project intelligence platform integrating:
- **Problem Statement #11**: Smart Internship & Team Formation Engine
- **Problem Statement #18**: Autonomous Project Resource Rebalancer

```
+-------------------------------------------------------------------------------+
|                                Frontend (SPA)                                 |
|  - Real-Time Command Center           - Task Planning & Gantt Scheduler       |
|  - Team Formation Workspace (PS#11)   - Crisis Simulator & Disruption Engine  |
|  - Workload Utilization Heatmap       - Rebalancing Plan & Diff Workspace     |
+---------------------------------------+---------------------------------------+
                                        | REST API / JSON
                                        v
+-------------------------------------------------------------------------------+
|                            FastAPI Backend Engine                             |
|  - /health & /health/database         - /api/projects & /api/members          |
|  - /api/projects/{id}/team/recommend  - /api/projects/{id}/schedule           |
|  - /api/projects/{id}/scenarios       - /api/proposals/{id}/approve & reject  |
+-------------------+-------------------+-------------------+-------------------+
                    |                   |                   |
                    v                   v                   v
      +---------------------+ +-------------------+ +-------------------+
      | Team Formation      | | CPM Scheduler     | | Rebalancer (PS#18)|
      | - Skill Matrix      | | - Early/Late Pass | | - Constraint MILP |
      | - Proficiency Match | | - Zero-Slack Path | | - Makespan Delay  |
      | - Synergy Score     | | - Dependency DAG  | | - Churn Minimizer |
      +---------------------+ +-------------------+ +-------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                       MongoDB Atlas Database (rebalancex)                     |
|  Collections:                                                                 |
|   1. `projects`               5. `assignments`                                |
|   2. `members`                6. `scenarios`                                  |
|   3. `team_recommendations`   7. `rebalancing_proposals`                      |
|   4. `tasks`                  8. `decision_history`                           |
+-------------------------------------------------------------------------------+
```

## Layer Responsibilities

1. **API Layer (`backend/app/api/routes`)**:
   - Validates incoming requests using Pydantic models.
   - Enforces business logic and returns standard HTTP status codes.

2. **Algorithm Engine (`backend/app/algorithms`)**:
   - `team_formation.py`: Multi-objective combinatorial talent matching.
   - `constraints.py`: Kahn's algorithm DAG cycle detection and skill requirements.
   - `scheduler.py`: Forward/Backward pass Critical Path Method (CPM).
   - `rebalancer.py`: Constraint-satisfaction rebalancing optimizer.
   - `explainer.py`: Human-readable evidence and rationale generator.

3. **Data Access Layer (`backend/app/repositories`)**:
   - Connects to MongoDB Atlas via PyMongo.
   - Maintains resilient local caching when Atlas URI is not yet configured.
