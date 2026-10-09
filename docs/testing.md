# RebalanceX — Testing & Verification Guide

## Automated Backend Test Suite (Pytest)

Run all unit and integration tests:
```bash
python -m pytest backend/tests/test_all.py -v
```

### Verified Test Cases
1. `test_health_endpoint`: Validates `/health` returns service status and version.
2. `test_database_health_endpoint`: Validates `/health/database` pings MongoDB and reports connection status.
3. `test_list_projects`: Verifies project retrieval and task count aggregations.
4. `test_list_members`: Verifies candidate directory retrieval.
5. `test_dag_cycle_detection`: Validates Kahn's algorithm cycle detection on valid DAGs and cyclic dependencies.
6. `test_team_formation_algorithm`: Validates mandatory skill checks, proficiency scoring, and team size constraints.
7. `test_cpm_scheduler`: Validates forward/backward pass makespan and critical path identification.
8. `test_crisis_rebalancing_and_approval_flow`: Executes end-to-end simulation, proposal generation, approval persistence, and audit logging.
