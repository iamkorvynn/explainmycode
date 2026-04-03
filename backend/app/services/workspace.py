from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.user import User
from app.models.workspace import WorkspaceNode
from app.repositories.workspace import WorkspaceRepository


class WorkspaceService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = WorkspaceRepository(db)

    def list_workspaces(self, user: User):
        return self.repo.list_for_user(user.id)

    def create_workspace(self, user: User, name: str, description: str | None = None):
        workspace = self.repo.create_workspace(user_id=user.id, name=name, description=description, is_default=False)
        self.repo.create_node(
            workspace_id=workspace.id,
            parent_id=None,
            name="src",
            path="src",
            type="folder",
            language=None,
            content=None,
            sort_order=0,
        )
        self.db.commit()
        self.db.refresh(workspace)
        return workspace

    def get_workspace(self, user: User, workspace_id: str):
        workspace = self.repo.get_workspace(workspace_id, user.id)
        if workspace is None:
            raise AppException("Workspace not found", status_code=404, code="workspace_not_found")
        return workspace

    def get_tree(self, user: User, workspace_id: str):
        self.get_workspace(user, workspace_id)
        return self.repo.build_tree(self.repo.list_nodes(workspace_id))

    def get_node(self, user: User, workspace_id: str, node_id: str):
        self.get_workspace(user, workspace_id)
        node = self.repo.get_node(workspace_id, node_id)
        if node is None:
            raise AppException("File not found", status_code=404, code="file_not_found")
        return node

    def create_node(self, user: User, workspace_id: str, parent_id: str | None, name: str, node_type: str, language: str | None, content: str | None):
        self.get_workspace(user, workspace_id)
        parent = None
        if parent_id:
            parent = self.get_node(user, workspace_id, parent_id)
            if parent.type != "folder":
                raise AppException("Parent must be a folder", code="invalid_parent")
        path = f"{parent.path}/{name}" if parent else name
        node = self.repo.create_node(
            workspace_id=workspace_id,
            parent_id=parent_id,
            name=name,
            path=path,
            type=node_type,
            language=language,
            content=content if node_type == "file" else None,
            sort_order=0,
        )
        self.db.commit()
        self.db.refresh(node)
        return node

    def update_node(self, user: User, workspace_id: str, node_id: str, **kwargs):
        node = self.get_node(user, workspace_id, node_id)
        old_path = node.path
        if kwargs.get("name") is not None:
            node.name = kwargs["name"]
        if kwargs.get("language") is not None:
            node.language = kwargs["language"]
        if kwargs.get("content") is not None and node.type == "file":
            node.content = kwargs["content"]
        if kwargs.get("parent_id") is not None and kwargs["parent_id"] != node.parent_id:
            parent = self.get_node(user, workspace_id, kwargs["parent_id"]) if kwargs["parent_id"] else None
            if parent and parent.type != "folder":
                raise AppException("Parent must be a folder", code="invalid_parent")
            node.parent_id = kwargs["parent_id"]
            node.path = f"{parent.path}/{node.name}" if parent else node.name
        elif kwargs.get("name") is not None:
            node.path = self._rebuild_path(node)

        if node.path != old_path:
            self._update_descendant_paths(workspace_id, old_path, node.path)
        self.db.commit()
        self.db.refresh(node)
        return node

    def delete_node(self, user: User, workspace_id: str, node_id: str) -> None:
        node = self.get_node(user, workspace_id, node_id)
        self.repo.delete_node(node)
        self.db.commit()

    def search(self, user: User, workspace_id: str, query: str):
        self.get_workspace(user, workspace_id)
        return self.repo.search_nodes(workspace_id, query)

    def _rebuild_path(self, node: WorkspaceNode) -> str:
        if node.parent is None:
            return node.name
        return f"{node.parent.path}/{node.name}"

    def _update_descendant_paths(self, workspace_id: str, old_prefix: str, new_prefix: str) -> None:
        for node in self.repo.list_nodes(workspace_id):
            if node.path.startswith(f"{old_prefix}/"):
                node.path = node.path.replace(old_prefix, new_prefix, 1)
