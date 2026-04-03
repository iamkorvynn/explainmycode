from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import database_ready
from app.core.rate_limit import redis_available

router = APIRouter()


@router.get("/health")
def health_check() -> dict:
    db_ok = database_ready()
    return {
        "status": "ok" if db_ok else "degraded",
        "service": settings.app_name,
        "environment": settings.environment,
        "llm_mode": settings.llm_mode,
        "database": "ok" if db_ok else "unavailable",
        "redis": "ok" if redis_available() else "unavailable",
    }


@router.get("/health/ready")
def readiness_check() -> JSONResponse:
    db_ok = database_ready()
    status_code = status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if db_ok else "not_ready",
            "database": "ok" if db_ok else "unavailable",
        },
    )
