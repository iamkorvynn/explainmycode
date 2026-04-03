from fastapi import APIRouter

from app.api.v1.analysis import router as analysis_router
from app.api.v1.auth import router as auth_router
from app.api.v1.execution import router as execution_router
from app.api.v1.health import router as health_router
from app.api.v1.mentor import router as mentor_router
from app.api.v1.visualizations import router as visualizations_router
from app.api.v1.workspaces import router as workspaces_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(workspaces_router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(execution_router, prefix="/execution", tags=["execution"])
api_router.include_router(mentor_router, prefix="/mentor", tags=["mentor"])
api_router.include_router(analysis_router, prefix="/analysis", tags=["analysis"])
api_router.include_router(visualizations_router, prefix="/visualizations", tags=["visualizations"])
