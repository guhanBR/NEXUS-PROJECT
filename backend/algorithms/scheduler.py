"""
Critical Path Method (CPM) and Project Scheduling Engine.
Computes Early/Late Start, Float, Critical Paths, Resource Timelines, and Deadline Feasibility.
"""
from typing import List, Dict, Any, Tuple
from collections import defaultdict, deque

def validate_dependencies_and_sort(tasks: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], bool, str]:
    """
    Checks for cyclic dependencies using Kahn's algorithm and returns topologically sorted tasks.
    """
    task_map = {t["id"]: t for t in tasks}
    in_degree = {t["id"]: 0 for t in tasks}
    adj_list = defaultdict(list)

    for t in tasks:
        deps = t.get("dependencies", [])
        for d in deps:
            if d in task_map:
                adj_list[d].append(t["id"])
                in_degree[t["id"]] += 1

    queue = deque([t_id for t_id, deg in in_degree.items() if deg == 0])
    sorted_tasks = []

    while queue:
        curr = queue.popleft()
        sorted_tasks.append(task_map[curr])
        for neighbor in adj_list[curr]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(sorted_tasks) != len(tasks):
        return tasks, False, "Cycle detected in task dependencies"

    return sorted_tasks, True, ""

def compute_schedule(
    tasks: List[Dict[str, Any]], 
    candidates: List[Dict[str, Any]], 
    project_deadline_days: float = 30.0,
    hours_per_day: float = 8.0
) -> Dict[str, Any]:
    """
    Generates a deterministic schedule with CPM, early/late times, slack, critical path, and resource loads.
    """
    if not tasks:
        return {
            "tasks": [],
            "project_duration_days": 0.0,
            "project_deadline_days": project_deadline_days,
            "is_feasible": True,
            "critical_path_task_ids": [],
            "max_end_day": 0.0,
            "resource_utilization": {}
        }

    sorted_tasks, is_valid_dag, err_msg = validate_dependencies_and_sort(tasks)
    if not is_valid_dag:
        return {
            "error": err_msg,
            "tasks": tasks,
            "is_feasible": False,
            "critical_path_task_ids": []
        }

    task_map = {t["id"]: dict(t) for t in sorted_tasks}
    candidate_map = {c["id"]: c for c in candidates}

    # Helper: get task duration in days
    def get_duration_days(t: Dict[str, Any]) -> float:
        est_hrs = t.get("remaining_hours") or t.get("estimated_hours") or 16.0
        # If candidate is assigned and has specific daily capacity, use it
        assigned_id = t.get("assigned_candidate_id")
        cand_daily = candidate_map.get(assigned_id, {}).get("daily_capacity_hours", hours_per_day) if assigned_id else hours_per_day
        cand_daily = max(2.0, cand_daily)
        return max(0.5, round(est_hrs / cand_daily, 2))

    # 1. Forward Pass (Early Start, Early Finish)
    # Track when each candidate is next free (resource constrained sequencing)
    candidate_next_free_day = defaultdict(float)

    for t in sorted_tasks:
        t_id = t["id"]
        dur = get_duration_days(t)
        deps = t.get("dependencies", [])

        # Prerequisite completion time
        dep_finish = max([task_map[d].get("early_finish", 0.0) for d in deps if d in task_map], default=0.0)
        
        # Resource availability time
        assigned_id = t.get("assigned_candidate_id")
        res_ready = candidate_next_free_day[assigned_id] if assigned_id else 0.0

        early_start = max(dep_finish, res_ready)
        early_finish = round(early_start + dur, 2)

        task_map[t_id]["duration_days"] = dur
        task_map[t_id]["early_start"] = early_start
        task_map[t_id]["early_finish"] = early_finish
        task_map[t_id]["start_day"] = early_start
        task_map[t_id]["end_day"] = early_finish

        if assigned_id:
            candidate_next_free_day[assigned_id] = early_finish

    # Project makespan
    project_duration = max([t["early_finish"] for t in task_map.values()], default=0.0)
    target_project_finish = max(project_duration, project_deadline_days)

    # 2. Backward Pass (Late Start, Late Finish)
    # Build reverse graph
    rev_adj = defaultdict(list)
    for t_id, t in task_map.items():
        for d in t.get("dependencies", []):
            rev_adj[d].append(t_id)

    # Reverse topological order
    for t in reversed(sorted_tasks):
        t_id = t["id"]
        dur = task_map[t_id]["duration_days"]
        successors = rev_adj[t_id]

        if not successors:
            late_finish = target_project_finish
        else:
            late_finish = min([task_map[s]["late_start"] for s in successors])

        late_start = round(late_finish - dur, 2)
        task_map[t_id]["late_finish"] = late_finish
        task_map[t_id]["late_start"] = late_start

        slack = round(late_start - task_map[t_id]["early_start"], 2)
        task_map[t_id]["slack_days"] = max(0.0, slack)
        task_map[t_id]["is_critical_path"] = abs(slack) <= 0.2

    critical_path_ids = [t_id for t_id, t in task_map.items() if t.get("is_critical_path")]

    # 3. Resource Workload and Timeline Aggregation
    resource_utilization = {}
    for c in candidates:
        c_id = c["id"]
        c_tasks = [t for t in task_map.values() if t.get("assigned_candidate_id") == c_id]
        total_assigned_hours = sum(t.get("estimated_hours", 16.0) for t in c_tasks)
        weekly_cap = c.get("weekly_capacity_hours", 40.0)
        # 4-week horizon total capacity
        total_capacity_horizon = weekly_cap * max(1.0, project_deadline_days / 5.0)
        util_pct = min(150.0, round((total_assigned_hours / max(1.0, total_capacity_horizon)) * 100, 1))

        resource_utilization[c_id] = {
            "candidate_id": c_id,
            "name": c.get("name"),
            "assigned_tasks_count": len(c_tasks),
            "assigned_hours": round(total_assigned_hours, 1),
            "capacity_hours": round(total_capacity_horizon, 1),
            "utilization_pct": util_pct,
            "status": "overloaded" if util_pct > 105 else ("underutilized" if util_pct < 40 else "optimal")
        }

    # Deadline status
    deadline_breached = project_duration > project_deadline_days
    delay_days = max(0.0, round(project_duration - project_deadline_days, 1))

    return {
        "tasks": list(task_map.values()),
        "project_duration_days": round(project_duration, 1),
        "project_deadline_days": project_deadline_days,
        "is_feasible": not deadline_breached,
        "deadline_breached": deadline_breached,
        "delay_days": delay_days,
        "critical_path_task_ids": critical_path_ids,
        "resource_utilization": resource_utilization
    }
