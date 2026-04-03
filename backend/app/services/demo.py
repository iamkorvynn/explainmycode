from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.repositories.user import UserRepository
from app.repositories.workspace import WorkspaceRepository


def seed_demo_data() -> None:
    db: Session = SessionLocal()
    try:
        users = UserRepository(db)
        existing = users.get_by_email("demo@explainmycode.dev")
        if existing:
            return

        user = users.create(
            username="demo",
            email="demo@explainmycode.dev",
            hashed_password=get_password_hash("demo12345"),
            full_name="Demo Developer",
        )
        workspaces = WorkspaceRepository(db)
        workspace = workspaces.create_workspace(
            user_id=user.id,
            name="Demo Workspace",
            description="Starter workspace for local development",
            is_default=True,
        )
        src = workspaces.create_node(
            workspace_id=workspace.id,
            parent_id=None,
            name="src",
            path="src",
            type="folder",
            language=None,
            content=None,
            sort_order=0,
        )
        workspaces.create_node(
            workspace_id=workspace.id,
            parent_id=src.id,
            name="binary_search.py",
            path="src/binary_search.py",
            type="file",
            language="python",
            content=(
                "def binary_search(arr, target):\n"
                "    left = 0\n"
                "    right = len(arr) - 1\n"
                "    while left <= right:\n"
                "        mid = (left + right) // 2\n"
                "        if arr[mid] == target:\n"
                "            return mid\n"
                "        elif arr[mid] < target:\n"
                "            left = mid + 1\n"
                "        else:\n"
                "            right = mid - 1\n"
                "    return -1\n"
            ),
            sort_order=1,
        )
        db.commit()
    finally:
        db.close()
