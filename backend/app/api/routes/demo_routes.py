"""
Demo Seeding Route for Reproducible Hackathon Demonstrations.
"""
from fastapi import APIRouter
from typing import Dict, Any
import json
import os
from ...repositories.project_repo import project_repo
from ...repositories.entities_repo import member_repo, task_repo, proposal_repo, history_repo
from ...database.connection import get_database

demo_router = APIRouter(prefix="/api/demo", tags=["Demo Seeding"])

def load_seed_json() -> Dict[str, Any]:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    seed_path = os.path.abspath(os.path.join(current_dir, "..", "..", "..", "..", "data", "seed", "demo_data.json"))
    if not os.path.exists(seed_path):
        # Fallback path
        seed_path = os.path.abspath(os.path.join(current_dir, "..", "..", "..", "data", "seed", "demo_data.json"))
    if os.path.exists(seed_path):
        with open(seed_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@demo_router.post("/seed")
def seed_demo_data():
    data = load_seed_json()
    db_mgr = get_database()

    # Clear existing collections if MongoDB is connected
    for col_name in ["projects", "members", "tasks", "rebalancing_proposals", "decision_history"]:
        col = db_mgr.get_collection(col_name)
        if col is not None:
            col.delete_many({})
        db_mgr._local_store[col_name] = {}

    # Seed members
    for m in data.get("members", []):
        member_repo.save(m)

    # Seed projects
    for p in data.get("projects", []):
        project_repo.save(p)

    # Seed tasks
    for t in data.get("tasks", []):
        task_repo.save(t)

    # Seed initial history
    for h in data.get("decision_history", []):
        history_repo.save(h)

    db_mgr.save_local_cache()

    return {
        "status": "success",
        "message": "Demo data successfully seeded. Primary project reset to baseline."
    }
