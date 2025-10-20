from typing import Any, Dict, Optional

import httpx

from ..clients.remnawave import RemnaWaveAdminAPIClient
from ..utils import normalize_payload


class RemoteServiceError(RuntimeError):
    def __init__(self, *, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class BaseService:
    def __init__(self, client: RemnaWaveAdminAPIClient) -> None:
        self._client = client

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        try:
            response = await self._client.request(
                method=method,
                path=path,
                params=params,
                json=json,
            )
        except httpx.HTTPStatusError as exc:
            raise RemoteServiceError(
                status_code=exc.response.status_code,
                detail=exc.response.text,
            ) from exc
        except httpx.HTTPError as exc:
            raise RemoteServiceError(status_code=503, detail=str(exc)) from exc

        payload = response.json()
        normalized = normalize_payload(payload)
        return normalized
