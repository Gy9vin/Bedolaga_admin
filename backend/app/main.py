from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .api.router import api_router
from .core.config import get_settings
from .core.logging import configure_logging
from .middleware.audit import AuditMiddleware
from .middleware.correlation import CorrelationIdMiddleware


def create_app() -> FastAPI:
    settings = get_settings()

    configure_logging(settings.log_level)

    app = FastAPI(
        title=settings.app_name,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    if settings.allowed_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.allowed_origins],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.add_middleware(CorrelationIdMiddleware)
    app.add_middleware(AuditMiddleware)

    app.include_router(api_router, prefix="/api")

    return app


app = create_app()
