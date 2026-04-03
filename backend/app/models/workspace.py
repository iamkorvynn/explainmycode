from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Workspace(TimestampMixin, Base):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship(back_populates="workspaces")
    nodes: Mapped[list["WorkspaceNode"]] = relationship(back_populates="workspace", cascade="all, delete-orphan")


class WorkspaceNode(TimestampMixin, Base):
    __tablename__ = "workspace_nodes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    parent_id: Mapped[str | None] = mapped_column(ForeignKey("workspace_nodes.id", ondelete="CASCADE"), nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    path: Mapped[str] = mapped_column(String(500), index=True)
    type: Mapped[str] = mapped_column(String(20))
    language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    workspace: Mapped["Workspace"] = relationship(back_populates="nodes")
    parent: Mapped["WorkspaceNode | None"] = relationship("WorkspaceNode", remote_side=lambda: WorkspaceNode.id, back_populates="children")
    children: Mapped[list["WorkspaceNode"]] = relationship("WorkspaceNode", back_populates="parent", cascade="all, delete-orphan")
