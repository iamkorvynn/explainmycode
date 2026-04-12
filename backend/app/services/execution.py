from sqlalchemy.orm import Session

from app.core.config import settings
from app.integrations.compiler_io import CompilerIOClient
from app.integrations.judge0 import Judge0Client
from app.integrations.onecompiler import OneCompilerClient
from app.models.user import User
from app.repositories.execution import ExecutionRepository


class CodeExecutionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ExecutionRepository(db)
        self.onecompiler = OneCompilerClient()
        self.compiler_io = CompilerIOClient()
        self.judge0 = Judge0Client()

    def run_code(self, user: User, source_code: str, language: str, stdin: str | None = None, workspace_id: str | None = None):
        provider_result = None
        for provider in settings.execution_provider_order:
            if provider == "judge0":
                if not self.judge0.is_configured:
                    continue
                provider_result = self.judge0.run_live_code(source_code=source_code, language=language, stdin=stdin)
            elif provider == "onecompiler":
                provider_result = self.onecompiler.run_code(source_code=source_code, language=language, stdin=stdin)
            elif provider == "compiler-io":
                provider_result = self.compiler_io.run_code(source_code=source_code, language=language, stdin=stdin)

            if provider_result:
                break

        if not provider_result:
            provider_result = self.judge0.run_mock(source_code=source_code, language=language)

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
