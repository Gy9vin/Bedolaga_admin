import contextvars
import uuid
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

correlation_id_ctx_var: contextvars.ContextVar[str] = contextvars.ContextVar("correlation_id", default="")


def get_correlation_id() -> str:
    return correlation_id_ctx_var.get()


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    header_name = "X-Request-ID"

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get(self.header_name) or str(uuid.uuid4())
        token = correlation_id_ctx_var.set(request_id)

        response = await call_next(request)
        response.headers[self.header_name] = request_id

        correlation_id_ctx_var.reset(token)
        return response
