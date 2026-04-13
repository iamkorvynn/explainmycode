from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


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
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"]
    )
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
    execution_provider_order: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["onecompiler", "compiler-io", "judge0"]
    )
    onecompiler_base_url: str = "https://api.onecompiler.com/v1/run"
    onecompiler_api_key: str = ""
    compiler_io_base_url: str = "https://api.onlinecompiler.io/api/run-code-sync/"
    compiler_io_api_key: str = ""
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

    @field_validator("llm_mode", mode="before")
    @classmethod
    def normalize_llm_mode(cls, value: str) -> str:
        return value.lower().strip()

    @field_validator("llm_mode")
    @classmethod
    def validate_llm_mode(cls, value: str) -> str:
        if value not in {"mock", "live"}:
            raise ValueError("LLM_MODE must be either 'mock' or 'live'.")
        return value

    @field_validator("execution_provider_order", mode="before")
    @classmethod
    def parse_execution_provider_order(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [provider.strip() for provider in value.split(",") if provider.strip()]
        return value

    @field_validator("execution_provider_order")
    @classmethod
    def validate_execution_provider_order(cls, value: list[str]) -> list[str]:
        allowed = {"judge0", "onecompiler", "compiler-io"}
        normalized: list[str] = []
        for provider in value:
            name = provider.lower().strip()
            if name not in allowed:
                raise ValueError(
                    f"EXECUTION_PROVIDER_ORDER contains unsupported provider '{provider}'. "
                    "Use judge0, onecompiler, or compiler-io."
                )
            if name not in normalized:
                normalized.append(name)
        if not normalized:
            raise ValueError("EXECUTION_PROVIDER_ORDER must include at least one provider.")
        return normalized

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
            if self.llm_mode != "live":
                raise ValueError("LLM_MODE must be live in production.")
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

    @property
    def allow_mock_fallbacks(self) -> bool:
        return not self.is_production

    @property
    def groq_configured(self) -> bool:
        return bool(self.groq_api_key.strip())

    @property
    def claude_configured(self) -> bool:
        return bool(self.claude_api_key.strip())

    @property
    def any_llm_provider_configured(self) -> bool:
        return self.groq_configured or self.claude_configured

    @property
    def judge0_configured(self) -> bool:
        return bool(self.judge0_base_url.strip())

    @property
    def onecompiler_configured(self) -> bool:
        return bool(self.onecompiler_api_key.strip())

    @property
    def compiler_io_configured(self) -> bool:
        return bool(self.compiler_io_api_key.strip())

    @property
    def any_execution_provider_configured(self) -> bool:
        return self.judge0_configured or self.onecompiler_configured or self.compiler_io_configured

    @property
    def smtp_configured(self) -> bool:
        return bool(self.smtp_host.strip())

    @property
    def google_oauth_configured(self) -> bool:
        return bool(self.google_client_id.strip() and self.google_client_secret.strip())

    @property
    def github_oauth_configured(self) -> bool:
        return bool(self.github_client_id.strip() and self.github_client_secret.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
