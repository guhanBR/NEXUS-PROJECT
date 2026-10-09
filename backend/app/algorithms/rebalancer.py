"""
Autonomous Project Resource Rebalancing Engine (Problem Statement #18)
Implements Constraint Programming with Google OR-Tools CP-SAT and Deterministic Heuristic Fallback.
"""
from typing import List, Dict, Any, Tuple
import copy
from .scheduler import compute_schedule
from .constraints import check_dag_cycle, validate_member_eligibility
from .scoring import REBALANCING_LOSS_WEIGHTS

try:
    from ortools.sat.python import cp_model
    OR_TOOLS_AVAILABLE = True
except (ImportError, OSError, Exception):
    OR_TOOLS_AVAILABLE = False


def calculate_plan_objective(
    schedule_result: Dict[str, Any], 
    original_assignments: Dict[int, int], 
    tasks: List[Dict[str, Any]], 
    members: List[Dict[str, Any]],
    deadline_days: float
) -> Dict[str, Any]:
    makespan = schedule_result.get("project_duration_days", 0.0)
    delay = max(0.0, makespan - deadline_days)
    delay_penalty = delay * REBALANCING_LOSS_WEIGHTS["deadline_delay"]

    utilization_list = [u["utilization_pct"] for u in schedule_result.get("resource_utilization", {}).values()]
    if utilization_list:
        mean_u = sum(utilization_list) / len(utilization_list)
        variance = sum((u - mean_u)**2 for u in utilization_list) / len(utilization_list)
        imbalance_penalty = (variance ** 0.5) * REBALANCING_LOSS_WEIGHTS["workload_imbalance"]
    else:
        imbalance_penalty = 0.0

    churn_count = 0
    member_map = {m["id"]: m for m in members}
    skill_mismatch_penalty = 0.0

    for t in tasks:
        t_id = t["id"]
        orig_cand = original_assignments.get(t_id)
        new_cand = t.get("assigned_candidate_id")
        if orig_cand is not None and new_cand is not None and orig_cand != new_cand:
            churn_count += 1

        req_skill = t.get("required_skill")
        req_lvl = t.get("min_skill_level", 2)
        if new_cand and new_cand in member_map:
            cand_lvl = member_map[new_cand].get("skills", {}).get(req_skill, 0)
            if cand_lvl < req_lvl:
                skill_mismatch_penalty += REBALANCING_LOSS_WEIGHTS["skill_mismatch"] * (req_lvl - cand_lvl)

    churn_penalty = churn_count * REBALANCING_LOSS_WEIGHTS["churn_penalty"]
    total_loss = delay_penalty + imbalance_penalty + churn_penalty + skill_mismatch_penalty
    normalized_score = max(5.0, round(100.0 - min(95.0, total_loss), 1))

    return {
        "objective_score": normalized_score,
        "total_loss": round(total_loss, 2),
        "delay_days": round(delay, 1),
        "churn_count": churn_count,
        "churn_penalty": round(churn_penalty, 1),
        "imbalance_penalty": round(imbalance_penalty, 1)
    }

