import time
from typing import Any, Dict, Tuple

from ..clients.remnawave import RemnaWaveAdminAPIClient
from ..schemas.health import HealthResponse
from .base import BaseService


class HealthService(BaseService):
    _cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}
    _cache_ttl_seconds: float = 15.0

    def __init__(self, client: RemnaWaveAdminAPIClient) -> None:
        super().__init__(client)

    async def get_health(self) -> HealthResponse:
        cache_key = "health"
        now = time.time()
        cached = self._cache.get(cache_key)

        if cached and now - cached[0] <= self._cache_ttl_seconds:
            return HealthResponse.model_validate(cached[1])

        start = time.perf_counter()
        payload = await self._request("GET", "/health")
        latency_ms = (time.perf_counter() - start) * 1000

        response_data = {
            "status": payload.get("status", "unknown"),
            "api_version": payload.get("api_version"),
            "bot_version": payload.get("bot_version"),
            "components": self._build_components(payload),
            "features": self._build_features(payload),
            "latency_ms": round(latency_ms, 2),
        }

        self._cache[cache_key] = (now, response_data)
        return HealthResponse.model_validate(response_data)

    def _build_components(self, payload: Dict[str, Any]) -> Dict[str, bool]:
        raw_components = payload.get("components") or {}
        components: Dict[str, bool] = {
            key: bool(value) for key, value in raw_components.items()
        }
        if not components:
            components["api_reachable"] = payload.get("status") == "ok"
        return components

    def _build_features(self, payload: Dict[str, Any]) -> Dict[str, bool]:
        raw_features = payload.get("features") or {}
        return {key: bool(value) for key, value in raw_features.items()}
