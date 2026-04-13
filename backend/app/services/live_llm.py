from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.core.exceptions import AppException
from app.integrations.llm.base import BaseLLMProvider
from app.integrations.llm.claude import ClaudeProvider
from app.integrations.llm.groq import GroqProvider


class LiveLLMClient:
    def __init__(self):
        self._providers: dict[str, BaseLLMProvider] = {
            "groq": GroqProvider(),
            "claude": ClaudeProvider(),
        }

    @property
    def is_configured(self) -> bool:
        return settings.any_llm_provider_configured

    def generate_json(self, *, preferred: str, system_prompt: str, user_prompt: str) -> tuple[dict[str, Any] | None, str]:
        if not settings.live_llm_enabled:
            return None, "disabled"

        for provider in self._ordered_providers(preferred):
            try:
                payload = provider.generate_json(system_prompt, user_prompt)
            except Exception:
                continue
            if isinstance(payload, dict):
                return payload, provider.provider_name

        return None, "unavailable"

    def ensure_live_support(self) -> None:
        if not settings.live_llm_enabled:
            raise AppException(
                "Live AI is disabled. Set LLM_MODE=live for production analysis.",
                status_code=503,
                code="live_ai_disabled",
            )
        if not self.is_configured:
            raise AppException(
                "No live AI provider is configured. Add GROQ_API_KEY or CLAUDE_API_KEY.",
                status_code=503,
                code="live_ai_unavailable",
            )

    def _ordered_providers(self, preferred: str) -> list[BaseLLMProvider]:
        order = ["groq", "claude"] if preferred == "groq" else ["claude", "groq"]
        providers: list[BaseLLMProvider] = []
        for name in order:
            if name == "groq" and settings.groq_api_key:
                providers.append(self._providers[name])
            if name == "claude" and settings.claude_api_key:
                providers.append(self._providers[name])
        return providers
