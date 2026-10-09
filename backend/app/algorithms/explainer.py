"""
Deterministic Explainability Engine for RebalanceX Decisions.
Generates evidence-backed rationales for leadership review and audit history.
"""
from typing import List, Dict, Any

def generate_decision_explanations(
    rebalance_result: Dict[str, Any],
    members: List[Dict[str, Any]],
    disruption_event: Dict[str, Any]
) -> List[Dict[str, Any]]:
    explanations = []
    member_map = {m["id"]: m for m in members}
    disruption_type = disruption_event.get("type")
    params = disruption_event.get("params", {})

    reassigned_tasks = rebalance_result.get("reassigned_tasks", [])
    proposed_schedule = rebalance_result.get("proposed_schedule", {})
    solver_engine = rebalance_result.get("solver_engine", "Optimization Engine")

    if disruption_type == "member_unavailable":
        cand_name = member_map.get(params.get("candidate_id"), {}).get("name", "Team Member")
        explanations.append({
            "category": "DISRUPTION_MITIGATION",
            "title": f"Workforce Outage Containment ({cand_name})",
            "text": f"Identified {len(reassigned_tasks)} orphaned task(s) previously assigned to {cand_name}. {solver_engine} searched active team members with matching skill competencies and capacity to prevent delivery stall."
        })

    elif disruption_type == "deadline_shortened":
        new_dl = params.get("new_deadline_days")
        explanations.append({
            "category": "CRITICAL_PATH_COMPRESSION",
            "title": f"Deadline Compression to {new_dl} Days",
            "text": f"Project delivery target compressed to {new_dl} days. Critical path tasks were re-sequenced and distributed across available engineering bandwidth."
        })

    elif disruption_type == "urgent_task_added":
        explanations.append({
            "category": "EXPEDITION_INJECTION",
            "title": "Urgent Priority Task Integration",
            "text": "Emergency task integrated into schedule DAG without breaking prerequisite dependency chains."
        })

    elif disruption_type == "duration_overrun":
        explanations.append({
            "category": "SCHEDULE_RECOVERY",
            "title": "Task Scope Overrun Absorption",
            "text": "Absorbed task duration expansion by recalculating slack buffers on dependent downstream deliverables."
        })

    for r in reassigned_tasks:
        to_cand = member_map.get(r["to_candidate_id"], {})
        to_name = to_cand.get("name", "Assignee")
        skill = r["required_skill"]
        cand_skill_level = to_cand.get("skills", {}).get(skill, 0)
        
        util = proposed_schedule.get("resource_utilization", {}).get(r["to_candidate_id"], {})
        util_pct = util.get("utilization_pct", 50.0)

        rationale = f"Reassigned to {to_name} (holds level {cand_skill_level} in {skill}, post-assignment utilization: {util_pct}%). Scheduled Day {r['new_start_day']} - Day {r['new_end_day']} preserving prerequisite dependencies."
        explanations.append({
            "category": "TASK_REALLOCATION",
            "task_id": r["task_id"],
            "title": f"Reassignment of '{r['title']}' -> {to_name}",
            "text": rationale,
            "evidence": {
                "skill": skill,
                "candidate_level": cand_skill_level,
                "post_utilization_pct": util_pct,
                "new_timeline": f"Day {r['new_start_day']} - {r['new_end_day']}"
            }
        })

    return explanations
