from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.analysis import DashboardResponse
from app.schemas.mentor import CodeRequest
from app.services.dashboard import DashboardAnalysisService

router = APIRouter()


@router.post("/dashboard", response_model=DashboardResponse)
def dashboard(payload: CodeRequest, _: User = Depends(get_current_user)) -> DashboardResponse:
    return DashboardAnalysisService().build_dashboard(payload.code, payload.language)
