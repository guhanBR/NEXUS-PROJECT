"""
RebalanceX — Adaptive Project Intelligence Backend
FastAPI application providing endpoints for Team Formation, Task Planning, CPM Scheduling, Crisis Simulation, and Autonomous Rebalancing.
"""
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import os
import json

from .database import engine, get_db, Base
from .models import Project, Candidate, ProjectMember, Task, DecisionLog, RebalanceProposal
from .algorithms.team_formation import recommend_team, calculate_candidate_match, evaluate_team_composition
from .algorithms.scheduler import compute_schedule, validate_dependencies_and_sort
from .algorithms.rebalancer import solve_rebalancing
from .algorithms.explainer import generate_decision_explanations
from .seed_data import seed_database

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RebalanceX API",
    description="Adaptive Project Intelligence & Autonomous Resource Rebalancer",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure sample database is seeded on startup if empty
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        project_count = db.query(Project).count()
        if project_count == 0:
            print("[Startup] Initializing empty database with demo dataset...")
            seed_database(db)
    finally:
        db.close()

# ----------------- HEALTH & DEMO SEED -----------------

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "RebalanceX Engine", "version": "1.0.0"}

@app.post("/api/demo/seed")
def reset_and_seed_demo(db: Session = Depends(get_db)):
    seed_database(db)
    return {"status": "success", "message": "Demo data successfully seeded. Primary project reset to baseline."}

# ----------------- CANDIDATE TALENT POOL -----------------

@app.get("/api/candidates")
def list_candidates(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "role_title": c.role_title,
            "skills": c.skills,
            "interests": c.interests,
            "experience_years": c.experience_years,
            "weekly_capacity_hours": c.weekly_capacity_hours,
            "daily_capacity_hours": c.daily_capacity_hours,
            "current_workload_hours": c.current_workload_hours,
            "availability_status": c.availability_status,
            "avatar_color": c.avatar_color
        }
        for c in candidates
    ]

@app.post("/api/candidates")
def create_candidate(payload: Dict[str, Any], db: Session = Depends(get_db)):
    cand = Candidate(
        name=payload.get("name", "New Engineer"),
        email=payload.get("email", f"engineer_{os.urandom(2).hex()}@rebalancex.io"),
        role_title=payload.get("role_title", "Software Engineer"),
        skills=payload.get("skills", {}),
        interests=payload.get("interests", []),
        experience_years=float(payload.get("experience_years", 1.5)),
        weekly_capacity_hours=float(payload.get("weekly_capacity_hours", 40.0)),
        daily_capacity_hours=float(payload.get("daily_capacity_hours", 8.0)),
        current_workload_hours=0.0,
        availability_status=payload.get("availability_status", "available"),
        avatar_color=payload.get("avatar_color", "#2563EB")
    )
    db.add(cand)
    db.commit()
    db.refresh(cand)
    return {"status": "success", "candidate_id": cand.id}

# ----------------- PROJECTS -----------------

@app.get("/api/projects")
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    results = []
    for p in projects:
        task_count = db.query(Task).filter(Task.project_id == p.id).count()
        member_count = db.query(ProjectMember).filter(ProjectMember.project_id == p.id).count()
        results.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "target_team_size": p.target_team_size,
            "deadline_days": p.deadline_days,
            "status": p.status,
            "required_skills": p.required_skills,
            "domains": p.domains,
            "task_count": task_count,
            "member_count": member_count,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    return results

