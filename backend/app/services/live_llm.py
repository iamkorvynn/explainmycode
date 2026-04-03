from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.integrations.llm.base import BaseLLMProvider
from app.integrations.llm.claude import ClaudeProvider
from app.integrations.llm.groq import GroqProvider


class LiveLLMClient:
    def __init__(self):
        self._providers: dict[str, BaseLLMProvider] = {
            "groq": GroqProvider(),
            "claude": ClaudeProvider(),
        }

    def generate_json(self, *, preferred: str, system_prompt: str, user_prompt: str) -> tuple[dict[str, Any] | None, str]:
        if not settings.live_llm_enabled:
            return None, "mock"

        for provider in self._ordered_providers(preferred):
            try:
                payload = provider.generate_json(system_prompt, user_prompt)
            except Exception:
                continue
            if isinstance(payload, dict):
                return payload, provider.provider_name

        return None, "mock"

    def _ordered_providers(self, preferred: str) -> list[BaseLLMProvider]:
        order = ["groq", "claude"] if preferred == "groq" else ["claude", "groq"]
        providers: list[BaseLLMProvider] = []
        for name in order:
            if name == "groq" and settings.groq_api_key:
                providers.append(self._providers[name])
            if name == "claude" and settings.claude_api_key:
                providers.append(self._providers[name])
        return providers
