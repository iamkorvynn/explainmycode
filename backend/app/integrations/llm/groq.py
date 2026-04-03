import json

import httpx

from app.core.config import settings
from app.integrations.llm.base import BaseLLMProvider


class GroqProvider(BaseLLMProvider):
    provider_name = "groq"

    def generate_text(self, system_prompt: str, user_prompt: str) -> str:
        payload = self._chat_completion(system_prompt, user_prompt)
        return payload["choices"][0]["message"]["content"]

    def generate_json(self, system_prompt: str, user_prompt: str) -> dict:
        return json.loads(self.generate_text(system_prompt, user_prompt))

    def _chat_completion(self, system_prompt: str, user_prompt: str) -> dict:
        with httpx.Client(timeout=20.0) as client:
            response = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                json={
                    "model": settings.groq_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.2,
                },
            )
            response.raise_for_status()
            return response.json()
