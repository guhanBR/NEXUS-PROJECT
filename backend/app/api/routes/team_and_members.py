"""
Member & Team Formation Routes (Problem Statement #11).
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from ...schemas.project import MemberCreate, TeamRecommendRequest, TeamConfirmRequest
from ...repositories.entities_repo import member_repo, history_repo
from ...repositories.project_repo import project_repo
from ...algorithms.team_formation import recommend_team

members_router = APIRouter(prefix="/api/members", tags=["Members"])
team_router = APIRouter(prefix="/api/projects/{project_id}/team", tags=["Team Formation"])

@members_router.get("", response_model=List[Dict[str, Any]])
def list_members():
    return member_repo.list_all()

@members_router.post("", status_code=status.HTTP_201_CREATED)
def create_member(payload: MemberCreate):
    m_dict = payload.model_dump()
    if not m_dict.get("email"):
        m_dict["email"] = f"engineer_{m_dict['name'].lower().replace(' ', '_')}@rebalancex.io"
    m_dict["current_workload_hours"] = 0.0
    saved = member_repo.save(m_dict)
    return {"status": "success", "member": saved}

@team_router.post("/recommend")
def recommend_project_team(project_id: int, payload: TeamRecommendRequest):
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    target_size = payload.target_team_size or project.get("target_team_size", 4)
    req_skills = payload.required_skills if payload.required_skills is not None else project.get("required_skills", [])
    domains = payload.domains if payload.domains is not None else project.get("domains", [])

    all_members = member_repo.list_all()
    recommendation = recommend_team(all_members, req_skills, domains, target_size)
    return recommendation

@team_router.post("/confirm")
def confirm_project_team(project_id: int, payload: TeamConfirmRequest):
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    members = payload.team_members
    if not members:
        raise HTTPException(status_code=400, detail="No team members provided")

    # Format confirmed members
    confirmed_list = []
    for m in members:
        confirmed_list.append({
            "candidate_id": m.get("id") or m.get("candidate_id"),
            "name": m.get("name"),
            "email": m.get("email", ""),
            "role_in_project": m.get("role_title") or m.get("role_in_project", "Team Member"),
            "skills": m.get("skills", {}),
            "match_score": m.get("score") or m.get("match_score", 90.0),
            "match_reasons": m.get("reasons", ["Selected via Smart Team Formation Engine"]),
            "availability_status": m.get("availability_status", "available"),
            "avatar_color": m.get("avatar_color", "#2563EB")
        })

    project["team_members"] = confirmed_list
    project["status"] = "active"
    project_repo.save(project)

    # Record to Decision History
    history_repo.save({
        "project_id": project_id,
        "event_title": "Smart Team Composition Confirmed",
        "action_taken": "APPROVED",
        "summary": f"Team of {len(confirmed_list)} engineers confirmed via Team Formation Engine.",
        "affected_tasks_count": 0,
        "details": {"roster": [m["name"] for m in confirmed_list]}
    })

    return {"status": "success", "message": "Team composition confirmed and persisted.", "team_members": confirmed_list}
