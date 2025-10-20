import logging
import time
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from .correlation import get_correlation_id

logger = logging.getLogger("audit")


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.perf_counter()
        correlation_id = get_correlation_id()

        client_host = request.client.host if request.client else None
        logger.info(
            "request started method=%s path=%s correlation_id=%s client=%s",
            request.method,
            request.url.path,
            correlation_id,
            client_host,
        )

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.info(
            "request completed method=%s path=%s status=%s duration_ms=%.2f correlation_id=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            correlation_id,
        )

        return response
