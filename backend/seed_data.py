"""
Development Seed Data for RebalanceX.
Provides rich, realistic datasets for reproducible Hackathon demonstrations.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .models import Project, Candidate, ProjectMember, Task, DecisionLog, RebalanceProposal
from .database import Base, engine
import json

CANDIDATES_SEED = [
    {
        "id": 1,
        "name": "Alex Morgan",
        "email": "alex.morgan@rebalancex.io",
        "role_title": "Full-Stack Engineer",
        "skills": {"Python": 5, "React": 4, "PostgreSQL": 4, "Docker": 3, "CyberSecurity": 2},
        "interests": ["FinTech", "API Design", "Distributed Systems"],
        "experience_years": 3.5,
        "weekly_capacity_hours": 40.0,
        "daily_capacity_hours": 8.0,
        "current_workload_hours": 0.0,
        "availability_status": "available",
        "avatar_color": "#2563EB"
    },
    {
        "id": 2,
        "name": "Priya Sharma",
        "email": "priya.sharma@rebalancex.io",
        "role_title": "Backend Systems Architect",
        "skills": {"Python": 5, "PostgreSQL": 5, "Docker": 4, "CyberSecurity": 3, "React": 1},
        "interests": ["FinTech", "High-Throughput Databases", "Microservices"],
        "experience_years": 4.0,
        "weekly_capacity_hours": 40.0,
        "daily_capacity_hours": 8.0,
        "current_workload_hours": 0.0,
        "availability_status": "available",
        "avatar_color": "#0D9488"
    },
    {
        "id": 3,
        "name": "Marcus Chen",
        "email": "marcus.chen@rebalancex.io",
        "role_title": "Senior Frontend Engineer",
        "skills": {"React": 5, "TypeScript": 4, "UI/UX": 4, "Python": 2, "Docker": 1},
        "interests": ["FinTech", "Design Systems", "Real-time Dashboards"],
        "experience_years": 3.0,
        "weekly_capacity_hours": 40.0,
        "daily_capacity_hours": 8.0,
        "current_workload_hours": 0.0,
        "availability_status": "available",
        "avatar_color": "#7C3AED"
    },
    {
        "id": 4,
        "name": "Elena Rostova",
        "email": "elena.rostova@rebalancex.io",
        "role_title": "DevOps & Cloud Engineer",
        "skills": {"Docker": 5, "CyberSecurity": 4, "Python": 3, "PostgreSQL": 3, "React": 1},
        "interests": ["FinTech", "Cloud Infrastructure", "CI/CD Automation"],
        "experience_years": 3.2,
        "weekly_capacity_hours": 40.0,
        "daily_capacity_hours": 8.0,
        "current_workload_hours": 0.0,
        "availability_status": "available",
        "avatar_color": "#D97706"
    },
    {
        "id": 5,
        "name": "Sarah Jenkins",
        "email": "sarah.jenkins@rebalancex.io",
        "role_title": "Security & Compliance Lead",
        "skills": {"CyberSecurity": 5, "PostgreSQL": 3, "Python": 3, "Docker": 2, "React": 1},
        "interests": ["FinTech", "PCI-DSS", "Threat Modeling"],
        "experience_years": 3.8,
        "weekly_capacity_hours": 40.0,
        "daily_capacity_hours": 8.0,
        "current_workload_hours": 0.0,
        "availability_status": "available",
        "avatar_color": "#DC2626"
    },
    {
        "id": 6,
        "name": "Devon Patel",
        "email": "devon.patel@rebalancex.io",
        "role_title": "Junior Backend Developer",
        "skills": {"Python": 3, "PostgreSQL": 2, "React": 2, "Docker": 1},
        "interests": ["FinTech", "API Development"],
        "experience_years": 1.2,
        "weekly_capacity_hours": 35.0,
        "daily_capacity_hours": 7.0,
        "current_workload_hours": 0.0,
        "availability_status": "available",
        "avatar_color": "#059669"
    },
    {
        "id": 7,
        "name": "Liam Vance",
        "email": "liam.vance@rebalancex.io",
        "role_title": "QA Automation Engineer",
        "skills": {"Python": 3, "React": 2, "Docker": 2, "Testing": 4},
        "interests": ["FinTech", "Automated Testing", "CI/CD"],
        "experience_years": 2.0,
        "weekly_capacity_hours": 40.0,
        "daily_capacity_hours": 8.0,
        "current_workload_hours": 0.0,
        "availability_status": "available",
        "avatar_color": "#475569"
    },
    {
        "id": 8,
        "name": "Chloe Dubois",
        "email": "chloe.dubois@rebalancex.io",
        "role_title": "Mobile & Frontend Engineer",
        "skills": {"React": 4, "UI/UX": 4, "Python": 1, "Docker": 1},
        "interests": ["Design Systems", "Mobile Apps"],
        "experience_years": 1.8,
        "weekly_capacity_hours": 30.0,
        "daily_capacity_hours": 6.0,
        "current_workload_hours": 0.0,
        "availability_status": "available",
        "avatar_color": "#E11D48"
    }
]

PROJECTS_SEED = [
    {
        "id": 1,
        "name": "FinTech Quantum Core Alpha",
        "description": "Enterprise-grade high-throughput payment transaction engine with real-time fraud scoring and PCI-DSS certification.",
        "target_team_size": 4,
        "deadline_days": 25,
        "status": "active",
        "required_skills": [
            {"skill": "Python", "min_level": 3, "mandatory": True},
            {"skill": "PostgreSQL", "min_level": 3, "mandatory": True},
            {"skill": "React", "min_level": 3, "mandatory": True},
            {"skill": "Docker", "min_level": 2, "mandatory": True},
            {"skill": "CyberSecurity", "min_level": 3, "mandatory": False}
        ],
        "domains": ["FinTech", "Distributed Systems", "Microservices"]
    }
]

TASKS_SEED = [
    {
        "id": 1,
        "project_id": 1,
        "title": "System Threat Model & Architecture Spec",
        "description": "Define data flow boundaries, tokenization vault architecture, and encryption standards.",
        "required_skill": "CyberSecurity",
        "min_skill_level": 3,
        "estimated_hours": 24.0,
        "remaining_hours": 24.0,
        "priority": "high",
        "status": "completed",
        "assigned_candidate_id": 4, # Elena
        "start_day": 0.0,
        "end_day": 3.0,
        "deadline_day": 5.0,
        "is_critical_path": True,
        "dependencies": []
    },
    {
        "id": 2,
        "project_id": 1,
        "title": "PostgreSQL Ledger Schema & Partitioning",
        "description": "Design double-entry ledger database schema, idempotency keys, and migration scripts.",
        "required_skill": "PostgreSQL",
        "min_skill_level": 4,
        "estimated_hours": 32.0,
        "remaining_hours": 32.0,
        "priority": "critical",
        "status": "in_progress",
        "assigned_candidate_id": 2, # Priya (Backend Lead)
        "start_day": 3.0,
        "end_day": 7.0,
        "deadline_day": 9.0,
        "is_critical_path": True,
        "dependencies": [1]
    },
    {
        "id": 3,
        "project_id": 1,
        "title": "Payment Processing API & Webhooks",
        "description": "Build asynchronous transaction ingestion pipeline with HMAC signature verification.",
        "required_skill": "Python",
        "min_skill_level": 4,
        "estimated_hours": 40.0,
        "remaining_hours": 40.0,
        "priority": "critical",
        "status": "todo",
        "assigned_candidate_id": 2, # Priya (Backend Lead) - Key target for crisis disruption demo!
        "start_day": 7.0,
        "end_day": 12.0,
        "deadline_day": 14.0,
        "is_critical_path": True,
        "dependencies": [2]
    },
    {
        "id": 4,
        "project_id": 1,
        "title": "Real-time Fraud Detection Engine",
        "description": "Rule-based velocity filter and anomaly detection for credit authorization.",
        "required_skill": "Python",
        "min_skill_level": 3,
        "estimated_hours": 32.0,
        "remaining_hours": 32.0,
        "priority": "high",
        "status": "todo",
        "assigned_candidate_id": 1, # Alex Morgan
        "start_day": 7.0,
        "end_day": 11.0,
        "deadline_day": 15.0,
        "is_critical_path": False,
        "dependencies": [2]
    },
    {
        "id": 5,
        "project_id": 1,
        "title": "Merchant Settlement Dashboard UI",
        "description": "React-based analytics dashboard with responsive transaction tables and payout status.",
        "required_skill": "React",
        "min_skill_level": 3,
        "estimated_hours": 32.0,
        "remaining_hours": 32.0,
        "priority": "medium",
        "status": "todo",
        "assigned_candidate_id": 3, # Marcus Chen
        "start_day": 0.0,
        "end_day": 4.0,
        "deadline_day": 12.0,
        "is_critical_path": False,
        "dependencies": []
    },
    {
        "id": 6,
        "project_id": 1,
        "title": "Frontend API Client & State Management",
        "description": "Connect UI components with payment gateway REST endpoints, query caching, and live webhooks.",
        "required_skill": "React",
        "min_skill_level": 3,
        "estimated_hours": 24.0,
        "remaining_hours": 24.0,
        "priority": "high",
        "status": "todo",
        "assigned_candidate_id": 3, # Marcus Chen
        "start_day": 12.0,
        "end_day": 15.0,
        "deadline_day": 18.0,
        "is_critical_path": True,
        "dependencies": [3, 5]
    },
    {
        "id": 7,
        "project_id": 1,
        "title": "Container Orchestration & CI/CD Pipeline",
        "description": "Docker multi-stage builds, automated linting, security scanning, and staging deployments.",
        "required_skill": "Docker",
        "min_skill_level": 3,
        "estimated_hours": 24.0,
        "remaining_hours": 24.0,
        "priority": "high",
        "status": "todo",
        "assigned_candidate_id": 4, # Elena Rostova
        "start_day": 12.0,
        "end_day": 15.0,
        "deadline_day": 19.0,
        "is_critical_path": False,
        "dependencies": [3, 4]
    },
    {
        "id": 8,
        "project_id": 1,
        "title": "PCI-DSS Security Audit & Verification",
        "description": "Final end-to-end vulnerability scanning, penetration testing, and compliance checklist signoff.",
        "required_skill": "CyberSecurity",
        "min_skill_level": 3,
        "estimated_hours": 24.0,
        "remaining_hours": 24.0,
        "priority": "critical",
        "status": "todo",
        "assigned_candidate_id": 4, # Elena Rostova
        "start_day": 15.0,
        "end_day": 18.0,
        "deadline_day": 22.0,
        "is_critical_path": True,
        "dependencies": [6, 7]
    }
]

def seed_database(db: Session):
    # Recreate tables cleanly
    Base.metadata.create_all(bind=engine)

    # Clear existing
    db.query(DecisionLog).delete()
    db.query(RebalanceProposal).delete()
    db.query(Task).delete()
    db.query(ProjectMember).delete()
    db.query(Candidate).delete()
    db.query(Project).delete()
    db.commit()

    # Seed candidates
    for c_data in CANDIDATES_SEED:
        cand = Candidate(
            id=c_data["id"],
            name=c_data["name"],
            email=c_data["email"],
            role_title=c_data["role_title"],
            skills=c_data["skills"],
            interests=c_data["interests"],
            experience_years=c_data["experience_years"],
            weekly_capacity_hours=c_data["weekly_capacity_hours"],
            daily_capacity_hours=c_data["daily_capacity_hours"],
            current_workload_hours=c_data["current_workload_hours"],
            availability_status=c_data["availability_status"],
            avatar_color=c_data["avatar_color"]
        )
        db.add(cand)

    # Seed projects
    for p_data in PROJECTS_SEED:
        proj = Project(
            id=p_data["id"],
            name=p_data["name"],
            description=p_data["description"],
            target_team_size=p_data["target_team_size"],
            deadline_days=p_data["deadline_days"],
            status=p_data["status"],
            required_skills=p_data["required_skills"],
            domains=p_data["domains"]
        )
        db.add(proj)

    db.commit()

    # Seed team members for Project 1 (Alex, Priya, Marcus, Elena)
    team_members = [
        {"cid": 1, "role": "Full-Stack Engineer", "score": 94.5, "reasons": ["Python L5 & React L4", "Strong FinTech background", "Available capacity"]},
        {"cid": 2, "role": "Backend Lead", "score": 98.2, "reasons": ["PostgreSQL L5 & Python L5", "Lead database architect", "High experience"]},
        {"cid": 3, "role": "Frontend Specialist", "score": 92.0, "reasons": ["React L5 & UI/UX L4", "Dashboard domain alignment"]},
        {"cid": 4, "role": "DevOps & Security", "score": 91.8, "reasons": ["Docker L5 & CyberSecurity L4", "Infrastructure expertise"]}
    ]
    for tm in team_members:
        pm = ProjectMember(
            project_id=1,
            candidate_id=tm["cid"],
            role_in_project=tm["role"],
            assigned_capacity_hours=40.0,
            match_score=tm["score"],
            match_reasons=tm["reasons"]
        )
        db.add(pm)

    # Seed tasks
    for t_data in TASKS_SEED:
        t = Task(
            id=t_data["id"],
            project_id=t_data["project_id"],
            title=t_data["title"],
            description=t_data["description"],
            required_skill=t_data["required_skill"],
            min_skill_level=t_data["min_skill_level"],
            estimated_hours=t_data["estimated_hours"],
            remaining_hours=t_data["remaining_hours"],
            priority=t_data["priority"],
            status=t_data["status"],
            assigned_candidate_id=t_data["assigned_candidate_id"],
            start_day=t_data["start_day"],
            end_day=t_data["end_day"],
            deadline_day=t_data["deadline_day"],
            is_critical_path=t_data["is_critical_path"],
            dependencies=t_data["dependencies"]
        )
        db.add(t)

    # Seed initial decision audit log
    init_log = DecisionLog(
        project_id=1,
        event_title="Initial Project Baseline Established",
        action_taken="APPROVED",
        summary="Automated CPM schedule baseline computed. 8 tasks scheduled across 4 selected team members with 18.0 days makespan against a 25.0 day deadline.",
        affected_tasks_count=8,
        details_json=json.dumps({
            "project_name": "FinTech Quantum Core Alpha",
            "team_size": 4,
            "makespan_days": 18.0,
            "slack_buffer_days": 7.0
        })
    )
    db.add(init_log)
    db.commit()
    print("Database seeded successfully with FinTech Quantum Core Alpha!")
