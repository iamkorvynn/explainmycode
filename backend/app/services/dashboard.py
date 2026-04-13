from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.core.exceptions import AppException
from app.prompts.dashboard import DASHBOARD_ANALYSIS_PROMPT, build_dashboard_prompt
from app.schemas.analysis import DashboardResponse
from app.services.analysis_utils import (
    complexity_metrics,
    detected_algorithms,
    detect_language,
    documentation_status,
    function_count,
    non_empty_lines,
    quality_score,
    style_summary,
    suggestions,
)
from app.services.live_llm import LiveLLMClient


class DashboardAnalysisService:
    def __init__(self):
        self.live_llm = LiveLLMClient()

    def build_dashboard(self, code: str, language: str) -> DashboardResponse:
        resolved_language = detect_language(code, language)
        algorithms = detected_algorithms(code)
        metrics = complexity_metrics(code)
        line_count = len(non_empty_lines(code))
        time_complexity = algorithms[0]["complexity"] if algorithms else "O(n)"
        space_complexity = "O(1)" if "recurs" not in code.lower() else "O(n)"

        base_response = DashboardResponse(
            metrics={
                "total_lines": line_count,
                "functions": function_count(code),
                "algorithms": len(algorithms),
                "quality_score": quality_score(code),
            },
            summary={
                "primary_language": resolved_language,
                "code_style": style_summary(resolved_language, code),
                "documentation_status": documentation_status(code),
            },
            detected_algorithms=algorithms,
            complexity={"time": time_complexity, "space": space_complexity, "metrics": metrics},
            suggestions=suggestions(code),
            provider="builtin",
        )

        if not settings.allow_mock_fallbacks:
            self.live_llm.ensure_live_support()

        payload, provider = self.live_llm.generate_json(
            preferred="claude",
            system_prompt=DASHBOARD_ANALYSIS_PROMPT,
            user_prompt=build_dashboard_prompt(resolved_language, code, base_response.model_dump()),
        )
        if not payload:
            if settings.allow_mock_fallbacks:
                return base_response
            raise AppException(
                "Live AI dashboard analysis is unavailable. Check your provider credentials and model access.",
                status_code=503,
                code="live_ai_provider_unavailable",
            )

        summary = self._sanitize_summary(payload.get("summary"), base_response.summary.model_dump())
        detected = self._sanitize_algorithms(
            payload.get("detected_algorithms"),
            [item.model_dump() for item in base_response.detected_algorithms],
        )
        complexity = self._sanitize_complexity(payload.get("complexity"), base_response.complexity.model_dump())
        tips = self._sanitize_suggestions(payload.get("suggestions"), [item.model_dump() for item in base_response.suggestions])

        return DashboardResponse(
            metrics=base_response.metrics.model_dump(),
            summary=summary,
            detected_algorithms=detected,
            complexity={
                "time": complexity["time"],
                "space": complexity["space"],
                "metrics": base_response.complexity.metrics,
            },
            suggestions=tips,
            provider=provider,
        )

    @staticmethod
    def _sanitize_summary(value: Any, fallback: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(value, dict):
            return fallback
        return {
            "primary_language": DashboardAnalysisService._string_or_default(value.get("primary_language"), fallback["primary_language"]),
            "code_style": DashboardAnalysisService._string_or_default(value.get("code_style"), fallback["code_style"]),
            "documentation_status": DashboardAnalysisService._string_or_default(
                value.get("documentation_status"),
                fallback["documentation_status"],
            ),
        }

    @staticmethod
    def _sanitize_algorithms(value: Any, fallback: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not isinstance(value, list):
            return fallback
        algorithms: list[dict[str, Any]] = []
        for item in value:
            if not isinstance(item, dict):
                continue
            name = DashboardAnalysisService._string_or_default(item.get("name"), "")
            complexity = DashboardAnalysisService._string_or_default(item.get("complexity"), "")
            kind = DashboardAnalysisService._string_or_default(item.get("type"), "")
            confidence = DashboardAnalysisService._coerce_confidence(item.get("confidence"))
            if name and complexity and kind and confidence is not None:
                algorithms.append(
                    {
                        "name": name,
                        "complexity": complexity,
                        "type": kind,
                        "confidence": confidence,
                    }
                )
        return algorithms[:4] or fallback

    @staticmethod
    def _sanitize_complexity(value: Any, fallback: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(value, dict):
            return fallback
        return {
            "time": DashboardAnalysisService._string_or_default(value.get("time"), fallback["time"]),
            "space": DashboardAnalysisService._string_or_default(value.get("space"), fallback["space"]),
            "metrics": fallback["metrics"],
        }

    @staticmethod
    def _sanitize_suggestions(value: Any, fallback: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not isinstance(value, list):
            return fallback
        suggestions_list: list[dict[str, Any]] = []
        for item in value:
            if not isinstance(item, dict):
                continue
            suggestion_type = DashboardAnalysisService._string_or_default(item.get("type"), "")
            priority = DashboardAnalysisService._enum_or_default(item.get("priority"), {"high", "medium", "low"}, "medium")
            title = DashboardAnalysisService._string_or_default(item.get("title"), "")
            description = DashboardAnalysisService._string_or_default(item.get("description"), "")
            if suggestion_type and title and description:
                suggestions_list.append(
                    {
                        "type": suggestion_type,
                        "priority": priority,
                        "title": title,
                        "description": description,
                    }
                )
        return suggestions_list[:4] or fallback

    @staticmethod
    def _string_or_default(value: Any, default: str) -> str:
        if isinstance(value, str) and value.strip():
            return value.strip()
        return default

    @staticmethod
    def _enum_or_default(value: Any, allowed: set[str], default: str) -> str:
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in allowed:
                return normalized
        return default

    @staticmethod
    def _coerce_confidence(value: Any) -> float | None:
        try:
            confidence = float(value)
        except (TypeError, ValueError):
            return None
        return max(0.0, min(confidence, 1.0))
