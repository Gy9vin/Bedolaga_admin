import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Any, Dict, Optional

import httpx

logger = logging.getLogger(__name__)


class RemnaWaveAdminAPIClient:
    def __init__(
        self,
        base_url: str,
        token: str,
        timeout: float = 10.0,
        retries: int = 3,
    ) -> None:
        self._client = httpx.AsyncClient(
            base_url=base_url,
            headers={"X-API-Key": token} if token else {},
            timeout=timeout,
        )
        self._retries = max(retries, 1)
        self._timeout = timeout

    async def request(
        self,
        method: str,
        path: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
    ) -> httpx.Response:
        attempt = 0
        backoff = 0.5
        while True:
            try:
                response = await self._client.request(
                    method=method,
                    url=path,
                    params=params,
                    json=json,
                )
                response.raise_for_status()
                return response
            except (httpx.HTTPStatusError, httpx.TransportError) as exc:
                attempt += 1
                if attempt >= self._retries:
                    logger.exception("RemnaWave API request failed: %s", exc)
                    raise
                logger.warning(
                    "RemnaWave API request error (attempt %s/%s): %s",
                    attempt,
                    self._retries,
                    exc,
                )
                await asyncio.sleep(backoff)
                backoff = min(backoff * 2, 5.0)

    async def close(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "RemnaWaveAdminAPIClient":
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        await self.close()


@asynccontextmanager
async def get_remnawave_client(
    *,
    base_url: str,
    token: str,
    timeout: float,
    retries: int,
) -> RemnaWaveAdminAPIClient:
    async with RemnaWaveAdminAPIClient(
        base_url=base_url,
        token=token,
        timeout=timeout,
        retries=retries,
    ) as client:
        yield client
