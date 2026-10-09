"""
Smart Internship & Team Formation Engine (Problem Statement #11)
Deterministic Multi-Objective Algorithm with Transparent Scoring & Explainability.
"""
from typing import List, Dict, Any
import itertools
import math

def calculate_candidate_match(candidate: Dict[str, Any], project_reqs: List[Dict[str, Any]], project_domains: List[str]) -> Dict[str, Any]:
    cand_skills = candidate.get("skills", {})
    cand_interests = candidate.get("interests", [])
    cand_exp = candidate.get("experience_years", 1.0)
    cand_workload = candidate.get("current_workload_hours", 0.0)
    cand_capacity = candidate.get("weekly_capacity_hours", 40.0)
    cand_avail = candidate.get("availability_status", "available")

    # 1. Skill proficiency score (0 to 1)
    matched_skills = []
    missing_mandatory = []
    skill_score_sum = 0.0
    total_skill_weight = 0.0

    for req in project_reqs:
        req_name = req.get("skill")
        req_min = req.get("min_level", 2)
        is_mand = req.get("mandatory", True)
        cand_lvl = cand_skills.get(req_name, 0)

        weight = 1.5 if is_mand else 1.0
        total_skill_weight += weight

        if cand_lvl >= req_min:
            # Full or bonus points for higher skill
            proficiency_ratio = min(1.3, cand_lvl / req_min)
            skill_score_sum += proficiency_ratio * weight
            matched_skills.append({
                "skill": req_name,
                "candidate_level": cand_lvl,
                "required_level": req_min,
                "status": "exceeds" if cand_lvl > req_min else "meets"
            })
        elif cand_lvl > 0:
            # Partial match
            proficiency_ratio = (cand_lvl / req_min) * 0.6
            skill_score_sum += proficiency_ratio * weight
            matched_skills.append({
                "skill": req_name,
                "candidate_level": cand_lvl,
                "required_level": req_min,
                "status": "partial"
            })
            if is_mand and cand_lvl < req_min:
                missing_mandatory.append(f"{req_name} (Level {cand_lvl}/{req_min})")
        else:
            if is_mand:
                missing_mandatory.append(f"{req_name} (Level 0/{req_min})")

    skill_score = (skill_score_sum / total_skill_weight) if total_skill_weight > 0 else 0.5

    # 2. Domain & Interest alignment score (0 to 1)
    matched_domains = [d for d in cand_interests if any(pd.lower() in d.lower() or d.lower() in pd.lower() for pd in project_domains)]
    domain_score = min(1.0, len(matched_domains) / max(1, len(project_domains))) if project_domains else 0.8

    # 3. Experience factor (log-scaled normalized)
    exp_score = min(1.0, cand_exp / 4.0)

    # 4. Availability & Load factor
    if cand_avail == "unavailable":
        avail_score = 0.0
    elif cand_avail == "partially_available":
        avail_score = 0.5
    else:
        avail_score = 1.0

    utilization = cand_workload / max(1.0, cand_capacity)
    load_headroom = max(0.0, 1.0 - utilization) # higher headroom = better
    capacity_score = avail_score * (0.3 + 0.7 * load_headroom)

    # Composite individual score
    # Weights: Skill (45%), Domain/Interest (20%), Experience (15%), Capacity/Availability (20%)
    composite_score = (
        0.45 * skill_score +
        0.20 * domain_score +
        0.15 * exp_score +
        0.20 * capacity_score
    ) * 100.0

    reasons = []
    if skill_score > 0.7:
        reasons.append(f"Strong skill match ({len(matched_skills)} relevant competencies)")
    if domain_score > 0.6 and matched_domains:
        reasons.append(f"Direct domain interest in {', '.join(matched_domains)}")
    if cand_exp >= 2.5:
        reasons.append(f"Solid experience ({cand_exp} years)")
    if load_headroom > 0.6:
        reasons.append(f"High capacity headroom ({int(load_headroom*100)}% available)")
    if cand_avail != "available":
        reasons.append(f"Status caveat: currently marked as {cand_avail}")

    return {
        "candidate_id": candidate.get("id"),
        "name": candidate.get("name"),
        "role_title": candidate.get("role_title"),
        "score": round(composite_score, 1),
        "skill_score": round(skill_score * 100, 1),
        "domain_score": round(domain_score * 100, 1),
        "experience_score": round(exp_score * 100, 1),
        "capacity_score": round(capacity_score * 100, 1),
        "matched_skills": matched_skills,
        "missing_mandatory": missing_mandatory,
        "matched_domains": matched_domains,
        "reasons": reasons,
        "is_available": cand_avail != "unavailable" and load_headroom > 0.1
    }

