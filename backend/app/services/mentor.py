from sqlalchemy.orm import Session

from app.core.config import settings
from app.integrations.llm.claude import ClaudeProvider
from app.integrations.llm.groq import GroqProvider
from app.prompts.mentor import DEEP_ANALYSIS_PROMPT, FAST_ANALYSIS_PROMPT
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


class MentorAnalysisService:
    def __init__(self, _: Session | None = None):
        self.groq = GroqProvider()
        self.claude = ClaudeProvider()

    def live_comments(self, code: str, language: str) -> LiveCommentsResponse:
        resolved_language = detect_language(code, language)
        comments = generate_live_comments(code)
        provider = "mock"
        if settings.live_llm_enabled and settings.groq_api_key:
            try:
                text = self.groq.generate_text(FAST_ANALYSIS_PROMPT, f"Language: {resolved_language}\nCode:\n{code}")
                provider = self.groq.provider_name
                if text:
                    comments = generate_live_comments(code)
            except Exception:
                provider = "mock"
        return LiveCommentsResponse(comments=comments, provider=provider)

    def summary(self, code: str, language: str) -> SummaryResponse:
        resolved_language = detect_language(code, language)
        summary = summarize_code(code, resolved_language)
        provider = "mock"
        if settings.live_llm_enabled and settings.claude_api_key:
            try:
                summary = self.claude.generate_text(DEEP_ANALYSIS_PROMPT, f"Summarize this {resolved_language} code:\n{code}")
                provider = self.claude.provider_name
            except Exception:
                provider = "mock"
        return SummaryResponse(summary=summary, provider=provider)

    def explanation(self, code: str, language: str) -> ExplanationResponse:
        resolved_language = detect_language(code, language)
        sections = split_sections(code)
        summary = summarize_code(code, resolved_language)
        full_explanation = f"{summary} The code is organized into {len(sections) or 1} major section(s) with setup, control flow, and output steps."
        return ExplanationResponse(sections=sections, full_explanation=full_explanation, provider="mock")

    def line_explanation(self, code: str, language: str, line_number: int) -> LineExplanationResponse:
        _ = detect_language(code, language)
        result = explain_line(code, line_number)
        return LineExplanationResponse(**result, provider="mock")

    def bugs(self, code: str, language: str) -> BugsResponse:
        _ = detect_language(code, language)
        return BugsResponse(bugs=detect_bugs(code), provider="mock")

    def assumptions(self, code: str, language: str) -> AssumptionsResponse:
        _ = detect_language(code, language)
        return AssumptionsResponse(assumptions=detect_assumptions(code), provider="mock")

    def on_track(self, code: str, language: str) -> OnTrackResponse:
        resolved_language = detect_language(code, language)
        status = on_track_status(code, resolved_language)
        return OnTrackResponse(**status, provider="mock")

    def chat(self, code: str, language: str, message: str) -> MentorChatResponse:
        resolved_language = detect_language(code, language)
        payload = mentor_chat_answer(code, resolved_language, message)
        return MentorChatResponse(**payload, provider="mock")
