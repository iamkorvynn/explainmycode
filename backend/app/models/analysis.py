from uuid import uuid4

from sqlalchemy import JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class AnalysisResult(TimestampMixin, Base):
    __tablename__ = "analysis_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    workspace_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    analysis_type: Mapped[str] = mapped_column(String(50), index=True)
    code_hash: Mapped[str] = mapped_column(String(64), index=True)
    language: Mapped[str] = mapped_column(String(50))
    provider: Mapped[str] = mapped_column(String(50), default="builtin")
    payload: Mapped[dict] = mapped_column(JSON)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
