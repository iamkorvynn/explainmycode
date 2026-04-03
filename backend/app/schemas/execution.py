from pydantic import BaseModel, Field

from app.schemas.common import APIModel


class RunCodeRequest(BaseModel):
    source_code: str = Field(min_length=1, max_length=30000)
    language: str
    stdin: str | None = None
    filename: str | None = None
    workspace_id: str | None = None


class RunCodeResponse(APIModel):
    execution_id: str
    stdout: str | None = None
    stderr: str | None = None
    compile_output: str | None = None
    execution_time_ms: int | None = None
    memory_kb: int | None = None
    exit_status: str
    provider_job_id: str | None = None
    provider: str