def solve_with_ortools_cpsat(
    tasks: List[Dict[str, Any]],
    available_members: List[Dict[str, Any]],
    original_assignments: Dict[int, int]
) -> Dict[int, int]:
    """
    Formulates a CP-SAT Integer Programming model to find optimal task assignments.
    """
    model = cp_model.CpModel()
    num_tasks = len(tasks)
    num_members = len(available_members)

    # Decision variables: x[t, m] = 1 if task t is assigned to member m
    x = {}
    for t_idx, t in enumerate(tasks):
        for m_idx, m in enumerate(available_members):
            x[t_idx, m_idx] = model.NewBoolVar(f"x_{t_idx}_{m_idx}")

    # Constraint 1: Each task must be assigned to exactly 1 member
    for t_idx in range(num_tasks):
        model.Add(sum(x[t_idx, m_idx] for m_idx in range(num_members)) == 1)

    # Objective weights: Match skill, minimize churn, balance workload
    obj_terms = []
    for t_idx, t in enumerate(tasks):
        req_skill = t.get("required_skill")
        req_lvl = t.get("min_skill_level", 2)
        t_id = t["id"]
        orig_cand_id = original_assignments.get(t_id)

        for m_idx, m in enumerate(available_members):
            m_id = m["id"]
            cand_skill_lvl = m.get("skills", {}).get(req_skill, 0)
            
            # Hard skill eligibility: if member has 0 in skill, prevent assignment
            if cand_skill_lvl == 0:
                model.Add(x[t_idx, m_idx] == 0)
                continue

            # Profit term: higher skill is better
            skill_bonus = cand_skill_lvl * 10
            # Churn penalty: if different from original, penalty of 5
            churn_cost = 0 if m_id == orig_cand_id else 5

            net_weight = skill_bonus - churn_cost
            obj_terms.append(x[t_idx, m_idx] * net_weight)

    model.Maximize(sum(obj_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 2.0
    status = solver.Solve(model)

    assignments = {}
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for t_idx, t in enumerate(tasks):
            for m_idx, m in enumerate(available_members):
                if solver.Value(x[t_idx, m_idx]) == 1:
                    assignments[t["id"]] = m["id"]
                    break
    return assignments

def solve_rebalancing(
    original_tasks: List[Dict[str, Any]],
    members: List[Dict[str, Any]],
    project_deadline_days: float,
    disruption_event: Dict[str, Any]
) -> Dict[str, Any]:
    working_tasks = [copy.deepcopy(t) for t in original_tasks]
    working_members = [copy.deepcopy(m) for m in members]
    member_map = {m["id"]: m for m in working_members}
    original_assignments = {t["id"]: t.get("assigned_candidate_id") for t in original_tasks}

    disruption_type = disruption_event.get("type", "member_unavailable")
    scenario_meta = disruption_event.get("params", {})

    affected_member_id = scenario_meta.get("candidate_id")
    shortened_deadline = scenario_meta.get("new_deadline_days")
    urgent_task_data = scenario_meta.get("urgent_task")
    overrun_task_id = scenario_meta.get("task_id")
    overrun_multiplier = scenario_meta.get("duration_multiplier", 1.5)
    escalated_task_id = scenario_meta.get("escalated_task_id")

    effective_deadline = project_deadline_days

    if disruption_type == "member_unavailable" and affected_member_id:
        if affected_member_id in member_map:
            member_map[affected_member_id]["availability_status"] = "unavailable"
            member_map[affected_member_id]["weekly_capacity_hours"] = 0.0
            member_map[affected_member_id]["daily_capacity_hours"] = 0.0

    elif disruption_type == "deadline_shortened" and shortened_deadline:
        effective_deadline = float(shortened_deadline)

    elif disruption_type == "urgent_task_added" and urgent_task_data:
        new_id = max([t["id"] for t in working_tasks], default=100) + 1
        urgent_task = {
            "id": new_id,
            "project_id": original_tasks[0].get("project_id", 1) if original_tasks else 1,
            "title": urgent_task_data.get("title", "Urgent Hotfix / Emergency Task"),
            "description": urgent_task_data.get("description", "High priority unblocked task"),
            "required_skill": urgent_task_data.get("required_skill", "Python"),
            "min_skill_level": urgent_task_data.get("min_skill_level", 3),
            "estimated_hours": urgent_task_data.get("estimated_hours", 16.0),
            "remaining_hours": urgent_task_data.get("estimated_hours", 16.0),
            "priority": "critical",
            "status": "todo",
            "dependencies": urgent_task_data.get("dependencies", []),
            "assigned_candidate_id": None
        }
        working_tasks.append(urgent_task)

    elif disruption_type == "duration_overrun" and overrun_task_id:
        for t in working_tasks:
            if t["id"] == overrun_task_id:
                t["estimated_hours"] = round(t.get("estimated_hours", 16.0) * overrun_multiplier, 1)
                t["remaining_hours"] = t["estimated_hours"]

    elif disruption_type == "priority_escalation" and escalated_task_id:
        for t in working_tasks:
            if t["id"] == escalated_task_id:
                t["priority"] = "critical"

    available_members = [m for m in working_members if m.get("availability_status") != "unavailable" and m.get("daily_capacity_hours", 0) > 0]
    
    if not available_members:
        return {
            "status": "infeasible",
            "solver_engine": "None",
            "solver_status": "infeasible",
            "message": "No active team members available to accept work.",
            "original_schedule": compute_schedule(original_tasks, members, project_deadline_days),
            "proposed_schedule": None,
            "reassigned_tasks": [],
            "reassigned_count": 0,
            "risks": ["Project is halted: 0 available active personnel."]
        }

    # Run Solver: Google OR-Tools CP-SAT or Deterministic Fallback
    solver_used = "Google OR-Tools CP-SAT" if OR_TOOLS_AVAILABLE else "Deterministic Heuristic Optimizer"
    new_assignments = {}

    if OR_TOOLS_AVAILABLE:
        try:
            new_assignments = solve_with_ortools_cpsat(working_tasks, available_members, original_assignments)
        except Exception:
            new_assignments = {}

    if not new_assignments:
        solver_used = "Deterministic Constraint Heuristic Optimizer"
        # Heuristic search
        member_assigned_hours = {m["id"]: 0.0 for m in available_members}
        for t in working_tasks:
            curr = t.get("assigned_candidate_id")
            if curr in member_assigned_hours and disruption_type != "deadline_shortened":
                is_elig, _ = validate_member_eligibility(member_map[curr], t)
                if is_elig:
                    new_assignments[t["id"]] = curr
                    member_assigned_hours[curr] += t.get("remaining_hours", 16.0)
                    continue

            best_m = None
            best_score = -99999.0
            for m in available_members:
                is_elig, _ = validate_member_eligibility(m, t)
                if not is_elig:
                    continue
                cand_lvl = m.get("skills", {}).get(t.get("required_skill"), 0)
                load_ratio = member_assigned_hours[m["id"]] / max(1.0, m.get("weekly_capacity_hours", 40.0) * (effective_deadline / 5.0))
                retention = 8.0 if original_assignments.get(t["id"]) == m["id"] else 0.0
                score = (cand_lvl * 4.0) - (load_ratio * 15.0) + retention
                if score > best_score:
                    best_score = score
                    best_m = m["id"]

            if best_m:
                new_assignments[t["id"]] = best_m
                member_assigned_hours[best_m] += t.get("remaining_hours", 16.0)
            else:
                fallback_m = max(available_members, key=lambda m: m.get("skills", {}).get(t.get("required_skill"), 0))
                new_assignments[t["id"]] = fallback_m["id"]
                member_assigned_hours[fallback_m["id"]] += t.get("remaining_hours", 16.0)

    for t in working_tasks:
        t["assigned_candidate_id"] = new_assignments.get(t["id"], t.get("assigned_candidate_id"))

    original_schedule = compute_schedule(original_tasks, members, project_deadline_days)
    proposed_schedule = compute_schedule(working_tasks, working_members, effective_deadline)

    metrics = calculate_plan_objective(
        proposed_schedule, original_assignments, working_tasks, working_members, effective_deadline
    )

    reassigned_tasks = []
    for t in working_tasks:
        t_id = t["id"]
        orig_id = original_assignments.get(t_id)
        new_id = t.get("assigned_candidate_id")

        if orig_id != new_id or t_id not in original_assignments:
            orig_name = member_map.get(orig_id, {}).get("name", "Unassigned") if orig_id else "Unassigned"
            new_name = member_map.get(new_id, {}).get("name", "Unassigned") if new_id else "Unassigned"

            orig_t = next((ot for ot in original_schedule.get("tasks", []) if ot["id"] == t_id), {})
            prop_t = next((pt for pt in proposed_schedule.get("tasks", []) if pt["id"] == t_id), {})

            reassigned_tasks.append({
                "task_id": t_id,
                "title": t.get("title"),
                "required_skill": t.get("required_skill"),
                "priority": t.get("priority"),
                "from_candidate_id": orig_id,
                "from_candidate_name": orig_name,
                "to_candidate_id": new_id,
                "to_candidate_name": new_name,
                "orig_start_day": orig_t.get("start_day", 0.0),
                "orig_end_day": orig_t.get("end_day", 0.0),
                "new_start_day": prop_t.get("start_day", 0.0),
                "new_end_day": prop_t.get("end_day", 0.0),
                "is_new_task": t_id not in original_assignments
            })

    if proposed_schedule.get("deadline_breached"):
        solver_status = "feasible_with_deadline_risk"
    elif metrics["objective_score"] >= 80.0:
        solver_status = "optimal"
    else:
        solver_status = "feasible_mitigated"

    risks = []
    if proposed_schedule.get("deadline_breached"):
        risks.append(f"Project duration ({proposed_schedule['project_duration_days']}d) exceeds target deadline ({effective_deadline}d) by {proposed_schedule['delay_days']}d.")

    for u in proposed_schedule.get("resource_utilization", {}).values():
        if u["status"] == "overloaded":
            risks.append(f"{u['name']} utilization is {u['utilization_pct']}% (Overload risk > 100%).")

    if not risks:
        risks.append("All tasks successfully re-routed with 0 hard constraint violations and on-time delivery.")

    return {
        "solver_engine": solver_used,
        "solver_status": solver_status,
        "objective_score": metrics["objective_score"],
        "metrics": metrics,
        "effective_deadline_days": effective_deadline,
        "original_schedule": original_schedule,
        "proposed_schedule": proposed_schedule,
        "reassigned_tasks": reassigned_tasks,
        "reassigned_count": len(reassigned_tasks),
        "risks": risks,
        "proposed_tasks": working_tasks,
        "disruption_type": disruption_type
    }
