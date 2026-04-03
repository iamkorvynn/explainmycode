from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import APIModel


class WorkspaceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=255)


class WorkspaceResponse(APIModel):
    id: str
    name: str
    description: str | None = None
    is_default: bool
    created_at: datetime


class WorkspaceNodeCreateRequest(BaseModel):
    parent_id: str | None = None
    name: str = Field(min_length=1, max_length=255)
    type: str
    language: str | None = None
    content: str | None = None


class WorkspaceNodeUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    language: str | None = None
    content: str | None = None
    parent_id: str | None = None


class WorkspaceNodeResponse(APIModel):
    id: str
    workspace_id: str
    parent_id: str | None = None
    name: str
    path: str
    type: str
    language: str | None = None
    content: str | None = None
    created_at: datetime
    updated_at: datetime
    children: list["WorkspaceNodeResponse"] = Field(default_factory=list)


class WorkspaceTreeResponse(APIModel):
    workspace_id: str
    nodes: list[WorkspaceNodeResponse]


class FileSearchResponse(APIModel):
    query: str
    results: list[WorkspaceNodeResponse]


WorkspaceNodeResponse.model_rebuild()
