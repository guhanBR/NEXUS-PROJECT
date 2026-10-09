# RebalanceX — Adaptive Project Intelligence

> Integrated Smart Internship Team Formation Engine (#11) + Autonomous Project Resource Rebalancer (#18)

---

## Tech Stack Overview

- **Backend**: Python 3.12, FastAPI, Uvicorn, PyMongo, Pydantic Settings, Pytest
- **Database**: MongoDB Atlas (`rebalancex` database) + Resilient Local Persistence Manager
- **Optimization & Scheduling**: Google OR-Tools CP-SAT, Kahn's DAG Cycle Check, Critical Path Method (CPM), Deterministic Constraint Optimization
- **Frontend**: Single Page Application, Swiss Minimalist Design System, Responsive Workspaces, Interactive Gantt Timeline, Workload Utilization Heatmap, Chart.js

---

## Directory Layout

```text
RebalanceX/
├── frontend/
│   ├── index.html          # Semantic SPA with 8 dynamic workspaces
│   ├── styles.css          # Design tokens, Gantt bars, heatmaps, diff cards
│   └── app.js              # State manager, API client, live demo sequence
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI application entrypoint & lifespan
│   │   ├── config.py       # Pydantic BaseSettings environment loader
│   │   ├── database/
│   │   │   ├── connection.py   # PyMongo client & health ping
│   │   │   └── serializers.py  # ObjectId and datetime serializers
│   │   ├── schemas/        # Pydantic request/response models
│   │   ├── algorithms/
│   │   │   ├── team_formation.py   # PS#11 Multi-objective team selection
│   │   │   ├── scheduler.py        # Critical Path Method (CPM)
│   │   │   ├── rebalancer.py       # PS#18 Autonomous rebalancing solver
│   │   │   ├── constraints.py      # DAG cycle check & eligibility
│   │   │   ├── scoring.py          # Objective weights
│   │   │   └── explainer.py        # Transparent rationale generator
│   │   ├── repositories/   # MongoDB collections & CRUD abstraction
│   │   └── api/
│   │       └── routes/     # FastAPI routers for all endpoints
│   ├── tests/
│   │   └── test_all.py     # Comprehensive Pytest test suite
│   └── requirements.txt
├── data/
│   └── seed/
│       └── demo_data.json  # Hackathon demo dataset
├── docs/
│   ├── architecture.md     # System architecture & data flow
│   ├── algorithm.md        # Mathematical formulations & CPM
│   ├── api-contract.md     # REST API endpoint specification
│   ├── testing.md          # Test suite documentation
│   └── demo-script.md      # Step-by-step presentation script
├── .env.example
├── .gitignore
└── README.md
```

---

## Quickstart & Launch Instructions

### 1. Configure Environment (Optional MongoDB Atlas)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: If `MONGODB_URI` is left unconfigured, RebalanceX automatically operates with its resilient local persistence storage.)*

### 2. Start the Backend Server
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Open the Application
- **UI Web App**: `http://127.0.0.1:8000`
- **Swagger OpenAPI Docs**: `http://127.0.0.1:8000/docs`

### 4. Run Automated Tests
```bash
python -m pytest backend/tests/test_all.py -v
```
