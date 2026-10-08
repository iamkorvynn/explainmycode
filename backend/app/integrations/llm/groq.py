import logging
import time
import httpx

from app.core.config import settings
from app.integrations.llm.base import BaseLLMProvider
from app.integrations.llm.json_utils import parse_json_response

logger = logging.getLogger(__name__)

FALLBACK_MODELS = ["openai/gpt-oss-20b", "qwen/qwen3.8-27b", "openai/gpt-oss-120b"]


class GroqProvider(BaseLLMProvider):
    provider_name = "groq"

    def generate_text(self, system_prompt: str, user_prompt: str) -> str:
        payload = self._chat_completion(system_prompt, user_prompt)
        return payload["choices"][0]["message"]["content"]

    def generate_json(self, system_prompt: str, user_prompt: str) -> dict:
        prompt_with_json_guidance = (
            system_prompt + "\nIMPORTANT: Return valid JSON only. Do not enclose in markdown blocks if possible, and output no commentary."
        )
        return parse_json_response(self.generate_text(prompt_with_json_guidance, user_prompt))

    def _chat_completion(self, system_prompt: str, user_prompt: str) -> dict:
        models = [settings.groq_model]
        for fallback in FALLBACK_MODELS:
            if fallback not in models:
                models.append(fallback)

        last_error: Exception | None = None
        with httpx.Client(timeout=25.0) as client:
            for model in models:
                for attempt in range(2):
                    try:
                        response = client.post(
                            "https://api.groq.com/openai/v1/chat/completions",
                            headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                            json={
                                "model": model,
                                "messages": [
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": user_prompt},
                                ],
                                "temperature": 0.2,
                            },
                        )
                        if response.status_code == 429:
                            retry_after_str = response.headers.get("retry-after")
                            try:
                                retry_wait = float(retry_after_str) if retry_after_str else 1.0
                            except ValueError:
                                retry_wait = 1.0
                            time.sleep(min(retry_wait, 2.0))
                            continue
                        response.raise_for_status()
                        return response.json()
                    except (httpx.TimeoutException, httpx.HTTPStatusError) as exc:
                        last_error = exc
                        logger.warning("Groq request failed with model %s (attempt %s): %s", model, attempt, exc)
                        time.sleep(0.5)
                        continue
                    except Exception as exc:
                        last_error = exc
                        logger.warning("Groq unexpected error with model %s: %s", model, exc)
                        break

        if last_error:
            raise last_error
        raise RuntimeError("All Groq models and retries failed.")
