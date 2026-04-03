from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.workspace import Workspace, WorkspaceNode


class WorkspaceRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_user(self, user_id: str) -> list[Workspace]:
        stmt = select(Workspace).where(Workspace.user_id == user_id).order_by(Workspace.created_at.asc())
        return list(self.db.scalars(stmt))

    def get_workspace(self, workspace_id: str, user_id: str) -> Workspace | None:
        stmt = select(Workspace).where(Workspace.id == workspace_id, Workspace.user_id == user_id)
        return self.db.scalar(stmt)

    def create_workspace(self, **kwargs) -> Workspace:
        workspace = Workspace(**kwargs)
        self.db.add(workspace)
        self.db.flush()
        return workspace

    def list_nodes(self, workspace_id: str) -> list[WorkspaceNode]:
        stmt = select(WorkspaceNode).where(WorkspaceNode.workspace_id == workspace_id).order_by(
            WorkspaceNode.sort_order.asc(),
            WorkspaceNode.name.asc(),
        )
        return list(self.db.scalars(stmt))

    def get_node(self, workspace_id: str, node_id: str) -> WorkspaceNode | None:
        stmt = select(WorkspaceNode).where(WorkspaceNode.workspace_id == workspace_id, WorkspaceNode.id == node_id)
        return self.db.scalar(stmt)

    def create_node(self, **kwargs) -> WorkspaceNode:
        node = WorkspaceNode(**kwargs)
        self.db.add(node)
        self.db.flush()
        return node

    def delete_node(self, node: WorkspaceNode) -> None:
        self.db.delete(node)

    def search_nodes(self, workspace_id: str, query: str) -> list[WorkspaceNode]:
        stmt = (
            select(WorkspaceNode)
            .where(WorkspaceNode.workspace_id == workspace_id, WorkspaceNode.name.ilike(f"%{query}%"))
            .order_by(WorkspaceNode.name.asc())
        )
        return list(self.db.scalars(stmt))

    def build_tree(self, nodes: list[WorkspaceNode]) -> list[dict]:
        by_parent: dict[str | None, list[WorkspaceNode]] = defaultdict(list)
        for node in nodes:
            by_parent[node.parent_id].append(node)

        def serialize(node: WorkspaceNode) -> dict:
            return {
                "id": node.id,
                "workspace_id": node.workspace_id,
                "parent_id": node.parent_id,
                "name": node.name,
                "path": node.path,
                "type": node.type,
                "language": node.language,
                "content": node.content,
                "created_at": node.created_at,
                "updated_at": node.updated_at,
                "children": [serialize(child) for child in by_parent.get(node.id, [])],
            }

        return [serialize(node) for node in by_parent.get(None, [])]
