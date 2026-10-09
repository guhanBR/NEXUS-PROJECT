"""
Task Management & CPM Schedule Routes.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from ...schemas.project import TaskCreate, TaskUpdate
from ...repositories.entities_repo import task_repo, member_repo
from ...repositories.project_repo import project_repo
from ...algorithms.scheduler import compute_schedule

tasks_router = APIRouter(tags=["Tasks & Schedule"])

@tasks_router.post("/api/projects/{project_id}/tasks", status_code=status.HTTP_201_CREATED)
def create_task(project_id: int, payload: TaskCreate):
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    t_dict = payload.model_dump()
    t_dict["project_id"] = project_id
    if t_dict.get("remaining_hours") is None:
        t_dict["remaining_hours"] = t_dict["estimated_hours"]

    saved = task_repo.save(t_dict)
    return {"status": "success", "task": saved}

@tasks_router.patch("/api/tasks/{task_id}")
def update_task(task_id: int, payload: TaskUpdate):
    task = task_repo.get_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    task.update(update_data)
    saved = task_repo.save(task)
    return {"status": "success", "task": saved}

@tasks_router.post("/api/projects/{project_id}/schedule")
def generate_schedule(project_id: int):
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = task_repo.list_by_project(project_id)
    members = member_repo.list_all()

    schedule = compute_schedule(tasks, members, project.get("deadline_days", 30))
    if "error" in schedule:
        raise HTTPException(status_code=400, detail=schedule["error"])

    # Update tasks with computed early start/end days
    for t_res in schedule.get("tasks", []):
        db_task = task_repo.get_by_id(t_res["id"])
        if db_task:
            db_task["start_day"] = t_res.get("start_day", 0.0)
            db_task["end_day"] = t_res.get("end_day", 0.0)
            db_task["is_critical_path"] = t_res.get("is_critical_path", False)
            db_task["slack_days"] = t_res.get("slack_days", 0.0)
            task_repo.save(db_task)

    return {"status": "success", "schedule": schedule}
