import re
from urllib.parse import urlparse

import httpx

from app.core.config import settings


LANGUAGE_IDS = {
    "python": 71,
    "javascript": 63,
    "cpp": 54,
    "c++": 54,
    "java": 62,
}


class Judge0Client:
    provider_name = "judge0"

    def run_code(self, source_code: str, language: str, stdin: str | None = None) -> dict:
        if settings.judge0_base_url:
            return self._run_remote(source_code, language, stdin)
        return self._run_mock(source_code, language)

    def _run_remote(self, source_code: str, language: str, stdin: str | None = None) -> dict:
        language_id = LANGUAGE_IDS.get(language.lower(), 71)
        headers = self._auth_headers()
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    f"{settings.judge0_base_url.rstrip('/')}/submissions?base64_encoded=false&wait=true",
                    headers=headers,
                    json={"source_code": source_code, "language_id": language_id, "stdin": stdin or ""},
                )
                response.raise_for_status()
                payload = response.json()
                return {
                    "stdout": payload.get("stdout"),
                    "stderr": payload.get("stderr"),
                    "compile_output": payload.get("compile_output"),
                    "execution_time_ms": int(float(payload.get("time") or 0) * 1000) if payload.get("time") else None,
                    "memory_kb": payload.get("memory"),
                    "exit_status": payload.get("status", {}).get("description", "completed"),
                    "provider_job_id": str(payload.get("token")) if payload.get("token") else None,
                    "provider": self.provider_name,
                }
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            return self._run_mock(source_code, language, f"Judge0 request failed with status {status_code}.")
        except httpx.HTTPError:
            return self._run_mock(source_code, language, "Judge0 request failed because the remote service is unavailable.")

    def _auth_headers(self) -> dict[str, str]:
        if not settings.judge0_api_key:
            return {}

        base_url = settings.judge0_base_url.lower()
        if "rapidapi.com" in base_url:
            host = urlparse(settings.judge0_base_url).netloc
            return {
                "X-RapidAPI-Key": settings.judge0_api_key,
                "X-RapidAPI-Host": host,
            }

        return {"X-Auth-Token": settings.judge0_api_key}

    def _run_mock(self, source_code: str, language: str, reason: str | None = None) -> dict:
        stdout = self._extract_print_output(source_code, language)
        stderr = reason or ("Execution is mocked because Judge0 is not configured." if not stdout else None)
        return {
            "stdout": stdout,
            "stderr": stderr,
            "compile_output": None,
            "execution_time_ms": 12,
            "memory_kb": 2048,
            "exit_status": "completed" if not stderr else "mocked",
            "provider_job_id": None,
            "provider": "mock-judge0",
        }

    def _extract_print_output(self, source_code: str, language: str) -> str | None:
        patterns = {
            "python": r"print\((['\"])(.*?)\1\)",
            "javascript": r"console\.log\((['\"])(.*?)\1\)",
            "java": r"System\.out\.println\((['\"])(.*?)\1\)",
            "cpp": r'cout\s*<<\s*"([^"]+)"',
            "c++": r'cout\s*<<\s*"([^"]+)"',
        }
        pattern = patterns.get(language.lower())
        if not pattern:
            return None
        match = re.search(pattern, source_code)
        if not match:
            return None
        return match.group(2) if len(match.groups()) > 1 else match.group(1)
