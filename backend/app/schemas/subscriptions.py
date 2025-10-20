from typing import List, Optional

from pydantic import BaseModel, Field


class SubscriptionPlanSummary(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    traffic_limit_gb: Optional[int] = None
    device_limit: Optional[int] = None


class SubscriptionDevice(BaseModel):
    id: int
    device_type: Optional[str] = None
    name: Optional[str] = None
    last_active_at: Optional[str] = None


class Subscription(BaseModel):
    id: int
    user_id: int = Field(alias="user_id")
    plan_id: Optional[int] = Field(default=None, alias="plan_id")
    status: Optional[str] = None
    is_trial: Optional[bool] = Field(default=None, alias="is_trial")
    started_at: Optional[str] = None
    expires_at: Optional[str] = None
    traffic_limit_gb: Optional[int] = None
    traffic_used_gb: Optional[int] = None
    device_limit: Optional[int] = None
    plan: Optional[SubscriptionPlanSummary] = None
    devices: List[SubscriptionDevice] = Field(default_factory=list)


class SubscriptionListResponse(BaseModel):
    items: List[Subscription] = Field(default_factory=list)
    total: int
    limit: int
    offset: int


class SubscriptionDetailResponse(BaseModel):
    subscription: Subscription


class SubscriptionUpdateRequest(BaseModel):
    status: Optional[str] = None
    plan_id: Optional[int] = None
    expires_at: Optional[str] = None
    device_limit: Optional[int] = None
    traffic_limit_gb: Optional[int] = None
