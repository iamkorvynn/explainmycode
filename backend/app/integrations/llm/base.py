from abc import ABC, abstractmethod
from typing import Any


class BaseLLMProvider(ABC):
    provider_name: str

    @abstractmethod
    def generate_text(self, system_prompt: str, user_prompt: str) -> str:
        raise NotImplementedError

    @abstractmethod
    def generate_json(self, system_prompt: str, user_prompt: str) -> dict[str, Any]:
        raise NotImplementedError
