from typing import Any, Dict, Optional

from fastapi import HTTPException

from ..clients.remnawave import RemnaWaveAdminAPIClient
from ..schemas.users import UserDetailResponse, UserListResponse, UserUpdateRequest
from .base import BaseService, RemoteServiceError


class UsersService(BaseService):
    def __init__(self, client: RemnaWaveAdminAPIClient) -> None:
        super().__init__(client)

    async def list_users(
        self,
        *,
        limit: int,
        offset: int,
        status_filter: Optional[str] = None,
        promo_group_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> UserListResponse:
        params: Dict[str, Any] = {
            "limit": limit,
            "offset": offset,
        }
        if status_filter:
            params["status"] = status_filter
        if promo_group_id is not None:
            params["promo_group_id"] = promo_group_id
        if search:
            params["search"] = search

        payload = await self._safe_request("GET", "/users", params=params)
        normalized = self._ensure_list_payload(payload)
        return UserListResponse.model_validate(normalized)

    async def get_user(self, user_id: int) -> UserDetailResponse:
        payload = await self._safe_request("GET", f"/users/{user_id}")
        normalized = self._ensure_detail_payload(payload)
        return UserDetailResponse.model_validate(normalized)

    async def update_user(self, user_id: int, payload: UserUpdateRequest) -> UserDetailResponse:
        body = payload.model_dump(exclude_none=True)
        response_payload = await self._safe_request("PATCH", f"/users/{user_id}", json=body)
        normalized = self._ensure_detail_payload(response_payload)
        return UserDetailResponse.model_validate(normalized)

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
        items = payload.get("items") or payload.get("users") or []
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
        if "user" in payload:
            return payload
        return {"user": payload}
