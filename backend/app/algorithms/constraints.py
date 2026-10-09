"""
Constraint Checking & Validation Rules.
Includes Kahn's Algorithm for DAG cycle detection and hard eligibility verification.
"""
from typing import List, Dict, Any, Tuple
from collections import defaultdict, deque

def check_dag_cycle(tasks: List[Dict[str, Any]]) -> Tuple[bool, List[int], str]:
    """
    Validates that task dependencies form a Directed Acyclic Graph (DAG) with no circular dependencies.
    Returns: (is_valid_dag, topologically_sorted_ids, error_message)
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
    sorted_ids = []

    while queue:
        curr = queue.popleft()
        sorted_ids.append(curr)
        for neighbor in adj_list[curr]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(sorted_ids) != len(tasks):
        cyclic_nodes = [t_id for t_id, deg in in_degree.items() if deg > 0]
        return False, [], f"Cyclic dependency detected involving task IDs: {cyclic_nodes}"

    return True, sorted_ids, ""

def validate_member_eligibility(member: Dict[str, Any], task: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validates hard eligibility constraints for assigning a member to a task.
    """
    if member.get("availability_status") == "unavailable":
        return False, f"Member '{member.get('name')}' is currently marked unavailable."

    req_skill = task.get("required_skill")
    min_lvl = task.get("min_skill_level", 2)
    member_skills = member.get("skills", {})

    cand_lvl = member_skills.get(req_skill, 0)
    if cand_lvl == 0:
        return False, f"Member lacks required skill '{req_skill}'."

    return True, "Eligible"