@app.get("/api/projects/{project_id}")
def get_project_details(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    tasks = db.query(Task).filter(Task.project_id == project_id).all()

    candidates = db.query(Candidate).all()
    candidates_dict = [
        {
            "id": c.id,
            "name": c.name,
            "role_title": c.role_title,
            "skills": c.skills,
            "interests": c.interests,
            "experience_years": c.experience_years,
            "weekly_capacity_hours": c.weekly_capacity_hours,
            "daily_capacity_hours": c.daily_capacity_hours,
            "current_workload_hours": c.current_workload_hours,
            "availability_status": c.availability_status,
            "avatar_color": c.avatar_color
        }
        for c in candidates
    ]

    tasks_dict = [
        {
            "id": t.id,
            "project_id": t.project_id,
            "title": t.title,
            "description": t.description,
            "required_skill": t.required_skill,
            "min_skill_level": t.min_skill_level,
            "estimated_hours": t.estimated_hours,
            "remaining_hours": t.remaining_hours,
            "priority": t.priority,
            "status": t.status,
            "assigned_candidate_id": t.assigned_candidate_id,
            "start_day": t.start_day,
            "end_day": t.end_day,
            "deadline_day": t.deadline_day,
            "is_critical_path": t.is_critical_path,
            "dependencies": t.dependencies
        }
        for t in tasks
    ]

    # Compute live schedule metrics
    schedule_data = compute_schedule(tasks_dict, candidates_dict, project.deadline_days)

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "target_team_size": project.target_team_size,
        "deadline_days": project.deadline_days,
        "status": project.status,
        "required_skills": project.required_skills,
        "domains": project.domains,
        "team_members": [
            {
                "member_id": m.id,
                "candidate_id": m.candidate_id,
                "name": m.candidate.name if m.candidate else "Unknown",
                "email": m.candidate.email if m.candidate else "",
                "role_in_project": m.role_in_project,
                "skills": m.candidate.skills if m.candidate else {},
                "match_score": m.match_score,
                "match_reasons": m.match_reasons,
                "availability_status": m.candidate.availability_status if m.candidate else "available",
                "avatar_color": m.candidate.avatar_color if m.candidate else "#2563EB"
            }
            for m in members
        ],
        "tasks": schedule_data.get("tasks", tasks_dict),
        "schedule_metrics": {
            "project_duration_days": schedule_data.get("project_duration_days", 0),
            "deadline_days": project.deadline_days,
            "is_feasible": schedule_data.get("is_feasible", True),
            "deadline_breached": schedule_data.get("deadline_breached", False),
            "delay_days": schedule_data.get("delay_days", 0),
            "critical_path_task_ids": schedule_data.get("critical_path_task_ids", []),
            "resource_utilization": schedule_data.get("resource_utilization", {})
        }
    }

