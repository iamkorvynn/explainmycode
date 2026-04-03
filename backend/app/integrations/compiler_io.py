from __future__ import annotations

import httpx

from app.core.config import settings
from app.integrations.execution_utils import looks_like_interactive_input, missing_input_message


LANGUAGE_COMPILERS = {
    "python": "python-3.14",
    "py": "python-3.14",
    "javascript": "typescript-deno",
    "js": "typescript-deno",
    "typescript": "typescript-deno",
    "ts": "typescript-deno",
    "cpp": "g++-15",
    "c++": "g++-15",
    "java": "openjdk-25",
}


class CompilerIOClient:
    provider_name = "compiler-io"

    def run_code(self, source_code: str, language: str, stdin: str | None = None) -> dict | None:
        if not settings.compiler_io_api_key:
            return None

        compiler = LANGUAGE_COMPILERS.get(language.lower())
        if not compiler:
            return None

        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    settings.compiler_io_base_url,
                    headers={
                        "Authorization": settings.compiler_io_api_key,
                        "Content-Type": "application/json",
                    },
                    json={
                        "compiler": compiler,
                        "code": source_code,
                        "input": stdin or "",
                    },
                )
                response.raise_for_status()
        except httpx.HTTPError:
            return None

        payload = response.json()
        stderr = payload.get("error") or None
        if stderr and not stdin and looks_like_interactive_input(source_code, language):
            stderr = missing_input_message()
        return {
            "stdout": payload.get("output"),
            "stderr": stderr,
            "compile_output": None,
            "execution_time_ms": _to_milliseconds(payload.get("total") or payload.get("time")),
            "memory_kb": _to_int(payload.get("memory")),
            "exit_status": payload.get("status") or "completed",
            "provider_job_id": None,
            "provider": self.provider_name,
        }


def _to_milliseconds(value: str | int | float | None) -> int | None:
    if value in (None, ""):
        return None
    try:
        return int(float(value) * 1000)
    except (TypeError, ValueError):
        return None


def _to_int(value: str | int | float | None) -> int | None:
    if value in (None, ""):
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None
