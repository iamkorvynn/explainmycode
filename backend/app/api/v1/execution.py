from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.execution import RunCodeRequest, RunCodeResponse
from app.services.execution import CodeExecutionService

router = APIRouter()


@router.post("/run", response_model=RunCodeResponse)
def run_code(
    payload: RunCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RunCodeResponse:
    execution, provider_result = CodeExecutionService(db).run_code(
        current_user,
        payload.source_code,
        payload.language,
        payload.stdin,
        payload.workspace_id,
    )
    return RunCodeResponse(
        execution_id=execution.id,
        stdout=provider_result.get("stdout"),
        stderr=provider_result.get("stderr"),
        compile_output=provider_result.get("compile_output"),
        execution_time_ms=provider_result.get("execution_time_ms"),
        memory_kb=provider_result.get("memory_kb"),
        exit_status=provider_result.get("exit_status"),
        provider_job_id=provider_result.get("provider_job_id"),
        provider=provider_result.get("provider"),
    )
