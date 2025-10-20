from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import AnyHttpUrl, BaseSettings, Field


class Settings(BaseSettings):
    app_name: str = Field(default="RemnaWave Bedolaga Admin BFF", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    host: str = Field(default="0.0.0.0", alias="BACKEND_HOST")
    port: int = Field(default=8080, alias="BACKEND_PORT")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    remnawave_api_base_url: AnyHttpUrl = Field(
        default="https://api.example.com", alias="REMNAWAVE_API_BASE_URL"
    )
    remnawave_api_token: str = Field(default="", alias="REMNAWAVE_API_TOKEN")
    remnawave_api_timeout: float = Field(default=10.0, alias="REMNAWAVE_API_TIMEOUT")
    remnawave_api_retries: int = Field(default=3, alias="REMNAWAVE_API_RETRIES")

    admin_jwt_secret: str = Field(default="dev-secret-change-me", alias="ADMIN_JWT_SECRET")
    admin_jwt_algorithm: str = Field(default="HS256", alias="ADMIN_JWT_ALGORITHM")
    admin_jwt_expires_minutes: int = Field(default=60, alias="ADMIN_JWT_EXPIRES_MINUTES")

    allowed_origins: List[AnyHttpUrl] = Field(default_factory=list, alias="WEB_API_ALLOWED_ORIGINS")

    sentry_dsn: str = Field(default="", alias="SENTRY_DSN")
    otel_exporter_otlp_endpoint: str = Field(default="", alias="OTEL_EXPORTER_OTLP_ENDPOINT")

    class Config:
        env_file = Path(__file__).resolve().parents[3] / ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
