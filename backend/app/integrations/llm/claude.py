import json

import httpx

from app.core.config import settings
from app.integrations.llm.base import BaseLLMProvider


class ClaudeProvider(BaseLLMProvider):
    provider_name = "claude"

    def generate_text(self, system_prompt: str, user_prompt: str) -> str:
        with httpx.Client(timeout=25.0) as client:
            response = client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.claude_api_key,
                    "anthropic-version": "2023-06-01",
                },
                json={
                    "model": settings.claude_model,
                    "system": system_prompt,
                    "max_tokens": 1200,
                    "temperature": 0.2,
                    "messages": [{"role": "user", "content": user_prompt}],
                },
            )
            response.raise_for_status()
            payload = response.json()
            return payload["content"][0]["text"]

    def generate_json(self, system_prompt: str, user_prompt: str) -> dict:
        return json.loads(self.generate_text(system_prompt, user_prompt))
