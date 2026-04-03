from pydantic import BaseModel, Field

from app.schemas.common import APIModel


class CodeRequest(BaseModel):
    code: str = Field(max_length=30000)
    language: str
    filename: str | None = None
    workspace_id: str | None = None


class LineExplanationRequest(CodeRequest):
    line_number: int = Field(ge=1)


class MentorChatRequest(CodeRequest):
    message: str = Field(min_length=1, max_length=2000)
    history: list[dict] = Field(default_factory=list)


class LiveComment(APIModel):
    line: int
    comment: str
    type: str


class LiveCommentsResponse(APIModel):
    comments: list[LiveComment]
    provider: str


class SummaryResponse(APIModel):
    summary: str
    provider: str


class ExplanationSection(APIModel):
    title: str
    start_line: int
    end_line: int
    summary: str


class ExplanationResponse(APIModel):
    sections: list[ExplanationSection]
    full_explanation: str
    provider: str


class LineExplanationResponse(APIModel):
    line_number: int
    explanation: str
    related_lines: list[int]
    provider: str


class BugItem(APIModel):
    title: str
    line: int
    severity: str
    category: str
    description: str
    fix_suggestion: str


class BugsResponse(APIModel):
    bugs: list[BugItem]
    provider: str


class AssumptionItem(APIModel):
    title: str
    category: str
    description: str


class AssumptionsResponse(APIModel):
    assumptions: list[AssumptionItem]
    provider: str


class OnTrackResponse(APIModel):
    type: str
    message: str
    details: str
    language: str
    line_count: int
    warning_count: int
    error_count: int
    provider: str


class MentorChatResponse(APIModel):
    answer: str
    citations: list[dict] = Field(default_factory=list)
    follow_ups: list[str] = Field(default_factory=list)
    provider: str
