from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from .common import SkillRequirement

# Projects
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = ""
    target_team_size: int = Field(default=4, ge=1, le=20)
    deadline_days: int = Field(default=30, ge=1, le=365)
    required_skills: List[SkillRequirement] = []
    domains: List[str] = []

class ProjectMemberItem(BaseModel):
    member_id: Optional[str] = None
    candidate_id: Optional[int] = None
    name: str
    email: Optional[str] = ""
    role_in_project: str = "Team Member"
    skills: Dict[str, int] = {}
    match_score: float = 0.0
    match_reasons: List[str] = []
    availability_status: str = "available"
    avatar_color: str = "#2563EB"

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    target_team_size: int
    deadline_days: int
    status: str
    required_skills: List[Dict[str, Any]]
    domains: List[str]
    team_members: List[ProjectMemberItem] = []
    tasks: List[Dict[str, Any]] = []
    schedule_metrics: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None

# Members / Candidates
class MemberCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: Optional[str] = None
    role_title: str = "Software Engineer"
    skills: Dict[str, int] = {} # e.g. {"Python": 4, "React": 3}
    interests: List[str] = []
    experience_years: float = Field(default=1.5, ge=0.0)
    weekly_capacity_hours: float = Field(default=40.0, ge=5.0, le=80.0)
    daily_capacity_hours: float = Field(default=8.0, ge=1.0, le=16.0)
    availability_status: str = "available" # available, partially_available, unavailable
    avatar_color: str = "#2563EB"

class MemberResponse(BaseModel):
    id: int
    name: str
    email: str
    role_title: str
    skills: Dict[str, int]
    interests: List[str]
    experience_years: float
    weekly_capacity_hours: float
    daily_capacity_hours: float
    current_workload_hours: float
    availability_status: str
    avatar_color: str

# Tasks
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = ""
    required_skill: str
    min_skill_level: int = Field(default=2, ge=1, le=5)
    estimated_hours: float = Field(default=16.0, ge=1.0, le=500.0)
    remaining_hours: Optional[float] = None
    priority: str = "medium" # low, medium, high, critical
    status: str = "todo"     # todo, in_progress, completed, blocked
    assigned_candidate_id: Optional[int] = None
    dependencies: List[int] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skill: Optional[str] = None
    min_skill_level: Optional[int] = None
    estimated_hours: Optional[float] = None
    remaining_hours: Optional[float] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_candidate_id: Optional[int] = None
    dependencies: Optional[List[int]] = None

# Team Formation Request
class TeamRecommendRequest(BaseModel):
    project_id: Optional[int] = None
    target_team_size: Optional[int] = 4
    required_skills: Optional[List[Dict[str, Any]]] = None
    domains: Optional[List[str]] = None

class TeamConfirmRequest(BaseModel):
    team_members: List[Dict[str, Any]]

# Crisis Scenarios & Rebalancing
class ScenarioCreate(BaseModel):
    type: str # member_unavailable, deadline_shortened, urgent_task_added, duration_overrun, priority_escalation
    params: Dict[str, Any] = {}

class ProposalActionRequest(BaseModel):
    proposal_id: int