def evaluate_team_composition(team: List[Dict[str, Any]], project_reqs: List[Dict[str, Any]], project_domains: List[str]) -> Dict[str, Any]:
    """
    Evaluates synergy, aggregate skill coverage, and workload distribution for a candidate team.
    """
    coverage_matrix = {}
    missing_mandatory = []
    
    # Check coverage for each required skill
    total_coverage_score = 0.0
    for req in project_reqs:
        skill_name = req.get("skill")
        req_min = req.get("min_level", 2)
        is_mand = req.get("mandatory", True)

        best_cand = None
        best_level = 0
        qualified_cands = []

        for cand in team:
            lvl = cand.get("skills", {}).get(skill_name, 0)
            if lvl > 0:
                qualified_cands.append({"name": cand.get("name"), "level": lvl})
            if lvl > best_level:
                best_level = lvl
                best_cand = cand.get("name")

        is_covered = best_level >= req_min
        status = "covered" if is_covered else ("partial" if best_level > 0 else "missing")
        if is_mand and not is_covered:
            missing_mandatory.append(f"{skill_name} (best level: {best_level}/{req_min})")

        coverage_matrix[skill_name] = {
            "required_level": req_min,
            "mandatory": is_mand,
            "best_level": best_level,
            "lead_expert": best_cand or "None",
            "qualified_count": len(qualified_cands),
            "qualified_members": qualified_cands,
            "status": status
        }
        
        weight = 2.0 if is_mand else 1.0
        if is_covered:
            total_coverage_score += weight
        elif best_level > 0:
            total_coverage_score += weight * (best_level / req_min) * 0.7

    max_possible_coverage = sum(2.0 if req.get("mandatory", True) else 1.0 for req in project_reqs)
    skill_coverage_pct = (total_coverage_score / max_possible_coverage * 100) if max_possible_coverage > 0 else 100.0

    # Synergy & diversity (penalize duplicate identical profiles, reward complementary skills)
    unique_skills_set = set()
    for c in team:
        unique_skills_set.update(c.get("skills", {}).keys())
    synergy_score = min(100.0, (len(unique_skills_set) / (len(team) * 2.5)) * 100.0)

    # Workload balance score
    available_capacities = [c.get("weekly_capacity_hours", 40.0) - c.get("current_workload_hours", 0.0) for c in team]
    mean_cap = sum(available_capacities) / max(1, len(available_capacities))
    if len(available_capacities) > 1 and mean_cap > 0:
        variance = sum((c - mean_cap) ** 2 for c in available_capacities) / len(available_capacities)
        cv = math.sqrt(variance) / mean_cap
        workload_balance_score = max(0.0, 100.0 - (cv * 40.0))
    else:
        workload_balance_score = 90.0

    # Total team compatibility score
    # Skill coverage (50%), Individual competency avg (25%), Synergy (15%), Workload Balance (10%)
    individual_matches = [calculate_candidate_match(c, project_reqs, project_domains) for c in team]
    avg_indiv_score = sum(m["score"] for m in individual_matches) / max(1, len(individual_matches))

    # Mandatory penalty
    penalty = 25.0 * len(missing_mandatory)
    final_score = max(5.0, min(100.0, (
        0.50 * skill_coverage_pct +
        0.25 * avg_indiv_score +
        0.15 * synergy_score +
        0.10 * workload_balance_score
    ) - penalty))

    return {
        "team": team,
        "team_size": len(team),
        "compatibility_score": round(final_score, 1),
        "skill_coverage_pct": round(skill_coverage_pct, 1),
        "synergy_score": round(synergy_score, 1),
        "workload_balance_score": round(workload_balance_score, 1),
        "coverage_matrix": coverage_matrix,
        "missing_mandatory": missing_mandatory,
        "individual_matches": individual_matches,
        "is_feasible": len(missing_mandatory) == 0
    }

