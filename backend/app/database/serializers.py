"""
Database Document Serializers for MongoDB ObjectIds and Timestamps.
Ensures 100% JSON-serializable responses for FastAPI endpoints.
"""
from bson import ObjectId
from datetime import datetime
from typing import Any, Dict, List, Union

def serialize_doc(doc: Any) -> Any:
    """Recursively converts MongoDB ObjectIds and datetimes into JSON-friendly types."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        new_doc = {}
        for k, v in doc.items():
            if k == "_id" and isinstance(v, ObjectId):
                new_doc["id"] = str(v)
                new_doc["_id"] = str(v)
            elif isinstance(v, ObjectId):
                new_doc[k] = str(v)
            elif isinstance(v, datetime):
                new_doc[k] = v.isoformat()
            elif isinstance(v, (dict, list)):
                new_doc[k] = serialize_doc(v)
            else:
                new_doc[k] = v
        return new_doc
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
    return doc
