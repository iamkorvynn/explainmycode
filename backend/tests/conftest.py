from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401
from app.api.deps import get_db
from app.core.config import settings
from app.core.rate_limit import _buckets
from app.main import create_app
from app.models.base import Base


@pytest.fixture()
def client(tmp_path: Path):
    settings.environment = "development"
    settings.seed_demo_data = False
    settings.llm_mode = "mock"
    settings.groq_api_key = ""
    settings.claude_api_key = ""
    settings.execution_provider_order = ["onecompiler", "compiler-io", "judge0"]
    settings.onecompiler_api_key = ""
    settings.onecompiler_base_url = "https://api.onecompiler.com/v1/run"
    settings.compiler_io_api_key = ""
    settings.compiler_io_base_url = "https://api.onlinecompiler.io/api/run-code-sync/"
    settings.judge0_base_url = ""
    settings.judge0_api_key = ""
    _buckets.clear()
    db_path = tmp_path / "test.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False}, future=True)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    app = create_app()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    Base.metadata.drop_all(bind=engine)
