from functools import lru_cache

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    app_name: str = "ExplainMyCode API"
    api_v1_prefix: str = "/api/v1"
    debug: bool = False
    secret_key: str = "change-this-secret-key"
    database_url: str = "sqlite:///./explainmycode.db"
    redis_url: str = "redis://localhost:6379/0"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    remember_refresh_token_expire_days: int = 30
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"])
    frontend_base_url: str = "http://127.0.0.1:5173"
    backend_base_url: str = "http://127.0.0.1:8000"
    llm_mode: str = "mock"
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    claude_api_key: str = ""
    claude_model: str = "claude-3-5-sonnet-latest"
    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    judge0_base_url: str = ""
    judge0_api_key: str = ""
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False
    email_from: str = "no-reply@explainmycode.local"
    seed_demo_data: bool = False

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("environment", mode="before")
    @classmethod
    def normalize_environment(cls, value: str) -> str:
        return value.lower().strip()

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.environment == "production":
            if self.debug:
                raise ValueError("DEBUG must be false in production.")
            if self.secret_key == "change-this-secret-key":
                raise ValueError("SECRET_KEY must be changed before running in production.")
            if self.is_sqlite:
                raise ValueError("SQLite is not supported for production deployments. Use PostgreSQL.")
            if self.seed_demo_data:
                raise ValueError("SEED_DEMO_DATA must be false in production.")
        return self

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    @property
    def live_llm_enabled(self) -> bool:
        return self.llm_mode.lower() == "live"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
