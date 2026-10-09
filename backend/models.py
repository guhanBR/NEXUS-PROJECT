from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from .database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    target_team_size = Column(Integer, default=4)
    deadline_days = Column(Integer, default=30)
    required_skills_json = Column(Text, default="[]")  # list of {"skill": "Python", "min_level": 3, "mandatory": true}
    domains_json = Column(Text, default="[]")  # list of strings
    status = Column(String(50), default="planning") # planning, active, rebalancing, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    team_members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    decision_logs = relationship("DecisionLog", back_populates="project", cascade="all, delete-orphan")
    proposals = relationship("RebalanceProposal", back_populates="project", cascade="all, delete-orphan")

    @property
    def required_skills(self):
        try:
            return json.loads(self.required_skills_json or "[]")
        except:
            return []

    @required_skills.setter
    def required_skills(self, value):
        self.required_skills_json = json.dumps(value)

    @property
    def domains(self):
        try:
            return json.loads(self.domains_json or "[]")
        except:
            return []

    @domains.setter
    def domains(self, value):
        self.domains_json = json.dumps(value)


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True)
    role_title = Column(String(100), default="Software Engineer")
    skills_json = Column(Text, default="{}")  # {"Python": 4, "React": 3, "Docker": 2}
    interests_json = Column(Text, default="[]")  # ["FinTech", "AI", "Cloud"]
    experience_years = Column(Float, default=1.0)
    weekly_capacity_hours = Column(Float, default=40.0)
    daily_capacity_hours = Column(Float, default=8.0)
    current_workload_hours = Column(Float, default=0.0)
    availability_status = Column(String(50), default="available") # available, partially_available, unavailable
    avatar_color = Column(String(20), default="#3B82F6")

    @property
    def skills(self):
        try:
            return json.loads(self.skills_json or "{}")
        except:
            return {}

    @skills.setter
    def skills(self, value):
        self.skills_json = json.dumps(value)

    @property
    def interests(self):
        try:
            return json.loads(self.interests_json or "[]")
        except:
            return []

    @interests.setter
    def interests(self, value):
        self.interests_json = json.dumps(value)


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    role_in_project = Column(String(100), default="Team Member")
    assigned_capacity_hours = Column(Float, default=40.0)
    match_score = Column(Float, default=0.0)
    match_reasons_json = Column(Text, default="[]")
    joined_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="team_members")
    candidate = relationship("Candidate")

    @property
    def match_reasons(self):
        try:
            return json.loads(self.match_reasons_json or "[]")
        except:
            return []

    @match_reasons.setter
    def match_reasons(self, value):
        self.match_reasons_json = json.dumps(value)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    required_skill = Column(String(100), nullable=False)
    min_skill_level = Column(Integer, default=2)
    estimated_hours = Column(Float, default=16.0)
    remaining_hours = Column(Float, default=16.0)
    priority = Column(String(20), default="medium")  # low, medium, high, critical
    status = Column(String(30), default="todo")      # todo, in_progress, blocked, completed
    assigned_candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=True)

    # Schedule parameters (computed by CPM engine)
    start_day = Column(Float, default=0.0)
    end_day = Column(Float, default=2.0)
    deadline_day = Column(Float, default=10.0)
    is_critical_path = Column(Boolean, default=False)
    slack_days = Column(Float, default=0.0)
    dependencies_json = Column(Text, default="[]")  # list of task_ids

    project = relationship("Project", back_populates="tasks")
    assigned_candidate = relationship("Candidate")

    @property
    def dependencies(self):
        try:
            return json.loads(self.dependencies_json or "[]")
        except:
            return []

    @dependencies.setter
    def dependencies(self, value):
        self.dependencies_json = json.dumps(value)


class RebalanceProposal(Base):
    __tablename__ = "rebalance_proposals"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    trigger_type = Column(String(100), nullable=False) # member_unavailable, deadline_shortened, urgent_task_added, duration_overrun, priority_escalation
    scenario_details_json = Column(Text, default="{}")
    solver_status = Column(String(50), default="optimal") # optimal, feasible, infeasible, best_effort
    objective_score = Column(Float, default=0.0)
    original_plan_json = Column(Text, default="{}")
    proposed_plan_json = Column(Text, default="{}")
    diff_summary_json = Column(Text, default="{}")
    explanations_json = Column(Text, default="[]")
    risks_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(30), default="pending") # pending, approved, rejected

    project = relationship("Project", back_populates="proposals")


class DecisionLog(Base):
    __tablename__ = "decision_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    proposal_id = Column(Integer, ForeignKey("rebalance_proposals.id"), nullable=True)
    event_title = Column(String(200), nullable=False)
    action_taken = Column(String(50), nullable=False) # APPROVED, REJECTED, AUTO_MITIGATED, MANUAL_OVERRIDE
    summary = Column(Text, default="")
    affected_tasks_count = Column(Integer, default=0)
    details_json = Column(Text, default="{}")
    timestamp = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="decision_logs")
