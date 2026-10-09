"""
MongoDB Atlas Connection Manager with PyMongo.
Handles connection pooling, index setup, health checks, and safe local storage fallback.
"""
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from typing import Optional, Dict, Any
import logging
import json
import os
from ..config import get_settings

logger = logging.getLogger("rebalancex.database")

class DatabaseManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self.is_connected = False
        self.connection_error: Optional[str] = None
        self._local_store: Dict[str, Dict[str, Any]] = {
            "projects": {},
            "members": {},
            "team_recommendations": {},
            "tasks": {},
            "assignments": {},
            "scenarios": {},
            "rebalancing_proposals": {},
            "decision_history": {}
        }
        self._load_local_cache()

    def connect(self):
        settings = get_settings()
        uri = settings.MONGODB_URI

        # Check if valid Atlas URI is configured
        if uri and ("mongodb+srv://" in uri or "mongodb://" in uri) and "<username>" not in uri:
            try:
                logger.info("Connecting to MongoDB Atlas...")
                import certifi
                self.client = MongoClient(
                    uri,
                    tlsCAFile=certifi.where(),
                    serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_MS,
                    connectTimeoutMS=settings.MONGODB_TIMEOUT_MS,
                    retryWrites=True,
                    w="majority"
                )

                # Verify connection with ping command
                self.client.admin.command('ping')
                self.db = self.client[settings.DATABASE_NAME]
                self.is_connected = True
                self.connection_error = None
                self._setup_indexes()
                logger.info(f"Successfully connected to MongoDB Atlas database: '{settings.DATABASE_NAME}'")
            except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
                self.is_connected = False
                self.connection_error = str(e)
                logger.warning(f"MongoDB Atlas connection unverified: {e}. Using resilient local store.")
        else:
            self.is_connected = False
            self.connection_error = "MONGODB_URI not configured or contains placeholder."
            logger.info("MongoDB Atlas URI not configured yet. Operating in local memory/file persistence mode.")

    def _setup_indexes(self):
        if self.db is not None:
            try:
                self.db.projects.create_index([("id", ASCENDING)], unique=True, sparse=True)
                self.db.members.create_index([("email", ASCENDING)], unique=True, sparse=True)
                self.db.tasks.create_index([("project_id", ASCENDING), ("id", ASCENDING)])
                self.db.rebalancing_proposals.create_index([("project_id", ASCENDING), ("status", ASCENDING)])
                self.db.decision_history.create_index([("project_id", ASCENDING), ("timestamp", DESCENDING)])
                logger.info("MongoDB collection indexes initialized successfully.")
            except Exception as e:
                logger.warning(f"Index creation caveat: {e}")

    def ping(self) -> Dict[str, Any]:
        if self.client and self.is_connected:
            try:
                res = self.client.admin.command('ping')
                return {"status": "connected", "database": get_settings().DATABASE_NAME, "ping": res.get("ok", 1.0)}
            except Exception as e:
                return {"status": "error", "error": str(e)}
        return {
            "status": "local_fallback_active",
            "database": get_settings().DATABASE_NAME,
            "note": "Atlas URI not configured. Active with local store.",
            "error": self.connection_error
        }

    def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB Atlas connection closed.")

    # Local Persistence Cache Helper for Out-of-the-box reliability
    def _get_cache_path(self):
        db_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(db_dir, "local_data_store.json")

    def _load_local_cache(self):
        path = self._get_cache_path()
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    self._local_store = json.load(f)
            except:
                pass

    def save_local_cache(self):
        path = self._get_cache_path()
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(self._local_store, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving local cache: {e}")

    def get_collection(self, name: str):
        if self.is_connected and self.db is not None:
            return self.db[name]
        return None

db_manager = DatabaseManager()

def get_database() -> DatabaseManager:
    return db_manager
