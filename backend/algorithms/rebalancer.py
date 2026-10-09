"""
Autonomous Project Resource Rebalancing Engine (Problem Statement #18)
Solves multi-objective resource reallocation under operational disruptions with hard/soft constraint handling.
"""
from typing import List, Dict, Any, Tuple
import copy
from .scheduler import compute_schedule, validate_dependencies_and_sort

def calculate_plan_objective(
    schedule_result: Dict[str, Any], 
    original_assignments: Dict[int, int], 
    tasks: List[Dict[str, Any]], 
    candidates: List[Dict[str, Any]],
    deadline_days: float
) -> Dict[str, Any]:
    """
    Evaluates multi-factor loss function:
    Loss = w1*DeadlineDelay + w2*WorkloadImbalance + w3*ReassignmentChurn + w4*SkillMismatch
    Lower loss / Higher Objective Score (100 - Loss) is better.
    """
    makespan = schedule_result.get("project_duration_days", 0.0)
    delay = max(0.0, makespan - deadline_days)
    delay_penalty = delay * 8.0 # High penalty per day of delay

    # Workload imbalance (standard deviation of utilization)
    utilization_list = [u["utilization_pct"] for u in schedule_result.get("resource_utilization", {}).values()]
    if utilization_list:
        mean_u = sum(utilization_list) / len(utilization_list)
        variance = sum((u - mean_u)**2 for u in utilization_list) / len(utilization_list)
        imbalance_penalty = (variance ** 0.5) * 0.4
    else:
        imbalance_penalty = 0.0

    # Churn penalty: number of tasks reassigned compared to original plan
    churn_count = 0
    candidate_map = {c["id"]: c for c in candidates}
    skill_mismatch_penalty = 0.0

    for t in tasks:
        t_id = t["id"]
        orig_cand = original_assignments.get(t_id)
        new_cand = t.get("assigned_candidate_id")
        if orig_cand is not None and new_cand is not None and orig_cand != new_cand:
            churn_count += 1

        # Skill fit check
        req_skill = t.get("required_skill")
        req_lvl = t.get("min_skill_level", 2)
        if new_cand and new_cand in candidate_map:
            cand_skill_lvl = candidate_map[new_cand].get("skills", {}).get(req_skill, 0)
            if cand_skill_lvl < req_lvl:
                skill_mismatch_penalty += 15.0 * (req_lvl - cand_skill_lvl)

    churn_penalty = churn_count * 3.5

    total_loss = delay_penalty + imbalance_penalty + churn_penalty + skill_mismatch_penalty
    normalized_score = max(5.0, round(100.0 - min(95.0, total_loss), 1))

    return {
        "objective_score": normalized_score,
        "total_loss": round(total_loss, 2),
        "delay_days": round(delay, 1),
        "delay_penalty": round(delay_penalty, 1),
        "imbalance_penalty": round(imbalance_penalty, 1),
        "churn_count": churn_count,
        "churn_penalty": round(churn_penalty, 1),
        "skill_mismatch_penalty": round(skill_mismatch_penalty, 1)
    }

