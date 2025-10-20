from ..clients.remnawave import RemnaWaveAdminAPIClient
from .base import BaseService
from ..schemas.health import HealthResponse


class HealthService(BaseService):
    def __init__(self, client: RemnaWaveAdminAPIClient) -> None:
        super().__init__(client)

    async def get_health(self) -> HealthResponse:
        payload = await self._request("GET", "/health")
        return HealthResponse(
            status=payload.get("status", "unknown"),
            version=str(payload.get("api_version", "unknown")),
            components={
                "api": payload.get("status") == "ok",
            },
        )
