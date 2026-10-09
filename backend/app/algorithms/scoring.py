"""
Scoring Weights and Objective Metric Calculations for RebalanceX.
"""
from typing import Dict, Any

# Multi-Objective Weights for Team Formation
TEAM_FORMATION_WEIGHTS = {
    "skill_coverage": 0.40,
    "skill_proficiency": 0.20,
    "interest_alignment": 0.15,
    "relevant_experience": 0.10,
    "workload_balance": 0.15
}

# Multi-Objective Loss Weights for Resource Rebalancing
REBALANCING_LOSS_WEIGHTS = {
    "deadline_delay": 8.0,        # Heavy penalty per day of delay past target
    "workload_imbalance": 0.40,   # Standard deviation penalty across team
    "churn_penalty": 3.5,         # Penalty for unnecessary reallocations
    "skill_mismatch": 15.0        # Hard penalty for assigning below required level
}
