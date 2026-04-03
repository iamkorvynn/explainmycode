from sqlalchemy.orm import Session

from app.integrations.judge0 import Judge0Client
from app.models.user import User
from app.repositories.execution import ExecutionRepository


class CodeExecutionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ExecutionRepository(db)
        self.client = Judge0Client()

    def run_code(self, user: User, source_code: str, language: str, stdin: str | None = None, workspace_id: str | None = None):
        provider_result = self.client.run_code(source_code=source_code, language=language, stdin=stdin)
        execution = self.repo.create(
            user_id=user.id,
            workspace_id=workspace_id,
            language=language,
            source_code=source_code,
            stdin=stdin,
            stdout=provider_result.get("stdout"),
            stderr=provider_result.get("stderr"),
            compile_output=provider_result.get("compile_output"),
            time_ms=provider_result.get("execution_time_ms"),
            memory_kb=provider_result.get("memory_kb"),
            exit_status=provider_result.get("exit_status", "completed"),
            provider_job_id=provider_result.get("provider_job_id"),
        )
        self.db.commit()
        self.db.refresh(execution)
        return execution, provider_result
