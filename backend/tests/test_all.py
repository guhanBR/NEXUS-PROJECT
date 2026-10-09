"""
Comprehensive Pytest Test Suite for RebalanceX.
Tests Health, Database Diagnostics, Team Formation, CPM Scheduling, DAG Validation, Rebalancing, and Auditing.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.algorithms.constraints import check_dag_cycle, validate_member_eligibility
from backend.app.algorithms.team_formation import recommend_team
from backend.app.algorithms.scheduler import compute_schedule
from backend.app.algorithms.rebalancer import solve_rebalancing
from backend.app.api.routes.demo_routes import seed_demo_data

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_database():
    """Ensure database has baseline seed data before tests run."""
    seed_demo_data()

# 1. Health & Database Diagnostic Tests
def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "RebalanceX" in data["service"]

def test_database_health_endpoint():
    response = client.get("/health/database")
    assert response.status_code == 200
    data = response.json()
    assert data["database"] == "rebalancex"
    assert "status" in data

# 2. Project & Member API Tests
def test_list_projects():
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 1
    assert projects[0]["name"] == "FinTech Quantum Core Alpha"

def test_list_members():
    response = client.get("/api/members")
    assert response.status_code == 200
    members = response.json()
    assert len(members) >= 4

# 3. DAG Cycle Detection Algorithm Tests
def test_dag_cycle_detection():
    # Valid DAG
    valid_tasks = [
        {"id": 1, "dependencies": []},
        {"id": 2, "dependencies": [1]},
        {"id": 3, "dependencies": [2]}
    ]
    is_valid, sorted_ids, _ = check_dag_cycle(valid_tasks)
    assert is_valid is True
    assert sorted_ids == [1, 2, 3]

    # Cyclic Graph (1 -> 2 -> 3 -> 1)
    cyclic_tasks = [
        {"id": 1, "dependencies": [3]},
        {"id": 2, "dependencies": [1]},
        {"id": 3, "dependencies": [2]}
    ]
    is_valid, _, err = check_dag_cycle(cyclic_tasks)
    assert is_valid is False
    assert "Cyclic dependency" in err

# 4. Smart Team Formation Engine Tests (Problem Statement #11)
def test_team_formation_algorithm():
    candidates = [
        {"id": 1, "name": "Alex", "skills": {"Python": 5, "React": 4}, "weekly_capacity_hours": 40, "availability_status": "available"},
        {"id": 2, "name": "Priya", "skills": {"Python": 5, "PostgreSQL": 5}, "weekly_capacity_hours": 40, "availability_status": "available"},
        {"id": 3, "name": "Marcus", "skills": {"React": 5, "TypeScript": 4}, "weekly_capacity_hours": 40, "availability_status": "available"},
        {"id": 4, "name": "Elena", "skills": {"Docker": 5, "CyberSecurity": 4}, "weekly_capacity_hours": 40, "availability_status": "available"}
    ]
    reqs = [
        {"skill": "Python", "min_level": 3, "mandatory": True},
        {"skill": "React", "min_level": 3, "mandatory": True}
    ]
    rec = recommend_team(candidates, reqs, ["FinTech"], target_size=3)
    assert rec["status"] == "success"
    assert rec["compatibility_score"] >= 80.0
    assert rec["skill_coverage_pct"] == 100.0
    assert len(rec["recommended_team"]) == 3

# 5. Critical Path Scheduling CPM Tests
def test_cpm_scheduler():
    tasks = [
        {"id": 1, "estimated_hours": 16.0, "dependencies": [], "assigned_candidate_id": 1},
        {"id": 2, "estimated_hours": 24.0, "dependencies": [1], "assigned_candidate_id": 1}
    ]
    members = [{"id": 1, "daily_capacity_hours": 8.0, "weekly_capacity_hours": 40.0}]
    schedule = compute_schedule(tasks, members, project_deadline_days=10.0)
    assert schedule["is_feasible"] is True
    assert schedule["project_duration_days"] == 5.0
    assert 1 in schedule["critical_path_task_ids"]
    assert 2 in schedule["critical_path_task_ids"]

# 6. Autonomous Rebalancing & Proposal Lifecycle Tests (Problem Statement #18)
def test_crisis_rebalancing_and_approval_flow():
    # 1. Trigger Simulation
    sim_res = client.post("/api/projects/1/scenarios", json={
        "type": "member_unavailable",
        "params": {"candidate_id": 2}
    })
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert "proposal_id" in sim_data
    proposal_id = sim_data["proposal_id"]
    assert sim_data["solver_status"] in ("optimal", "feasible_mitigated", "feasible_with_deadline_risk")
    assert sim_data["reassigned_count"] >= 1

    # 2. Approve Proposal
    appr_res = client.post(f"/api/proposals/{proposal_id}/approve")
    assert appr_res.status_code == 200
    appr_data = appr_res.json()
    assert appr_data["status"] == "success"

    # 3. Verify Decision History
    hist_res = client.get("/api/projects/1/history")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1
    assert history[0]["action_taken"] == "APPROVED"
