from __future__ import annotations

import httpx

from app.core.config import settings
from app.integrations.execution_utils import looks_like_interactive_input, missing_input_message


LANGUAGE_CONFIG = {
    "python": {"language": "python", "filename": "main.py"},
    "py": {"language": "python", "filename": "main.py"},
    "javascript": {"language": "javascript", "filename": "main.js"},
    "js": {"language": "javascript", "filename": "main.js"},
    "typescript": {"language": "typescript", "filename": "main.ts"},
    "ts": {"language": "typescript", "filename": "main.ts"},
    "cpp": {"language": "cpp", "filename": "main.cpp"},
    "c++": {"language": "cpp", "filename": "main.cpp"},
    "java": {"language": "java", "filename": "Main.java"},
}


class OneCompilerClient:
    provider_name = "onecompiler"

    def run_code(self, source_code: str, language: str, stdin: str | None = None) -> dict | None:
        if not settings.onecompiler_api_key:
            return None

        language_config = LANGUAGE_CONFIG.get(language.lower())
        if not language_config:
            return None

        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    settings.onecompiler_base_url,
                    headers={
                        "X-API-Key": settings.onecompiler_api_key,
                        "Content-Type": "application/json",
                    },
                    json={
                        "language": language_config["language"],
                        "stdin": stdin or "",
                        "files": [
                            {
                                "name": language_config["filename"],
                                "content": source_code,
                            }
                        ],
                    },
                )
                response.raise_for_status()
        except httpx.HTTPError:
            return None

        payload = response.json()
        if payload.get("status") == "failed":
            return None

        error_text = payload.get("error")
        exception_text = payload.get("exception")
        stderr = payload.get("stderr")
        compile_output = exception_text or error_text or None
        exit_status = "success"
        timeout_text = " ".join([part for part in (error_text, exception_text) if part]).lower()
        if "timed out" in timeout_text or "time limit exceeded" in timeout_text:
            exit_status = "timeout"
            if not stdin and looks_like_interactive_input(source_code, language):
                stderr = missing_input_message()
                compile_output = exception_text or error_text or compile_output
        elif stderr or exception_text:
            exit_status = "error"

        return {
            "stdout": payload.get("stdout"),
            "stderr": stderr,
            "compile_output": compile_output,
            "execution_time_ms": _to_int(payload.get("executionTime")),
            "memory_kb": _to_int(payload.get("memoryUsed")),
            "exit_status": exit_status,
            "provider_job_id": None,
            "provider": self.provider_name,
        }


def _to_int(value: str | int | float | None) -> int | None:
    if value in (None, ""):
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None
