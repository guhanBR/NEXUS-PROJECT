"""
Initial Task Allocation Engine.
Assigns project tasks to available and qualified team members based on competency and capacity.
"""
from typing import List, Dict, Any
from .constraints import validate_member_eligibility

def allocate_tasks_to_team(tasks: List[Dict[str, Any]], team_members: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    allocated_tasks = [dict(t) for t in tasks]
    member_loads = {m["id"]: 0.0 for m in team_members}

    for t in allocated_tasks:
        if t.get("assigned_candidate_id"):
            cid = t["assigned_candidate_id"]
            if cid in member_loads:
                member_loads[cid] += t.get("estimated_hours", 16.0)
                continue

        # Find best eligible candidate
        best_cand = None
        best_score = -99999.0

        for m in team_members:
            is_eligible, _ = validate_member_eligibility(m, t)
            if not is_eligible:
                continue

            cand_skill = m.get("skills", {}).get(t.get("required_skill"), 0)
            req_skill_lvl = t.get("min_skill_level", 2)
            skill_factor = (cand_skill / max(1, req_skill_lvl)) * 10.0
            
            # Penalize heavy current load
            load_factor = member_loads[m["id"]] / max(1.0, m.get("weekly_capacity_hours", 40.0))
            score = skill_factor - (load_factor * 8.0)

            if score > best_score:
                best_score = score
                best_cand = m["id"]

        if best_cand:
            t["assigned_candidate_id"] = best_cand
            member_loads[best_cand] += t.get("estimated_hours", 16.0)
        else:
            # Fallback to member with highest skill
            fallback = max(team_members, key=lambda m: m.get("skills", {}).get(t.get("required_skill"), 0))
            t["assigned_candidate_id"] = fallback["id"]
            member_loads[fallback["id"]] += t.get("estimated_hours", 16.0)

    return allocated_tasks
