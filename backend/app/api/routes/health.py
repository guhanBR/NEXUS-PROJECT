"""
Health & Database Diagnostics Endpoints.
"""
from fastapi import APIRouter
from ...database.connection import get_database
from ...schemas.common import HealthResponse, DatabaseHealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(status="healthy", service="RebalanceX Adaptive Project Intelligence", version="1.0.0")

@router.get("/health/database", response_model=DatabaseHealthResponse)
def get_database_health():
    db_mgr = get_database()
    ping_result = db_mgr.ping()
    return DatabaseHealthResponse(
        status=ping_result.get("status", "unknown"),
        database=ping_result.get("database", "rebalancex"),
        ping=ping_result.get("ping"),
        note=ping_result.get("note"),
        error=ping_result.get("error")
    )
