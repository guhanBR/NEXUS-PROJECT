"""
Project Repository: Handles CRUD operations for Projects and Project Members.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..database.connection import get_database
from ..database.serializers import serialize_doc

class ProjectRepository:
    def __init__(self):
        self.db_mgr = get_database()

    def list_projects(self) -> List[Dict[str, Any]]:
        col = self.db_mgr.get_collection("projects")
        if col is not None:
            docs = list(col.find({}, {"_id": 0}))
            return serialize_doc(docs)
        
        # Local fallback
        projects = list(self.db_mgr._local_store.get("projects", {}).values())
        return serialize_doc(projects)

    def get_by_id(self, project_id: int) -> Optional[Dict[str, Any]]:
        col = self.db_mgr.get_collection("projects")
        if col is not None:
            doc = col.find_one({"id": project_id}, {"_id": 0})
            return serialize_doc(doc)
        
        return serialize_doc(self.db_mgr._local_store.get("projects", {}).get(str(project_id)))

    def save(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        p_id = project_data.get("id")
        if not p_id:
            # Auto-increment id
            existing = self.list_projects()
            p_id = max([p["id"] for p in existing], default=0) + 1
            project_data["id"] = p_id

        if "created_at" not in project_data:
            project_data["created_at"] = datetime.utcnow().isoformat()
        project_data["updated_at"] = datetime.utcnow().isoformat()

        col = self.db_mgr.get_collection("projects")
        if col is not None:
            col.update_one({"id": p_id}, {"$set": project_data}, upsert=True)
        
        self.db_mgr._local_store.setdefault("projects", {})[str(p_id)] = project_data
        self.db_mgr.save_local_cache()
        return serialize_doc(project_data)

    def delete(self, project_id: int) -> bool:
        col = self.db_mgr.get_collection("projects")
        if col is not None:
            col.delete_one({"id": project_id})
        
        if str(project_id) in self.db_mgr._local_store.get("projects", {}):
            del self.db_mgr._local_store["projects"][str(project_id)]
            self.db_mgr.save_local_cache()
            return True
        return False

project_repo = ProjectRepository()
