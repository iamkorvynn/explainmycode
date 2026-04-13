from __future__ import annotations

from typing import Any

from pydantic import Field, model_validator

from app.schemas.common import APIModel


class VisualizationSummary(APIModel):
    id: str
    title: str
    description: str
    category: str = "Template"


class VisualizationGenerateRequest(APIModel):
    code: str | None = Field(default=None, max_length=30000)
    language: str = "python"
    algorithm_name: str | None = Field(default=None, max_length=120)
    prompt: str | None = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_generation_input(self) -> "VisualizationGenerateRequest":
        has_code = bool(self.code and self.code.strip())
        has_prompt = bool((self.prompt and self.prompt.strip()) or (self.algorithm_name and self.algorithm_name.strip()))
        if not has_code and not has_prompt:
            raise ValueError("Provide code or an algorithm prompt to generate a visualization.")
        return self


class VisualizationStep(APIModel):
    index: int
    label: str
    narration: str = ""
    state: dict[str, Any] = Field(default_factory=dict)


class VisualizationDetail(APIModel):
    algorithm: str
    title: str
    description: str
    visualization_type: str = "generic"
    source: str = "template"
    provider: str = "builtin"
    steps: list[VisualizationStep] = Field(default_factory=list)
