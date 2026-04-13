from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AppException
from app.prompts.mentor import (
    DEEP_ANALYSIS_PROMPT,
    FAST_ANALYSIS_PROMPT,
    build_assumptions_prompt,
    build_bugs_prompt,
    build_chat_prompt,
    build_explanation_prompt,
    build_line_explanation_prompt,
    build_live_comments_prompt,
    build_on_track_prompt,
    build_summary_prompt,
)
from app.schemas.mentor import (
    AssumptionsResponse,
    BugsResponse,
    ExplanationResponse,
    LineExplanationResponse,
    LiveCommentsResponse,
    MentorChatResponse,
    OnTrackResponse,
    SummaryResponse,
)
from app.services.analysis_utils import (
    detect_assumptions,
    detect_bugs,
    detect_language,
    explain_line,
    generate_live_comments,
    mentor_chat_answer,
    on_track_status,
    split_sections,
    summarize_code,
)
from app.services.live_llm import LiveLLMClient


class MentorAnalysisService:
    def __init__(self, _: Session | None = None):
        self.live_llm = LiveLLMClient()

    def live_comments(self, code: str, language: str) -> LiveCommentsResponse:
        resolved_language = detect_language(code, language)
        fallback_comments = generate_live_comments(code)
        self._ensure_live_ai_available()
        payload, provider = self.live_llm.generate_json(
            preferred="groq",
            system_prompt=FAST_ANALYSIS_PROMPT,
            user_prompt=build_live_comments_prompt(resolved_language, code, fallback_comments),
        )
        if payload:
            comments = self._sanitize_comments(payload.get("comments"), len(code.splitlines()))
            if comments:
                return LiveCommentsResponse(comments=comments, provider=provider)
        if settings.allow_mock_fallbacks:
            return LiveCommentsResponse(comments=fallback_comments, provider="builtin")
        self._raise_live_ai_failed("live comments")

    def summary(self, code: str, language: str) -> SummaryResponse:
        resolved_language = detect_language(code, language)
        fallback_summary = summarize_code(code, resolved_language)
        self._ensure_live_ai_available()
        payload, provider = self.live_llm.generate_json(
            preferred="claude",
            system_prompt=DEEP_ANALYSIS_PROMPT,
            user_prompt=build_summary_prompt(resolved_language, code, fallback_summary),
        )
        if payload:
            summary = self._string_or_default(payload.get("summary"), "")
            if summary:
                return SummaryResponse(summary=summary, provider=provider)
        if settings.allow_mock_fallbacks:
            return SummaryResponse(summary=fallback_summary, provider="builtin")
        self._raise_live_ai_failed("summary")

    def explanation(self, code: str, language: str) -> ExplanationResponse:
        resolved_language = detect_language(code, language)
        fallback_sections = split_sections(code)
        fallback_summary = summarize_code(code, resolved_language)
        fallback_full_explanation = (
            f"{fallback_summary} The code is organized into {len(fallback_sections) or 1} major section(s) "
            "with setup, control flow, and output steps."
        )
        self._ensure_live_ai_available()
        payload, provider = self.live_llm.generate_json(
            preferred="claude",
            system_prompt=DEEP_ANALYSIS_PROMPT,
            user_prompt=build_explanation_prompt(
                resolved_language,
                code,
                fallback_sections,
                fallback_full_explanation,
            ),
        )
        if payload:
            sections = self._sanitize_sections(payload.get("sections"), len(code.splitlines()))
            full_explanation = self._string_or_default(payload.get("full_explanation"), "")
            if sections and full_explanation:
                return ExplanationResponse(sections=sections, full_explanation=full_explanation, provider=provider)
        if settings.allow_mock_fallbacks:
            return ExplanationResponse(
                sections=fallback_sections,
                full_explanation=fallback_full_explanation,
                provider="builtin",
            )
        self._raise_live_ai_failed("explanation")

    def line_explanation(self, code: str, language: str, line_number: int) -> LineExplanationResponse:
        resolved_language = detect_language(code, language)
        fallback_result = explain_line(code, line_number)
        self._ensure_live_ai_available()
        payload, provider = self.live_llm.generate_json(
            preferred="groq",
            system_prompt=FAST_ANALYSIS_PROMPT,
            user_prompt=build_line_explanation_prompt(
                resolved_language,
                code,
                line_number,
                fallback_result,
            ),
        )
        if payload:
            explanation = self._string_or_default(payload.get("explanation"), "")
            related_lines = self._sanitize_line_numbers(payload.get("related_lines"), len(code.splitlines()))
            if explanation:
                return LineExplanationResponse(
                    line_number=line_number,
                    explanation=explanation,
                    related_lines=related_lines or fallback_result["related_lines"],
                    provider=provider,
                )
        if settings.allow_mock_fallbacks:
            return LineExplanationResponse(**fallback_result, provider="builtin")
        self._raise_live_ai_failed("line explanation")

    def bugs(self, code: str, language: str) -> BugsResponse:
        resolved_language = detect_language(code, language)
        fallback_bugs = detect_bugs(code)
        self._ensure_live_ai_available()
        payload, provider = self.live_llm.generate_json(
            preferred="claude",
            system_prompt=DEEP_ANALYSIS_PROMPT,
            user_prompt=build_bugs_prompt(resolved_language, code, fallback_bugs),
        )
        if payload:
            bugs = self._sanitize_bugs(payload.get("bugs"), len(code.splitlines()))
            return BugsResponse(bugs=bugs, provider=provider)
        if settings.allow_mock_fallbacks:
            return BugsResponse(bugs=fallback_bugs, provider="builtin")
        self._raise_live_ai_failed("bug analysis")

    def assumptions(self, code: str, language: str) -> AssumptionsResponse:
        resolved_language = detect_language(code, language)
        fallback_assumptions = detect_assumptions(code)
        self._ensure_live_ai_available()
        payload, provider = self.live_llm.generate_json(
            preferred="claude",
            system_prompt=DEEP_ANALYSIS_PROMPT,
            user_prompt=build_assumptions_prompt(resolved_language, code, fallback_assumptions),
        )
        if payload:
            assumptions = self._sanitize_assumptions(payload.get("assumptions"))
            if assumptions:
                return AssumptionsResponse(assumptions=assumptions, provider=provider)
        if settings.allow_mock_fallbacks:
            return AssumptionsResponse(assumptions=fallback_assumptions, provider="builtin")
        self._raise_live_ai_failed("assumption analysis")

    def on_track(self, code: str, language: str) -> OnTrackResponse:
        resolved_language = detect_language(code, language)
        fallback_status = on_track_status(code, resolved_language)
        self._ensure_live_ai_available()
        payload, provider = self.live_llm.generate_json(
            preferred="groq",
            system_prompt=FAST_ANALYSIS_PROMPT,
            user_prompt=build_on_track_prompt(resolved_language, code, fallback_status),
        )
        if payload:
            status_type = self._enum_or_default(payload.get("type"), {"idle", "success", "warning", "error"}, "")
            message = self._string_or_default(payload.get("message"), "")
            details = self._string_or_default(payload.get("details"), "")
            if status_type and message and details:
                return OnTrackResponse(
                    type=status_type,
                    message=message,
                    details=details,
                    language=fallback_status["language"],
                    line_count=fallback_status["line_count"],
                    warning_count=fallback_status["warning_count"],
                    error_count=fallback_status["error_count"],
                    provider=provider,
                )
        if settings.allow_mock_fallbacks:
            return OnTrackResponse(**fallback_status, provider="builtin")
        self._raise_live_ai_failed("progress analysis")

    def chat(self, code: str, language: str, message: str, history: list[dict[str, Any]] | None = None) -> MentorChatResponse:
        resolved_language = detect_language(code, language)
        fallback_payload = mentor_chat_answer(code, resolved_language, message)
        self._ensure_live_ai_available()
        payload, provider = self.live_llm.generate_json(
            preferred="claude",
            system_prompt=DEEP_ANALYSIS_PROMPT,
            user_prompt=build_chat_prompt(
                resolved_language,
                code,
                message,
                history or [],
                fallback_payload,
            ),
        )
        if payload:
            answer = self._string_or_default(payload.get("answer"), "")
            citations = self._sanitize_citations(payload.get("citations"), len(code.splitlines()))
            follow_ups = self._sanitize_follow_ups(payload.get("follow_ups")) or fallback_payload["follow_ups"]
            if answer:
                return MentorChatResponse(
                    answer=answer,
                    citations=citations,
                    follow_ups=follow_ups,
                    provider=provider,
                )
        if settings.allow_mock_fallbacks:
            return MentorChatResponse(**fallback_payload, provider="builtin")
        self._raise_live_ai_failed("mentor chat")

    def _ensure_live_ai_available(self) -> None:
        if settings.allow_mock_fallbacks:
            return
        self.live_llm.ensure_live_support()

    @staticmethod
    def _raise_live_ai_failed(feature_name: str) -> None:
        raise AppException(
            f"Live AI {feature_name} is unavailable. Check your provider credentials and model access.",
            status_code=503,
            code="live_ai_provider_unavailable",
        )

    def _sanitize_comments(self, value: Any, line_count: int) -> list[dict[str, Any]]:
        if not isinstance(value, list):
            return []
        allowed_types = {"info", "important", "warning"}
        comments: list[dict[str, Any]] = []
        for item in value:
            if not isinstance(item, dict):
                continue
            line = self._coerce_line(item.get("line"), line_count)
            comment = self._string_or_default(item.get("comment"), "")
            if line is None or not comment:
                continue
            comment_type = self._enum_or_default(item.get("type"), allowed_types, "info")
            comments.append({"line": line, "comment": comment, "type": comment_type})
        return comments[:20]

    def _sanitize_sections(self, value: Any, line_count: int) -> list[dict[str, Any]]:
        if not isinstance(value, list):
            return []
        sections: list[dict[str, Any]] = []
        seen_ranges: set[tuple[int, int]] = set()
        for item in value:
            if not isinstance(item, dict):
                continue
            start_line = self._coerce_line(item.get("start_line"), line_count)
            end_line = self._coerce_line(item.get("end_line"), line_count)
            title = self._string_or_default(item.get("title"), "")
            summary = self._string_or_default(item.get("summary"), "")
            if start_line is None or end_line is None or not title or not summary:
                continue
            if end_line < start_line:
                start_line, end_line = end_line, start_line
            key = (start_line, end_line)
            if key in seen_ranges:
                continue
            seen_ranges.add(key)
            sections.append(
                {
                    "title": title,
                    "start_line": start_line,
                    "end_line": end_line,
                    "summary": summary,
                }
            )
        return sections[:6]

    def _sanitize_bugs(self, value: Any, line_count: int) -> list[dict[str, Any]]:
        if not isinstance(value, list):
            return []
        bugs: list[dict[str, Any]] = []
        for item in value:
            if not isinstance(item, dict):
                continue
            line = self._coerce_line(item.get("line"), line_count)
            title = self._string_or_default(item.get("title"), "")
            description = self._string_or_default(item.get("description"), "")
            fix_suggestion = self._string_or_default(item.get("fix_suggestion"), "")
            if line is None or not title or not description or not fix_suggestion:
                continue
            bugs.append(
                {
                    "title": title,
                    "line": line,
                    "severity": self._enum_or_default(item.get("severity"), {"low", "medium", "high"}, "medium"),
                    "category": self._string_or_default(item.get("category"), "logic"),
                    "description": description,
                    "fix_suggestion": fix_suggestion,
                }
            )
        return bugs[:8]

    def _sanitize_assumptions(self, value: Any) -> list[dict[str, Any]]:
        if not isinstance(value, list):
            return []
        assumptions: list[dict[str, Any]] = []
        for item in value:
            if not isinstance(item, dict):
                continue
            title = self._string_or_default(item.get("title"), "")
            category = self._string_or_default(item.get("category"), "")
            description = self._string_or_default(item.get("description"), "")
            if title and category and description:
                assumptions.append(
                    {
                        "title": title,
                        "category": category,
                        "description": description,
                    }
                )
        return assumptions[:8]

    def _sanitize_citations(self, value: Any, line_count: int) -> list[dict[str, Any]]:
        if not isinstance(value, list):
            return []
        citations: list[dict[str, Any]] = []
        for item in value:
            if not isinstance(item, dict):
                continue
            line = self._coerce_line(item.get("line"), line_count)
            label = self._string_or_default(item.get("label"), "")
            reason = self._string_or_default(item.get("reason"), "")
            if line is None or not label or not reason:
                continue
            citations.append({"label": label, "line": line, "reason": reason})
        return citations[:5]

    def _sanitize_follow_ups(self, value: Any) -> list[str]:
        if not isinstance(value, list):
            return []
        follow_ups: list[str] = []
        for item in value:
            text = self._string_or_default(item, "")
            if text:
                follow_ups.append(text)
        return follow_ups[:4]

    def _sanitize_line_numbers(self, value: Any, line_count: int) -> list[int]:
        if not isinstance(value, list):
            return []
        related_lines: list[int] = []
        for item in value:
            line = self._coerce_line(item, line_count)
            if line is not None and line not in related_lines:
                related_lines.append(line)
        return related_lines[:5]

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
    def _coerce_line(value: Any, line_count: int) -> int | None:
        if line_count <= 0:
            return None
        try:
            line = int(value)
        except (TypeError, ValueError):
            return None
        if 1 <= line <= line_count:
            return line
        return None