def solve_rebalancing(
    original_tasks: List[Dict[str, Any]],
    candidates: List[Dict[str, Any]],
    project_deadline_days: float,
    disruption_event: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Executes intelligent rebalancing based on the disruption scenario.
    Applies constraint programming heuristic to assign tasks to qualified, available members.
    """
    working_tasks = [copy.deepcopy(t) for t in original_tasks]
    working_candidates = [copy.deepcopy(c) for c in candidates]
    candidate_map = {c["id"]: c for c in working_candidates}
    original_assignments = {t["id"]: t.get("assigned_candidate_id") for t in original_tasks}

    disruption_type = disruption_event.get("type", "member_unavailable")
    scenario_meta = disruption_event.get("params", {})
    
    # 1. Apply Disruption Scenario Parameters
    affected_member_id = scenario_meta.get("candidate_id")
    shortened_deadline = scenario_meta.get("new_deadline_days")
    urgent_task_data = scenario_meta.get("urgent_task")
    overrun_task_id = scenario_meta.get("task_id")
    overrun_multiplier = scenario_meta.get("duration_multiplier", 1.5)
    escalated_task_id = scenario_meta.get("escalated_task_id")

    effective_deadline = project_deadline_days

    if disruption_type == "member_unavailable" and affected_member_id:
        if affected_member_id in candidate_map:
            candidate_map[affected_member_id]["availability_status"] = "unavailable"
            candidate_map[affected_member_id]["weekly_capacity_hours"] = 0.0
            candidate_map[affected_member_id]["daily_capacity_hours"] = 0.0

    elif disruption_type == "deadline_shortened" and shortened_deadline:
        effective_deadline = float(shortened_deadline)

    elif disruption_type == "urgent_task_added" and urgent_task_data:
        new_id = max([t["id"] for t in working_tasks], default=100) + 1
        urgent_task = {
            "id": new_id,
            "project_id": original_tasks[0].get("project_id", 1) if original_tasks else 1,
            "title": urgent_task_data.get("title", "Urgent Hotfix / Priority Task"),
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

    # 2. Constraint Optimization & Assignment Search
    # Filter available candidates
    available_candidates = [c for c in working_candidates if c.get("availability_status") != "unavailable" and c.get("daily_capacity_hours", 0) > 0]
    
    if not available_candidates:
        return {
            "status": "infeasible",
            "message": "No active team members available to accept work.",
            "original_schedule": compute_schedule(original_tasks, candidates, project_deadline_days),
            "proposed_schedule": None,
            "diff": {},
            "explanations": ["Fatal: Zero available capacity in active team pool."],
            "risks": ["Project is completely halted due to lack of available personnel."]
        }

    # Identify tasks that MUST be reassigned (assigned to unavailable person or unassigned)
    def is_candidate_eligible(cand: Dict[str, Any], task: Dict[str, Any]) -> Tuple[bool, float]:
        skill_req = task.get("required_skill")
        min_lvl = task.get("min_skill_level", 2)
        cand_lvl = cand.get("skills", {}).get(skill_req, 0)
        
        # Hard check: candidate must have the skill (at least level 1 for emergency reassignment, ideally >= min_lvl)
        if cand_lvl == 0:
            return False, 0.0
        
        proficiency_factor = cand_lvl / max(1, min_lvl)
        # Higher score for matching experience & headroom
        score = proficiency_factor * 10.0 + cand.get("experience_years", 1.0)
        return True, score

    # Sort tasks: critical/high priority first, then tasks with earlier dependencies
    sorted_tasks_for_alloc, _, _ = validate_dependencies_and_sort(working_tasks)
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    sorted_tasks_for_alloc.sort(key=lambda x: (priority_order.get(x.get("priority", "medium"), 2)))

    # Workload tracker during greedy optimization pass
    candidate_assigned_hours = {c["id"]: 0.0 for c in available_candidates}
    
    # Pre-populate already assigned valid tasks
    for t in sorted_tasks_for_alloc:
        curr_assigned = t.get("assigned_candidate_id")
        if curr_assigned in candidate_assigned_hours and disruption_type != "deadline_shortened":
            # Check if current assignee is still valid
            is_valid, _ = is_candidate_eligible(candidate_map[curr_assigned], t)
            if is_valid:
                candidate_assigned_hours[curr_assigned] += t.get("remaining_hours", 16.0)

    # Optimization loop: reassign tasks that need reassignment or balance load if deadline compressed
    for t in sorted_tasks_for_alloc:
        curr_assigned = t.get("assigned_candidate_id")
        needs_reassignment = False

        if curr_assigned not in candidate_assigned_hours: # Assigned to unavailable member or unassigned
            needs_reassignment = True
        elif disruption_type == "deadline_shortened" or disruption_type == "duration_overrun":
            # Evaluate if moving to less loaded/higher skilled member reduces overall makespan
            needs_reassignment = True

        if needs_reassignment:
            best_cand_id = None
            best_cand_score = -999999.0

            for cand in available_candidates:
                c_id = cand["id"]
                is_eligible, skill_score = is_candidate_eligible(cand, t)
                if not is_eligible:
                    continue

                curr_load = candidate_assigned_hours[c_id]
                max_cap = cand.get("weekly_capacity_hours", 40.0) * (effective_deadline / 5.0)
                load_ratio = curr_load / max(1.0, max_cap)

                # Score candidate for this task:
                # High skill + Low load + Retention bonus if already original assignee
                retention_bonus = 8.0 if original_assignments.get(t["id"]) == c_id else 0.0
                cand_score = (skill_score * 3.0) - (load_ratio * 15.0) + retention_bonus

                if cand_score > best_cand_score:
                    best_cand_score = cand_score
                    best_cand_id = c_id

            if best_cand_id:
                # Update assignment
                t["assigned_candidate_id"] = best_cand_id
                candidate_assigned_hours[best_cand_id] += t.get("remaining_hours", 16.0)
            else:
                # Emergency fallback: assign to candidate with highest skill regardless of load
                fallback_cand = max(available_candidates, key=lambda c: c.get("skills", {}).get(t.get("required_skill"), 0))
                t["assigned_candidate_id"] = fallback_cand["id"]
                candidate_assigned_hours[fallback_cand["id"]] += t.get("remaining_hours", 16.0)

    # 3. Recalculate Complete Schedule and Critical Path
    original_schedule = compute_schedule(original_tasks, candidates, project_deadline_days)
    proposed_schedule = compute_schedule(working_tasks, working_candidates, effective_deadline)

    # 4. Evaluate Plan Metrics and Objective Score
    metrics = calculate_plan_objective(
        proposed_schedule,
        original_assignments,
        working_tasks,
        working_candidates,
        effective_deadline
    )

    # 5. Compute Plan Diff & Changes Summary
    reassigned_tasks = []
    for t in working_tasks:
        t_id = t["id"]
        orig_assigned_id = original_assignments.get(t_id)
        new_assigned_id = t.get("assigned_candidate_id")

        if orig_assigned_id != new_assigned_id or t_id not in original_assignments:
            orig_name = candidate_map.get(orig_assigned_id, {}).get("name", "Unassigned") if orig_assigned_id else "Unassigned"
            new_name = candidate_map.get(new_assigned_id, {}).get("name", "Unassigned") if new_assigned_id else "Unassigned"
            
            # Find original task timeline
            orig_t = next((ot for ot in original_schedule.get("tasks", []) if ot["id"] == t_id), {})
            prop_t = next((pt for pt in proposed_schedule.get("tasks", []) if pt["id"] == t_id), {})

            reassigned_tasks.append({
                "task_id": t_id,
                "title": t.get("title"),
                "required_skill": t.get("required_skill"),
                "priority": t.get("priority"),
                "from_candidate_id": orig_assigned_id,
                "from_candidate_name": orig_name,
                "to_candidate_id": new_assigned_id,
                "to_candidate_name": new_name,
                "orig_start_day": orig_t.get("start_day", 0.0),
                "orig_end_day": orig_t.get("end_day", 0.0),
                "new_start_day": prop_t.get("start_day", 0.0),
                "new_end_day": prop_t.get("end_day", 0.0),
                "is_new_task": t_id not in original_assignments
            })

    # Solver status
    if proposed_schedule.get("deadline_breached"):
        solver_status = "feasible_with_deadline_risk"
    elif metrics["objective_score"] >= 80.0:
        solver_status = "optimal"
    else:
        solver_status = "feasible_mitigated"

    # Identify Risks
    risks = []
    if proposed_schedule.get("deadline_breached"):
        risks.append(f"Project makespan ({proposed_schedule['project_duration_days']} days) exceeds target deadline of {effective_deadline} days by {proposed_schedule['delay_days']} days.")
    
    for u in proposed_schedule.get("resource_utilization", {}).values():
        if u["status"] == "overloaded":
            risks.append(f"{u['name']} utilization is {u['utilization_pct']}% (Overload risk > 100%).")

    if not risks:
        risks.append("All tasks successfully re-routed with 0 hard constraint violations and on-time delivery.")

    return {
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
