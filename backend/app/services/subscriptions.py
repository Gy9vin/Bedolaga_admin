from typing import Any, Dict, Optional

from fastapi import HTTPException

from ..clients.remnawave import RemnaWaveAdminAPIClient
from ..schemas.subscriptions import (
    SubscriptionDetailResponse,
    SubscriptionListResponse,
    SubscriptionUpdateRequest,
)
from .base import BaseService, RemoteServiceError


class SubscriptionsService(BaseService):
    def __init__(self, client: RemnaWaveAdminAPIClient) -> None:
        super().__init__(client)

    async def list_subscriptions(
        self,
        *,
        limit: int,
        offset: int,
        status: Optional[str] = None,
        user_id: Optional[int] = None,
        is_trial: Optional[bool] = None,
    ) -> SubscriptionListResponse:
        params: Dict[str, Any] = {
            "limit": limit,
            "offset": offset,
        }
        if status:
            params["status"] = status
        if user_id is not None:
            params["user_id"] = user_id
        if is_trial is not None:
            params["is_trial"] = str(is_trial).lower()

        payload = await self._safe_request("GET", "/subscriptions", params=params)
        normalized = self._ensure_list_payload(payload)
        return SubscriptionListResponse.model_validate(normalized)

    async def get_subscription(self, subscription_id: int) -> SubscriptionDetailResponse:
        payload = await self._safe_request("GET", f"/subscriptions/{subscription_id}")
        normalized = self._ensure_detail_payload(payload)
        return SubscriptionDetailResponse.model_validate(normalized)

    async def update_subscription(
        self, subscription_id: int, request: SubscriptionUpdateRequest
    ) -> SubscriptionDetailResponse:
        body = request.model_dump(exclude_none=True)
        payload = await self._safe_request("PATCH", f"/subscriptions/{subscription_id}", json=body)
        normalized = self._ensure_detail_payload(payload)
        return SubscriptionDetailResponse.model_validate(normalized)

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
        items = payload.get("items") or payload.get("subscriptions") or []
        total = payload.get("total", len(items))
        limit = payload.get("limit")
        offset = payload.get("offset")

        return {
            "items": items,
            "total": total,
            "limit": limit or len(items),
            "offset": offset or 0,
        }

    def _ensure_detail_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if "subscription" in payload:
            return payload
        return {"subscription": payload}
