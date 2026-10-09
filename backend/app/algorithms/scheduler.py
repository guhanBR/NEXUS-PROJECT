"""
Critical Path Method (CPM) and Project Scheduling Engine.
Computes Early/Late times, Float Slack, Critical Path, and Resource Calendars.
"""
from typing import List, Dict, Any
from collections import defaultdict
from .constraints import check_dag_cycle

def compute_schedule(
    tasks: List[Dict[str, Any]], 
    members: List[Dict[str, Any]], 
    project_deadline_days: float = 30.0,
    hours_per_day: float = 8.0
) -> Dict[str, Any]:
    if not tasks:
        return {
            "tasks": [],
            "project_duration_days": 0.0,
            "project_deadline_days": project_deadline_days,
            "is_feasible": True,
            "critical_path_task_ids": [],
            "resource_utilization": {}
        }

    is_valid_dag, sorted_ids, err_msg = check_dag_cycle(tasks)
    if not is_valid_dag:
        return {
            "error": err_msg,
            "tasks": tasks,
            "is_feasible": False,
            "critical_path_task_ids": []
        }

    task_map = {t["id"]: dict(t) for t in tasks}
    member_map = {m["id"]: m for m in members}

    def get_duration_days(t: Dict[str, Any]) -> float:
        est_hrs = t.get("remaining_hours") or t.get("estimated_hours") or 16.0
        assigned_id = t.get("assigned_candidate_id")
        daily_cap = member_map.get(assigned_id, {}).get("daily_capacity_hours", hours_per_day) if assigned_id else hours_per_day
        daily_cap = max(2.0, daily_cap)
        return max(0.5, round(est_hrs / daily_cap, 2))

    # 1. Forward Pass
    member_next_free_day = defaultdict(float)
    for t_id in sorted_ids:
        t = task_map[t_id]
        dur = get_duration_days(t)
        deps = t.get("dependencies", [])

        dep_finish = max([task_map[d].get("early_finish", 0.0) for d in deps if d in task_map], default=0.0)
        assigned_id = t.get("assigned_candidate_id")
        res_ready = member_next_free_day[assigned_id] if assigned_id else 0.0

        early_start = max(dep_finish, res_ready)
        early_finish = round(early_start + dur, 2)

        task_map[t_id]["duration_days"] = dur
        task_map[t_id]["early_start"] = early_start
        task_map[t_id]["early_finish"] = early_finish
        task_map[t_id]["start_day"] = early_start
        task_map[t_id]["end_day"] = early_finish

        if assigned_id:
            member_next_free_day[assigned_id] = early_finish

    project_duration = max([t["early_finish"] for t in task_map.values()], default=0.0)
    target_finish = project_duration


    # 2. Backward Pass
    rev_adj = defaultdict(list)
    for t_id, t in task_map.items():
        for d in t.get("dependencies", []):
            rev_adj[d].append(t_id)

    for t_id in reversed(sorted_ids):
        dur = task_map[t_id]["duration_days"]
        successors = rev_adj[t_id]
        if not successors:
            late_finish = target_finish
        else:
            late_finish = min([task_map[s]["late_start"] for s in successors])

        late_start = round(late_finish - dur, 2)
        task_map[t_id]["late_finish"] = late_finish
        task_map[t_id]["late_start"] = late_start

        slack = round(late_start - task_map[t_id]["early_start"], 2)
        task_map[t_id]["slack_days"] = max(0.0, slack)
        task_map[t_id]["is_critical_path"] = abs(slack) <= 0.2

    critical_path_ids = [t_id for t_id, t in task_map.items() if t.get("is_critical_path")]

    # 3. Workload Utilization
    resource_utilization = {}
    for m in members:
        m_id = m["id"]
        m_tasks = [t for t in task_map.values() if t.get("assigned_candidate_id") == m_id]
        total_assigned_hours = sum(t.get("estimated_hours", 16.0) for t in m_tasks)
        weekly_cap = m.get("weekly_capacity_hours", 40.0)
        total_capacity_horizon = weekly_cap * max(1.0, project_deadline_days / 5.0)
        util_pct = min(150.0, round((total_assigned_hours / max(1.0, total_capacity_horizon)) * 100, 1))

        resource_utilization[m_id] = {
            "candidate_id": m_id,
            "name": m.get("name"),
            "assigned_tasks_count": len(m_tasks),
            "assigned_hours": round(total_assigned_hours, 1),
            "capacity_hours": round(total_capacity_horizon, 1),
            "utilization_pct": util_pct,
            "status": "overloaded" if util_pct > 105 else ("underutilized" if util_pct < 40 else "optimal")
        }

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
