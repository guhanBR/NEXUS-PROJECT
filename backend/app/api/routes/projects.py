"""
Project Endpoints: Create, list, retrieve project details.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from ...schemas.project import ProjectCreate, ProjectResponse
from ...repositories.project_repo import project_repo
from ...repositories.entities_repo import task_repo, member_repo
from ...algorithms.scheduler import compute_schedule

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[Dict[str, Any]])
def list_projects():
    projects = project_repo.list_projects()
    results = []
    for p in projects:
        tasks = task_repo.list_by_project(p["id"])
        results.append({
            **p,
            "task_count": len(tasks),
            "member_count": len(p.get("team_members", []))
        })
    return results

@router.post("", status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate):
    proj_dict = payload.model_dump()
    proj_dict["status"] = "planning"
    proj_dict["team_members"] = []
    saved = project_repo.save(proj_dict)
    return {"status": "success", "project": saved}

@router.get("/{project_id}")
def get_project_details(project_id: int):
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project #{project_id} not found")

    tasks = task_repo.list_by_project(project_id)
    members = member_repo.list_all()

    # Compute CPM schedule metrics
    schedule_data = compute_schedule(tasks, members, project.get("deadline_days", 30))

    return {
        **project,
        "tasks": schedule_data.get("tasks", tasks),
        "schedule_metrics": {
            "project_duration_days": schedule_data.get("project_duration_days", 0),
            "deadline_days": project.get("deadline_days", 30),
            "is_feasible": schedule_data.get("is_feasible", True),
            "deadline_breached": schedule_data.get("deadline_breached", False),
            "delay_days": schedule_data.get("delay_days", 0),
            "critical_path_task_ids": schedule_data.get("critical_path_task_ids", []),
            "resource_utilization": schedule_data.get("resource_utilization", {})
        }
    }
