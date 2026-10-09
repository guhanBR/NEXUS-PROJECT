from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class HealthResponse(BaseModel):
    status: str
    service: str = "RebalanceX Adaptive Project Intelligence"
    version: str = "1.0.0"

class DatabaseHealthResponse(BaseModel):
    status: str
    database: str
    ping: Optional[float] = None
    note: Optional[str] = None
    error: Optional[str] = None

class SkillRequirement(BaseModel):
    skill: str
    min_level: int = Field(default=2, ge=1, le=5)
    mandatory: bool = True
