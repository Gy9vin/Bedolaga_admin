from typing import Any, Dict, Optional

from fastapi import HTTPException

from ..clients.remnawave import RemnaWaveAdminAPIClient
from ..schemas.tokens import (
    TokenCreateRequest,
    TokenCreateResponse,
    TokenListResponse,
    TokenRevokeResponse,
)
from .base import BaseService, RemoteServiceError


class TokensService(BaseService):
    def __init__(self, client: RemnaWaveAdminAPIClient) -> None:
        super().__init__(client)

    async def list_tokens(
        self,
        *,
        limit: int,
        offset: int,
        search: Optional[str] = None,
    ) -> TokenListResponse:
        params: Dict[str, Any] = {"limit": limit, "offset": offset}
        if search:
            params["search"] = search

        payload = await self._safe_request("GET", "/tokens", params=params)
        normalized = self._ensure_list_payload(payload)
        return TokenListResponse.model_validate(normalized)

    async def create_token(self, request: TokenCreateRequest) -> TokenCreateResponse:
        body = request.model_dump(exclude_none=True)
        payload = await self._safe_request("POST", "/tokens", json=body)
        normalized = self._ensure_create_payload(payload)
        return TokenCreateResponse.model_validate(normalized)

    async def revoke_token(self, token_id: int) -> TokenRevokeResponse:
        payload = await self._safe_request("POST", f"/tokens/{token_id}/revoke")
        return TokenRevokeResponse.model_validate(
            {"success": payload.get("success", True)}
        )

    async def _safe_request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        try:
            return await self._request(method, path, params=params, json=json)
        except RemoteServiceError as exc:
            raise HTTPException(status_code=exc.status_code, detail=exc.detail)

    def _ensure_list_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        items = payload.get("items") or payload.get("tokens") or []
        total = payload.get("total", len(items))
        limit = payload.get("limit")
        offset = payload.get("offset")

        return {
            "items": items,
            "total": total,
            "limit": limit or len(items),
            "offset": offset or 0,
        }

    def _ensure_create_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if "token" in payload:
            return payload
        return {"token": payload}
