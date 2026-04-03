from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.workspace import (
    FileSearchResponse,
    WorkspaceCreateRequest,
    WorkspaceNodeCreateRequest,
    WorkspaceNodeResponse,
    WorkspaceNodeUpdateRequest,
    WorkspaceResponse,
    WorkspaceTreeResponse,
)
from app.services.workspace import WorkspaceService

router = APIRouter()


@router.get("", response_model=list[WorkspaceResponse])
def list_workspaces(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[WorkspaceResponse]:
    return WorkspaceService(db).list_workspaces(current_user)


@router.post("", response_model=WorkspaceResponse)
def create_workspace(
    payload: WorkspaceCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkspaceResponse:
    return WorkspaceService(db).create_workspace(current_user, payload.name, payload.description)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(workspace_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> WorkspaceResponse:
    return WorkspaceService(db).get_workspace(current_user, workspace_id)


@router.get("/{workspace_id}/tree", response_model=WorkspaceTreeResponse)
def get_tree(workspace_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> WorkspaceTreeResponse:
    nodes = WorkspaceService(db).get_tree(current_user, workspace_id)
    return WorkspaceTreeResponse(workspace_id=workspace_id, nodes=nodes)


@router.get("/{workspace_id}/files/{file_id}", response_model=WorkspaceNodeResponse)
def get_file(workspace_id: str, file_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> WorkspaceNodeResponse:
    return WorkspaceService(db).get_node(current_user, workspace_id, file_id)


@router.post("/{workspace_id}/files", response_model=WorkspaceNodeResponse)
def create_file(
    workspace_id: str,
    payload: WorkspaceNodeCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkspaceNodeResponse:
    return WorkspaceService(db).create_node(
        current_user,
        workspace_id,
        payload.parent_id,
        payload.name,
        payload.type,
        payload.language,
        payload.content,
    )


@router.put("/{workspace_id}/files/{file_id}", response_model=WorkspaceNodeResponse)
@router.patch("/{workspace_id}/files/{file_id}", response_model=WorkspaceNodeResponse)
def update_file(
    workspace_id: str,
    file_id: str,
    payload: WorkspaceNodeUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkspaceNodeResponse:
    return WorkspaceService(db).update_node(
        current_user,
        workspace_id,
        file_id,
        name=payload.name,
        language=payload.language,
        content=payload.content,
        parent_id=payload.parent_id,
    )


@router.delete("/{workspace_id}/files/{file_id}", response_model=MessageResponse)
def delete_file(workspace_id: str, file_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MessageResponse:
    WorkspaceService(db).delete_node(current_user, workspace_id, file_id)
    return MessageResponse(message="Node deleted successfully")


@router.get("/{workspace_id}/search", response_model=FileSearchResponse)
def search_files(
    workspace_id: str,
    q: str = Query(min_length=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FileSearchResponse:
    results = WorkspaceService(db).search(current_user, workspace_id, q)
    return FileSearchResponse(query=q, results=results)
