from typing import Optional

from fastapi import APIRouter, Depends, Query

from ...auth import get_current_admin
from ...auth.models import AdminUser
from ...clients.remnawave import RemnaWaveAdminAPIClient
from ...dependencies.remnawave import remnawave_client_dependency
from ...schemas.subscriptions import (
    SubscriptionDetailResponse,
    SubscriptionListResponse,
    SubscriptionUpdateRequest,
)
from ...services.subscriptions import SubscriptionsService

router = APIRouter()


def get_subscriptions_service(
    client: RemnaWaveAdminAPIClient = Depends(remnawave_client_dependency),
) -> SubscriptionsService:
    return SubscriptionsService(client)


@router.get("/", response_model=SubscriptionListResponse)
async def list_subscriptions(
    current_admin: AdminUser = Depends(get_current_admin),
    service: SubscriptionsService = Depends(get_subscriptions_service),
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(default=None),
    user_id: Optional[int] = Query(default=None),
    is_trial: Optional[bool] = Query(default=None, alias="isTrial"),
) -> SubscriptionListResponse:
    return await service.list_subscriptions(
        limit=limit,
        offset=offset,
        status=status,
        user_id=user_id,
        is_trial=is_trial,
    )


@router.get("/{subscription_id}", response_model=SubscriptionDetailResponse)
async def get_subscription(
    subscription_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    service: SubscriptionsService = Depends(get_subscriptions_service),
) -> SubscriptionDetailResponse:
    return await service.get_subscription(subscription_id)


@router.patch("/{subscription_id}", response_model=SubscriptionDetailResponse)
async def update_subscription(
    subscription_id: int,
    request: SubscriptionUpdateRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    service: SubscriptionsService = Depends(get_subscriptions_service),
) -> SubscriptionDetailResponse:
    return await service.update_subscription(subscription_id, request)
