"""
Member, Task, Proposal, and Decision History Repositories.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..database.connection import get_database
from ..database.serializers import serialize_doc

class MemberRepository:
    def __init__(self):
        self.db_mgr = get_database()

    def list_all(self) -> List[Dict[str, Any]]:
        col = self.db_mgr.get_collection("members")
        if col is not None:
            return serialize_doc(list(col.find({}, {"_id": 0})))
        return serialize_doc(list(self.db_mgr._local_store.get("members", {}).values()))

    def get_by_id(self, member_id: int) -> Optional[Dict[str, Any]]:
        col = self.db_mgr.get_collection("members")
        if col is not None:
            return serialize_doc(col.find_one({"id": member_id}, {"_id": 0}))
        return serialize_doc(self.db_mgr._local_store.get("members", {}).get(str(member_id)))

    def save(self, member_data: Dict[str, Any]) -> Dict[str, Any]:
        m_id = member_data.get("id")
        if not m_id:
            existing = self.list_all()
            m_id = max([m["id"] for m in existing], default=0) + 1
            member_data["id"] = m_id

        col = self.db_mgr.get_collection("members")
        if col is not None:
            col.update_one({"id": m_id}, {"$set": member_data}, upsert=True)
        
        self.db_mgr._local_store.setdefault("members", {})[str(m_id)] = member_data
        self.db_mgr.save_local_cache()
        return serialize_doc(member_data)


class TaskRepository:
    def __init__(self):
        self.db_mgr = get_database()

    def list_by_project(self, project_id: int) -> List[Dict[str, Any]]:
        col = self.db_mgr.get_collection("tasks")
        if col is not None:
            return serialize_doc(list(col.find({"project_id": project_id}, {"_id": 0})))
        
        all_tasks = list(self.db_mgr._local_store.get("tasks", {}).values())
        return serialize_doc([t for t in all_tasks if t.get("project_id") == project_id])

    def get_by_id(self, task_id: int) -> Optional[Dict[str, Any]]:
        col = self.db_mgr.get_collection("tasks")
        if col is not None:
            return serialize_doc(col.find_one({"id": task_id}, {"_id": 0}))
        return serialize_doc(self.db_mgr._local_store.get("tasks", {}).get(str(task_id)))

    def save(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        t_id = task_data.get("id")
        if not t_id:
            col = self.db_mgr.get_collection("tasks")
            if col is not None:
                existing = list(col.find({}, {"_id": 0, "id": 1}))
            else:
                existing = list(self.db_mgr._local_store.get("tasks", {}).values())
            t_id = max([t.get("id", 0) for t in existing], default=0) + 1
            task_data["id"] = t_id

        col = self.db_mgr.get_collection("tasks")
        if col is not None:
            col.update_one({"id": t_id}, {"$set": task_data}, upsert=True)
        
        self.db_mgr._local_store.setdefault("tasks", {})[str(t_id)] = task_data
        self.db_mgr.save_local_cache()
        return serialize_doc(task_data)

    def delete(self, task_id: int) -> bool:
        col = self.db_mgr.get_collection("tasks")
        if col is not None:
            col.delete_one({"id": task_id})
        
        if str(task_id) in self.db_mgr._local_store.get("tasks", {}):
            del self.db_mgr._local_store["tasks"][str(task_id)]
            self.db_mgr.save_local_cache()
            return True
        return False


class ProposalRepository:
    def __init__(self):
        self.db_mgr = get_database()

    def get_by_id(self, proposal_id: int) -> Optional[Dict[str, Any]]:
        col = self.db_mgr.get_collection("rebalancing_proposals")
        if col is not None:
            return serialize_doc(col.find_one({"id": proposal_id}, {"_id": 0}))
        return serialize_doc(self.db_mgr._local_store.get("rebalancing_proposals", {}).get(str(proposal_id)))

    def save(self, proposal_data: Dict[str, Any]) -> Dict[str, Any]:
        p_id = proposal_data.get("id")
        if not p_id:
            existing = list(self.db_mgr._local_store.get("rebalancing_proposals", {}).values())
            p_id = max([p.get("id", 0) for p in existing], default=0) + 1
            proposal_data["id"] = p_id

        if "created_at" not in proposal_data:
            proposal_data["created_at"] = datetime.utcnow().isoformat()

        col = self.db_mgr.get_collection("rebalancing_proposals")
        if col is not None:
            col.update_one({"id": p_id}, {"$set": proposal_data}, upsert=True)
        
        self.db_mgr._local_store.setdefault("rebalancing_proposals", {})[str(p_id)] = proposal_data
        self.db_mgr.save_local_cache()
        return serialize_doc(proposal_data)


class DecisionHistoryRepository:
    def __init__(self):
        self.db_mgr = get_database()

    def list_by_project(self, project_id: int) -> List[Dict[str, Any]]:
        col = self.db_mgr.get_collection("decision_history")
        if col is not None:
            docs = list(col.find({"project_id": project_id}, {"_id": 0}).sort("timestamp", -1))
            return serialize_doc(docs)
        
        all_logs = list(self.db_mgr._local_store.get("decision_history", {}).values())
        filtered = [l for l in all_logs if l.get("project_id") == project_id]
        filtered.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return serialize_doc(filtered)

    def save(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        l_id = log_data.get("id")
        if not l_id:
            existing = list(self.db_mgr._local_store.get("decision_history", {}).values())
            l_id = max([l.get("id", 0) for l in existing], default=0) + 1
            log_data["id"] = l_id

        if "timestamp" not in log_data:
            log_data["timestamp"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

        col = self.db_mgr.get_collection("decision_history")
        if col is not None:
            col.update_one({"id": l_id}, {"$set": log_data}, upsert=True)
        
        self.db_mgr._local_store.setdefault("decision_history", {})[str(l_id)] = log_data
        self.db_mgr.save_local_cache()
        return serialize_doc(log_data)

member_repo = MemberRepository()
task_repo = TaskRepository()
proposal_repo = ProposalRepository()
history_repo = DecisionHistoryRepository()
