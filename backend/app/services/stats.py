import time
from typing import Any, Dict, Tuple

from ..clients.remnawave import RemnaWaveAdminAPIClient
from ..schemas.stats import StatsBlock, StatsOverviewResponse, StatsPaymentsBlock
from .base import BaseService


class StatsService(BaseService):
    _cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}
    _cache_ttl_seconds: float = 60.0

    def __init__(self, client: RemnaWaveAdminAPIClient) -> None:
        super().__init__(client)

    async def get_overview(self) -> StatsOverviewResponse:
        cache_key = "overview"
        cached = self._cache.get(cache_key)
        now = time.time()

        if cached and now - cached[0] <= self._cache_ttl_seconds:
            return StatsOverviewResponse.model_validate(cached[1])

        payload = await self._request("GET", "/stats/overview")
        overview = {
            "users": self._build_stats_block(payload.get("users", {})),
            "subscriptions": self._build_stats_block(payload.get("subscriptions", {})),
            "support": self._build_stats_block(payload.get("support", {})),
            "payments": self._build_payments_block(payload.get("payments", {})),
            "meta": payload.get("meta", {}),
        }

        self._cache[cache_key] = (now, overview)
        return StatsOverviewResponse.model_validate(overview)

    def _build_stats_block(self, raw: Dict[str, Any]) -> StatsBlock:
        mapping = {
            "total": raw.get("total"),
            "active": raw.get("active") or raw.get("active_count"),
            "new": raw.get("new") or raw.get("new_today") or raw.get("delta"),
            "warning": raw.get("warning"),
        }
        return StatsBlock.model_validate(mapping)

    def _build_payments_block(self, raw: Dict[str, Any]) -> StatsPaymentsBlock:
        total_kopeks = raw.get("total_kopeks") or raw.get("total_amount_kopeks") or 0
        today_kopeks = raw.get("today_kopeks") or raw.get("today_amount_kopeks") or 0
        total_rubles = raw.get("total_rubles") or total_kopeks / 100
        today_rubles = raw.get("today_rubles") or today_kopeks / 100

        mapping = {
            "total_kopeks": total_kopeks,
            "total_rubles": total_rubles,
            "today_kopeks": today_kopeks,
            "today_rubles": today_rubles,
        }
        return StatsPaymentsBlock.model_validate(mapping)