@app.post("/api/projects")
def create_project(payload: Dict[str, Any], db: Session = Depends(get_db)):
    proj = Project(
        name=payload.get("name", "New Intelligent Project"),
        description=payload.get("description", ""),
        target_team_size=int(payload.get("target_team_size", 4)),
        deadline_days=int(payload.get("deadline_days", 30)),
        status="planning",
        required_skills=payload.get("required_skills", []),
        domains=payload.get("domains", [])
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return {"status": "success", "project_id": proj.id}

# ----------------- SMART TEAM FORMATION (PROBLEM STATEMENT #11) -----------------

@app.post("/api/team-formation/recommend")
def run_team_recommendation(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Executes multi-objective smart team formation against candidate talent pool.
    """
    project_id = payload.get("project_id")
    target_size = int(payload.get("target_team_size", 4))
    req_skills = payload.get("required_skills", [])
    domains = payload.get("domains", [])

    if project_id:
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            if not req_skills:
                req_skills = project.required_skills
            if not domains:
                domains = project.domains
            if "target_team_size" not in payload:
                target_size = project.target_team_size

    candidates = db.query(Candidate).all()
    candidates_data = [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "role_title": c.role_title,
            "skills": c.skills,
            "interests": c.interests,
            "experience_years": c.experience_years,
            "weekly_capacity_hours": c.weekly_capacity_hours,
            "daily_capacity_hours": c.daily_capacity_hours,
            "current_workload_hours": c.current_workload_hours,
            "availability_status": c.availability_status,
            "avatar_color": c.avatar_color
        }
        for c in candidates
    ]

    result = recommend_team(candidates_data, req_skills, domains, target_size)
    return result

@app.post("/api/projects/{project_id}/confirm-team")
def confirm_project_team(project_id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    selected_members = payload.get("team_members", []) # list of {"candidate_id": 1, "role": "Backend Lead", "score": 95}
    if not selected_members:
        raise HTTPException(status_code=400, detail="No team members provided")

    # Clear existing members
    db.query(ProjectMember).filter(ProjectMember.project_id == project_id).delete()

    for m in selected_members:
        cid = m.get("candidate_id") or m.get("id")
        pm = ProjectMember(
            project_id=project_id,
            candidate_id=cid,
            role_in_project=m.get("role_title") or m.get("role_in_project", "Team Member"),
            assigned_capacity_hours=float(m.get("weekly_capacity_hours", 40.0)),
            match_score=float(m.get("score") or m.get("match_score", 90.0)),
            match_reasons=m.get("reasons", ["Selected via Smart Team Formation Engine"])
        )
        db.add(pm)

    project.status = "active"
    db.commit()

    # Log to decision history
    log = DecisionLog(
        project_id=project_id,
        event_title="Smart Team Composition Confirmed",
        action_taken="APPROVED",
        summary=f"Team of {len(selected_members)} specialists confirmed via Multi-Objective Team Formation Engine.",
        affected_tasks_count=0,
        details_json=json.dumps({"members": [m.get("name") for m in selected_members]})
    )
    db.add(log)
    db.commit()

    return {"status": "success", "message": "Team composition confirmed successfully."}

# ----------------- TASK PLANNING & SCHEDULING -----------------

@app.get("/api/projects/{project_id}/tasks")
def get_project_tasks(project_id: int, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    return [
        {
            "id": t.id,
            "project_id": t.project_id,
            "title": t.title,
            "description": t.description,
            "required_skill": t.required_skill,
            "min_skill_level": t.min_skill_level,
            "estimated_hours": t.estimated_hours,
            "remaining_hours": t.remaining_hours,
            "priority": t.priority,
            "status": t.status,
            "assigned_candidate_id": t.assigned_candidate_id,
            "assigned_name": t.assigned_candidate.name if t.assigned_candidate else "Unassigned",
            "start_day": t.start_day,
            "end_day": t.end_day,
            "deadline_day": t.deadline_day,
            "is_critical_path": t.is_critical_path,
            "dependencies": t.dependencies
        }
        for t in tasks
    ]

@app.post("/api/projects/{project_id}/tasks")
def create_task(project_id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    task = Task(
        project_id=project_id,
        title=payload.get("title", "New Task"),
        description=payload.get("description", ""),
        required_skill=payload.get("required_skill", "Python"),
        min_skill_level=int(payload.get("min_skill_level", 2)),
        estimated_hours=float(payload.get("estimated_hours", 16.0)),
        remaining_hours=float(payload.get("remaining_hours", payload.get("estimated_hours", 16.0))),
        priority=payload.get("priority", "medium"),
        status=payload.get("status", "todo"),
        assigned_candidate_id=payload.get("assigned_candidate_id"),
        dependencies=payload.get("dependencies", [])
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {"status": "success", "task_id": task.id}

@app.put("/api/projects/{project_id}/tasks/{task_id}")
def update_task(project_id: int, task_id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if "title" in payload:
        task.title = payload["title"]
    if "description" in payload:
        task.description = payload["description"]
    if "required_skill" in payload:
        task.required_skill = payload["required_skill"]
    if "min_skill_level" in payload:
        task.min_skill_level = int(payload["min_skill_level"])
    if "estimated_hours" in payload:
        task.estimated_hours = float(payload["estimated_hours"])
    if "remaining_hours" in payload:
        task.remaining_hours = float(payload["remaining_hours"])
    if "priority" in payload:
        task.priority = payload["priority"]
    if "status" in payload:
        task.status = payload["status"]
    if "assigned_candidate_id" in payload:
        task.assigned_candidate_id = payload["assigned_candidate_id"]
    if "dependencies" in payload:
        task.dependencies = payload["dependencies"]

    db.commit()
    return {"status": "success", "message": "Task updated"}

@app.delete("/api/projects/{project_id}/tasks/{task_id}")
def delete_task(project_id: int, task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"status": "success", "message": "Task deleted"}

@app.post("/api/projects/{project_id}/generate-schedule")
def generate_project_schedule(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    candidates = db.query(Candidate).all()

    tasks_dict = [
        {
            "id": t.id,
            "project_id": t.project_id,
            "title": t.title,
            "description": t.description,
            "required_skill": t.required_skill,
            "min_skill_level": t.min_skill_level,
            "estimated_hours": t.estimated_hours,
            "remaining_hours": t.remaining_hours,
            "priority": t.priority,
            "status": t.status,
            "assigned_candidate_id": t.assigned_candidate_id,
            "dependencies": t.dependencies
        }
        for t in tasks
    ]
    candidates_dict = [
        {
            "id": c.id,
            "name": c.name,
            "role_title": c.role_title,
            "skills": c.skills,
            "weekly_capacity_hours": c.weekly_capacity_hours,
            "daily_capacity_hours": c.daily_capacity_hours,
            "availability_status": c.availability_status
        }
        for c in candidates
    ]

    schedule = compute_schedule(tasks_dict, candidates_dict, project.deadline_days)
    if "error" in schedule:
        return {"status": "error", "message": schedule["error"]}

    # Update tasks with computed early start/end days
    for t_res in schedule.get("tasks", []):
        db_task = db.query(Task).filter(Task.id == t_res["id"]).first()
        if db_task:
            db_task.start_day = t_res.get("start_day", 0.0)
            db_task.end_day = t_res.get("end_day", 0.0)
            db_task.is_critical_path = t_res.get("is_critical_path", False)
            db_task.slack_days = t_res.get("slack_days", 0.0)

    db.commit()
    return {"status": "success", "schedule": schedule}

# ----------------- CRISIS SIMULATOR & REBALANCING (PROBLEM STATEMENT #18) -----------------

@app.post("/api/projects/{project_id}/simulate-crisis")
def simulate_crisis_and_rebalance(project_id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Executes actual constraint optimization and computes original vs proposed schedule diff with transparent evidence.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    candidates = db.query(Candidate).all()

    tasks_dict = [
        {
            "id": t.id,
            "project_id": t.project_id,
            "title": t.title,
            "description": t.description,
            "required_skill": t.required_skill,
            "min_skill_level": t.min_skill_level,
            "estimated_hours": t.estimated_hours,
            "remaining_hours": t.remaining_hours,
            "priority": t.priority,
            "status": t.status,
            "assigned_candidate_id": t.assigned_candidate_id,
            "dependencies": t.dependencies
        }
        for t in tasks
    ]

    candidates_dict = [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "role_title": c.role_title,
            "skills": c.skills,
            "interests": c.interests,
            "experience_years": c.experience_years,
            "weekly_capacity_hours": c.weekly_capacity_hours,
            "daily_capacity_hours": c.daily_capacity_hours,
            "current_workload_hours": c.current_workload_hours,
            "availability_status": c.availability_status,
            "avatar_color": c.avatar_color
        }
        for c in candidates
    ]

    disruption_event = {
        "type": payload.get("type", "member_unavailable"), # member_unavailable, deadline_shortened, urgent_task_added, duration_overrun, priority_escalation
        "params": payload.get("params", {})
    }

    # Run actual optimization engine
    rebalance_result = solve_rebalancing(
        original_tasks=tasks_dict,
        candidates=candidates_dict,
        project_deadline_days=project.deadline_days,
        disruption_event=disruption_event
    )

    # Generate transparent explanations
    explanations = generate_decision_explanations(rebalance_result, candidates_dict, disruption_event)

    # Persist as pending proposal in database
    proposal = RebalanceProposal(
        project_id=project_id,
        trigger_type=disruption_event["type"],
        scenario_details_json=json.dumps(disruption_event["params"]),
        solver_status=rebalance_result.get("solver_status", "optimal"),
        objective_score=rebalance_result.get("objective_score", 90.0),
        original_plan_json=json.dumps(rebalance_result.get("original_schedule", {})),
        proposed_plan_json=json.dumps(rebalance_result.get("proposed_schedule", {})),
        diff_summary_json=json.dumps({
            "reassigned_count": rebalance_result.get("reassigned_count", 0),
            "reassigned_tasks": rebalance_result.get("reassigned_tasks", []),
            "makespan_delta": round(
                rebalance_result.get("proposed_schedule", {}).get("project_duration_days", 0) -
                rebalance_result.get("original_schedule", {}).get("project_duration_days", 0), 1
            )
        }),
        explanations_json=json.dumps(explanations),
        risks_json=json.dumps(rebalance_result.get("risks", [])),
        status="pending"
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return {
        "proposal_id": proposal.id,
        "solver_status": rebalance_result.get("solver_status"),
        "objective_score": rebalance_result.get("objective_score"),
        "metrics": rebalance_result.get("metrics"),
        "original_schedule": rebalance_result.get("original_schedule"),
        "proposed_schedule": rebalance_result.get("proposed_schedule"),
        "reassigned_tasks": rebalance_result.get("reassigned_tasks"),
        "reassigned_count": rebalance_result.get("reassigned_count"),
        "explanations": explanations,
        "risks": rebalance_result.get("risks"),
        "proposed_tasks": rebalance_result.get("proposed_tasks")
    }

# ----------------- DECISION LIFECYCLE (APPROVE / REJECT / AUDIT) -----------------

@app.post("/api/projects/{project_id}/decisions/approve")
def approve_rebalance_proposal(project_id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    proposal_id = payload.get("proposal_id")
    proposal = db.query(RebalanceProposal).filter(RebalanceProposal.id == proposal_id, RebalanceProposal.project_id == project_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposed_schedule = json.loads(proposal.proposed_plan_json or "{}")
    proposed_tasks = proposed_schedule.get("tasks", [])

    # Update database tasks with new assignments and timelines
    for pt in proposed_tasks:
        db_task = db.query(Task).filter(Task.id == pt["id"]).first()
        if db_task:
            db_task.assigned_candidate_id = pt.get("assigned_candidate_id")
            db_task.start_day = pt.get("start_day", 0.0)
            db_task.end_day = pt.get("end_day", 0.0)
            db_task.is_critical_path = pt.get("is_critical_path", False)
            db_task.estimated_hours = pt.get("estimated_hours", db_task.estimated_hours)
            db_task.remaining_hours = pt.get("remaining_hours", db_task.remaining_hours)
            db_task.priority = pt.get("priority", db_task.priority)

    # Mark proposal as approved
    proposal.status = "approved"

    # Create immutable audit log entry
    diff_data = json.loads(proposal.diff_summary_json or "{}")
    reassigned_count = diff_data.get("reassigned_count", 0)

    log = DecisionLog(
        project_id=project_id,
        proposal_id=proposal_id,
        event_title=f"Autonomous Rebalancing Plan Approved ({proposal.trigger_type})",
        action_taken="APPROVED",
        summary=f"Plan applied with {reassigned_count} task reallocations. Solver Objective Score: {proposal.objective_score}/100.",
        affected_tasks_count=reassigned_count,
        details_json=proposal.diff_summary_json
    )
    db.add(log)
    db.commit()

    return {
        "status": "success",
        "message": f"Proposal #{proposal_id} approved and persisted. Project state updated.",
        "decision_log_id": log.id
    }

@app.post("/api/projects/{project_id}/decisions/reject")
def reject_rebalance_proposal(project_id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    proposal_id = payload.get("proposal_id")
    proposal = db.query(RebalanceProposal).filter(RebalanceProposal.id == proposal_id, RebalanceProposal.project_id == project_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposal.status = "rejected"
    log = DecisionLog(
        project_id=project_id,
        proposal_id=proposal_id,
        event_title=f"Autonomous Rebalancing Proposal Rejected ({proposal.trigger_type})",
        action_taken="REJECTED",
        summary="User rejected proposed rebalancing plan. Previous baseline plan retained.",
        affected_tasks_count=0,
        details_json=proposal.diff_summary_json
    )
    db.add(log)
    db.commit()

    return {
        "status": "success",
        "message": f"Proposal #{proposal_id} rejected. Baseline schedule preserved.",
        "decision_log_id": log.id
    }

@app.get("/api/projects/{project_id}/decisions/history")
def get_decision_history(project_id: int, db: Session = Depends(get_db)):
    logs = db.query(DecisionLog).filter(DecisionLog.project_id == project_id).order_by(DecisionLog.timestamp.desc()).all()
    return [
        {
            "id": l.id,
            "proposal_id": l.proposal_id,
            "event_title": l.event_title,
            "action_taken": l.action_taken,
            "summary": l.summary,
            "affected_tasks_count": l.affected_tasks_count,
            "details": json.loads(l.details_json or "{}"),
            "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S") if l.timestamp else ""
        }
        for l in logs
    ]

# Serve Frontend static files if directory exists
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Frontend"))
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/")
    def serve_frontend_root():
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
