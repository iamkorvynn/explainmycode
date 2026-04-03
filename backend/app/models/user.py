from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.execution import Execution
    from app.models.oauth_account import OAuthAccount
    from app.models.password_reset import PasswordResetToken
    from app.models.session import RefreshSession
    from app.models.workspace import Workspace


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    sessions: Mapped[list["RefreshSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    password_reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    oauth_accounts: Mapped[list["OAuthAccount"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    workspaces: Mapped[list["Workspace"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    executions: Mapped[list["Execution"]] = relationship(back_populates="user", cascade="all, delete-orphan")
