"""
RebalanceX — Adaptive Project Intelligence
Main FastAPI Application Entrypoint.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os
import logging

from .config import get_settings
from .database.connection import get_database
from .api.routes.health import router as health_router
from .api.routes.projects import router as projects_router
from .api.routes.team_and_members import members_router, team_router
from .api.routes.tasks_and_schedule import tasks_router
from .api.routes.rebalancing_routes import rebalance_router
from .api.routes.demo_routes import demo_router, seed_demo_data
from .repositories.project_repo import project_repo

# Configure logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("rebalancex")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing RebalanceX Backend...")
    db_mgr = get_database()
    db_mgr.connect()
    
    # Auto-seed if projects are empty
    projects = project_repo.list_projects()
    if not projects:
        logger.info("Initializing database with demo seed dataset...")
        seed_demo_data()

    yield

    # Shutdown
    logger.info("Shutting down RebalanceX Backend...")
    db_mgr.close()

settings = get_settings()

app = FastAPI(
    title="RebalanceX API",
    description="Adaptive Project Intelligence & Autonomous Resource Rebalancer",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware - allows all origins (Vercel, Render, local dev, mobile)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health_router)
app.include_router(projects_router)
app.include_router(members_router)
app.include_router(team_router)
app.include_router(tasks_router)
app.include_router(rebalance_router)
app.include_router(demo_router)

# Serve Frontend React build if available
current_dir = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.abspath(os.path.join(current_dir, "..", "..", "frontend", "dist"))
if not os.path.exists(FRONTEND_DIST):
    FRONTEND_DIST = os.path.abspath(os.path.join(current_dir, "..", "..", "Frontend"))

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        clean_path = full_path.lstrip("/")
        if clean_path.startswith("api") or clean_path.startswith("health") or clean_path.startswith("docs") or clean_path.startswith("redoc") or clean_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "RebalanceX API is running. Visit /docs for OpenAPI documentation."}