def recommend_team(all_candidates: List[Dict[str, Any]], project_reqs: List[Dict[str, Any]], project_domains: List[str], target_size: int = 4) -> Dict[str, Any]:
    """
    Finds optimal team of size `target_size` and returns recommendation + transparent breakdown + alternatives.
    """
    if not all_candidates:
        return {"error": "No candidates available for team formation"}

    target_size = min(len(all_candidates), max(1, target_size))

    # Pre-score all candidates
    scored_candidates = []
    for c in all_candidates:
        match_info = calculate_candidate_match(c, project_reqs, project_domains)
        scored_candidates.append({
            "raw": c,
            "match": match_info
        })

    # Sort candidates by match score
    scored_candidates.sort(key=lambda x: (x["match"]["is_available"], x["match"]["score"]), reverse=True)

    # Search top candidate combinations (Combinatorial / Beam search)
    # If pool is small (< 15), evaluate all combinations; otherwise take top 12 candidates
    search_pool = [x["raw"] for x in scored_candidates[:min(14, len(scored_candidates))]]

    best_evaluation = None
    all_evaluated_teams = []

    for combo in itertools.combinations(search_pool, target_size):
        evaluation = evaluate_team_composition(list(combo), project_reqs, project_domains)
        all_evaluated_teams.append(evaluation)
        if best_evaluation is None or evaluation["compatibility_score"] > best_evaluation["compatibility_score"]:
            best_evaluation = evaluation

    # Sort all evaluated combinations to extract runner-ups
    all_evaluated_teams.sort(key=lambda x: x["compatibility_score"], reverse=True)
    
    # Identify alternative candidates not in the recommended team
    recommended_ids = {c["id"] for c in best_evaluation["team"]}
    alternative_candidates = []
    for sc in scored_candidates:
        if sc["raw"]["id"] not in recommended_ids:
            alternative_candidates.append({
                **sc["raw"],
                "match_score": sc["match"]["score"],
                "reasons": sc["match"]["reasons"],
                "missing_mandatory": sc["match"]["missing_mandatory"],
                "matched_skills": sc["match"]["matched_skills"]
            })

    # Generate transparent selection synthesis
    selection_reasons = []
    cov_pct = best_evaluation["skill_coverage_pct"]
    score = best_evaluation["compatibility_score"]

    if cov_pct >= 100:
        selection_reasons.append(f"Complete 100% coverage of all required skill specifications.")
    else:
        selection_reasons.append(f"Achieves {cov_pct}% overall skill coverage with minimal remaining gap.")

    top_roles = [f"{c.get('name')} ({c.get('role_title', 'Eng')})" for c in best_evaluation["team"]]
    selection_reasons.append(f"Balanced cross-functional mix: {', '.join(top_roles)}.")
    
    total_avail_hours = sum(c.get("weekly_capacity_hours", 40) - c.get("current_workload_hours", 0) for c in best_evaluation["team"])
    selection_reasons.append(f"Combined team available bandwidth is {round(total_avail_hours, 1)} hrs/week with healthy workload headroom.")

    return {
        "status": "success",
        "recommended_team": best_evaluation["team"],
        "compatibility_score": best_evaluation["compatibility_score"],
        "skill_coverage_pct": best_evaluation["skill_coverage_pct"],
        "synergy_score": best_evaluation["synergy_score"],
        "workload_balance_score": best_evaluation["workload_balance_score"],
        "coverage_matrix": best_evaluation["coverage_matrix"],
        "missing_mandatory": best_evaluation["missing_mandatory"],
        "individual_breakdowns": best_evaluation["individual_matches"],
        "selection_reasons": selection_reasons,
        "is_feasible": best_evaluation["is_feasible"],
        "alternative_candidates": alternative_candidates[:5],
        "runner_up_teams_count": len(all_evaluated_teams)
    }
