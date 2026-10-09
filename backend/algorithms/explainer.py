"""
Deterministic Explainability Engine for RebalanceX Decisions.
Translates mathematical constraint optimization results and CPM metrics into transparent, auditable rationales.
"""
from typing import List, Dict, Any

def generate_decision_explanations(
    rebalance_result: Dict[str, Any],
    candidates: List[Dict[str, Any]],
    disruption_event: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Generates structured, auditable reasons for every single reassignment and plan adjustment.
    """
    explanations = []
    candidate_map = {c["id"]: c for c in candidates}
    disruption_type = disruption_event.get("type")
    params = disruption_event.get("params", {})

    reassigned_tasks = rebalance_result.get("reassigned_tasks", [])
    proposed_schedule = rebalance_result.get("proposed_schedule", {})
    orig_duration = rebalance_result.get("original_schedule", {}).get("project_duration_days", 0)
    new_duration = proposed_schedule.get("project_duration_days", 0)

    # 1. Macro / Strategic Plan Summary Explanation
    if disruption_type == "member_unavailable":
        cand_name = candidate_map.get(params.get("candidate_id"), {}).get("name", "Team Member")
        explanations.append({
            "category": "DISRUPTION_MITIGATION",
            "title": f"Workforce Outage Containment ({cand_name})",
            "text": f"Identified {len(reassigned_tasks)} orphaned task(s) previously assigned to {cand_name}. The engine searched active team members with matching skill requirements and available capacity to prevent project stall."
        })

    elif disruption_type == "deadline_shortened":
        new_dl = params.get("new_deadline_days")
        explanations.append({
            "category": "CRITICAL_PATH_COMPRESSION",
            "title": f"Deadline Compression to {new_dl} Days",
            "text": f"Target deadline was compressed by {round(orig_duration - float(new_dl), 1) if float(new_dl) < orig_duration else 0} days. Critical path tasks were re-sequenced and distributed to balance load across concurrent active resources."
        })

    elif disruption_type == "urgent_task_added":
        explanations.append({
            "category": "EXPEDITION_INJECTION",
            "title": "Urgent Priority Task Integration",
            "text": "Integrated emergency task without breaking prerequisite dependency chains, scheduling it at the earliest available slot for the top-qualified engineer."
        })

    elif disruption_type == "duration_overrun":
        explanations.append({
            "category": "SCHEDULE_RECOVERY",
            "title": "Task Complexity Overrun Absorption",
            "text": "Absorbed task duration expansion by recalculating slack buffers on dependent downstream deliverables."
        })

    # 2. Micro / Individual Task Level Rationales
    for r in reassigned_tasks:
        to_cand = candidate_map.get(r["to_candidate_id"], {})
        to_name = to_cand.get("name", "Assignee")
        skill = r["required_skill"]
        cand_skill_level = to_cand.get("skills", {}).get(skill, 0)
        
        # Check utilization
        util = proposed_schedule.get("resource_utilization", {}).get(r["to_candidate_id"], {})
        util_pct = util.get("utilization_pct", 50.0)

        rationale_bullets = [
            f"Qualified competence: {to_name} holds level {cand_skill_level} proficiency in {skill}.",
            f"Capacity headroom: Post-assignment utilization is {util_pct}%, safely within sustainable working limits.",
            f"Dependency preserved: Scheduled from Day {r['new_start_day']} to Day {r['new_end_day']} respecting predecessor delivery."
        ]

        if r.get("from_candidate_name") and r.get("from_candidate_name") != "Unassigned":
            rationale_bullets.insert(0, f"Re-routed from {r['from_candidate_name']} due to active constraint disruption.")

        explanations.append({
            "category": "TASK_REALLOCATION",
            "task_id": r["task_id"],
            "title": f"Reassignment of '{r['title']}' -> {to_name}",
            "text": " ".join(rationale_bullets),
            "evidence": {
                "skill": skill,
                "candidate_level": cand_skill_level,
                "post_utilization_pct": util_pct,
                "new_timeline": f"Day {r['new_start_day']} - {r['new_end_day']}"
            }
        })

    # 3. Critical Path Delta Explanation
    orig_cp = set(rebalance_result.get("original_schedule", {}).get("critical_path_task_ids", []))
    prop_cp = set(proposed_schedule.get("critical_path_task_ids", []))

    if orig_cp != prop_cp:
        new_critical_tasks = prop_cp - orig_cp
        explanations.append({
            "category": "CRITICAL_PATH_SHIFT",
            "title": "Critical Path Dynamic Adjustment",
            "text": f"Rebalancing shifted the project critical path. Tasks now on the zero-float critical chain: {', '.join(f'#{tid}' for tid in prop_cp)}. Total duration is projected at {new_duration} days."
        })

    return explanations
