"""
Crisis Simulator, Autonomous Resource Rebalancing & Decision Lifecycle Routes.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from ...schemas.project import ScenarioCreate, ProposalActionRequest
from ...repositories.entities_repo import task_repo, member_repo, proposal_repo, history_repo
from ...repositories.project_repo import project_repo
from ...algorithms.rebalancer import solve_rebalancing
from ...algorithms.explainer import generate_decision_explanations

rebalance_router = APIRouter(tags=["Crisis Simulator & Rebalancing"])

@rebalance_router.post("/api/projects/{project_id}/scenarios")
@rebalance_router.post("/api/projects/{project_id}/rebalance")
def run_crisis_rebalancing(project_id: int, payload: ScenarioCreate):
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = task_repo.list_by_project(project_id)
    members = member_repo.list_all()

    disruption_event = payload.model_dump()
    rebalance_result = solve_rebalancing(
        original_tasks=tasks,
        members=members,
        project_deadline_days=project.get("deadline_days", 30),
        disruption_event=disruption_event
    )

    explanations = generate_decision_explanations(rebalance_result, members, disruption_event)

    # Save proposal
    proposal_data = {
        "project_id": project_id,
        "trigger_type": disruption_event["type"],
        "scenario_details": disruption_event["params"],
        "solver_engine": rebalance_result.get("solver_engine"),
        "solver_status": rebalance_result.get("solver_status"),
        "objective_score": rebalance_result.get("objective_score"),
        "original_schedule": rebalance_result.get("original_schedule"),
        "proposed_schedule": rebalance_result.get("proposed_schedule"),
        "reassigned_tasks": rebalance_result.get("reassigned_tasks"),
        "reassigned_count": rebalance_result.get("reassigned_count"),
        "explanations": explanations,
        "risks": rebalance_result.get("risks"),
        "status": "pending"
    }
    saved_proposal = proposal_repo.save(proposal_data)

    return {
        "proposal_id": saved_proposal["id"],
        "solver_engine": rebalance_result.get("solver_engine"),
        "solver_status": rebalance_result.get("solver_status"),
        "objective_score": rebalance_result.get("objective_score"),
        "metrics": rebalance_result.get("metrics"),
        "original_schedule": rebalance_result.get("original_schedule"),
        "proposed_schedule": rebalance_result.get("proposed_schedule"),
        "reassigned_tasks": rebalance_result.get("reassigned_tasks"),
        "reassigned_count": rebalance_result.get("reassigned_count"),
        "explanations": explanations,
        "risks": rebalance_result.get("risks")
    }

@rebalance_router.get("/api/proposals/{proposal_id}")
def get_proposal(proposal_id: int):
    proposal = proposal_repo.get_by_id(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

@rebalance_router.post("/api/proposals/{proposal_id}/approve")
def approve_proposal(proposal_id: int):
    proposal = proposal_repo.get_by_id(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal.get("status") == "approved":
        return {"status": "success", "message": "Proposal is already approved."}

    proposed_tasks = proposal.get("proposed_schedule", {}).get("tasks", [])
    project_id = proposal["project_id"]

    for pt in proposed_tasks:
        db_task = task_repo.get_by_id(pt["id"])
        if db_task:
            db_task["assigned_candidate_id"] = pt.get("assigned_candidate_id")
            db_task["start_day"] = pt.get("start_day", 0.0)
            db_task["end_day"] = pt.get("end_day", 0.0)
            db_task["is_critical_path"] = pt.get("is_critical_path", False)
            db_task["estimated_hours"] = pt.get("estimated_hours", db_task.get("estimated_hours", 16))
            task_repo.save(db_task)
        else:
            # New task added during crisis
            task_repo.save(pt)

    proposal["status"] = "approved"
    proposal_repo.save(proposal)

    # Persist decision log
    reassigned_count = proposal.get("reassigned_count", 0)
    history_repo.save({
        "project_id": project_id,
        "proposal_id": proposal_id,
        "event_title": f"Autonomous Rebalancing Plan Approved ({proposal.get('trigger_type')})",
        "action_taken": "APPROVED",
        "summary": f"Plan applied with {reassigned_count} task reallocations. Solver Objective Score: {proposal.get('objective_score')}/100.",
        "affected_tasks_count": reassigned_count,
        "details": {"solver_engine": proposal.get("solver_engine")}
    })

    return {"status": "success", "message": f"Proposal #{proposal_id} approved and persisted. Active project plan updated."}

@rebalance_router.post("/api/proposals/{proposal_id}/reject")
def reject_proposal(proposal_id: int):
    proposal = proposal_repo.get_by_id(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposal["status"] = "rejected"
    proposal_repo.save(proposal)

    history_repo.save({
        "project_id": proposal["project_id"],
        "proposal_id": proposal_id,
        "event_title": f"Autonomous Rebalancing Plan Rejected ({proposal.get('trigger_type')})",
        "action_taken": "REJECTED",
        "summary": "User rejected proposed rebalancing plan. Baseline schedule retained.",
        "affected_tasks_count": 0,
        "details": {"proposal_id": proposal_id}
    })

    return {"status": "success", "message": f"Proposal #{proposal_id} rejected. Baseline schedule preserved."}

@rebalance_router.get("/api/projects/{project_id}/history")
def get_project_history(project_id: int):
    return history_repo.list_by_project(project_id)
