from typing import Optional

from fastapi import APIRouter, Depends, Query

from ...auth import get_current_admin
from ...auth.models import AdminUser
from ...clients.remnawave import RemnaWaveAdminAPIClient
from ...dependencies.remnawave import remnawave_client_dependency
from ...schemas.users import UserDetailResponse, UserListResponse, UserUpdateRequest
from ...services.users import UsersService

router = APIRouter()


def get_users_service(
    client: RemnaWaveAdminAPIClient = Depends(remnawave_client_dependency),
) -> UsersService:
    return UsersService(client)


@router.get("/", response_model=UserListResponse)
async def list_users(
    current_admin: AdminUser = Depends(get_current_admin),
    service: UsersService = Depends(get_users_service),
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(default=None),
    promo_group_id: Optional[int] = Query(default=None, alias="promoGroupId"),
    search: Optional[str] = Query(default=None),
) -> UserListResponse:
    return await service.list_users(
        limit=limit,
        offset=offset,
        status_filter=status,
        promo_group_id=promo_group_id,
        search=search,
    )


@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(
    user_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    service: UsersService = Depends(get_users_service),
) -> UserDetailResponse:
    return await service.get_user(user_id)


@router.patch("/{user_id}", response_model=UserDetailResponse)
async def update_user(
    user_id: int,
    request: UserUpdateRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    service: UsersService = Depends(get_users_service),
) -> UserDetailResponse:
    return await service.update_user(user_id, request)
