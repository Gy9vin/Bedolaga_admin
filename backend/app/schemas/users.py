from typing import List, Optional

from pydantic import BaseModel, Field


class PromoGroupSummary(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None


class SubscriptionSummary(BaseModel):
    id: Optional[int] = None
    status: Optional[str] = None
    expires_at: Optional[str] = None


class BalanceInfo(BaseModel):
    current_balance_kopeks: Optional[int] = Field(default=None, alias="current_balance_kopeks")
    current_balance_rubles: Optional[float] = Field(default=None, alias="current_balance_rubles")


class UserSummary(BaseModel):
    id: int
    telegram_id: Optional[int] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    language: Optional[str] = None
    status: Optional[str] = None
    is_blocked: Optional[bool] = None
    created_at: Optional[str] = None
    subscription: Optional[SubscriptionSummary] = None
    promo_group: Optional[PromoGroupSummary] = None
    balance: Optional[BalanceInfo] = None


class PaginationMeta(BaseModel):
    total: int
    limit: int
    offset: int


class UserListResponse(BaseModel):
    items: List[UserSummary] = Field(default_factory=list)
    total: int
    limit: int
    offset: int


class UserDetail(UserSummary):
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    promo_codes: List[str] = Field(default_factory=list)


class UserDetailResponse(BaseModel):
    user: UserDetail


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    language: Optional[str] = None
    status: Optional[str] = None
    promo_group_id: Optional[int] = None
    is_blocked: Optional[bool] = None
    notes: Optional[str] = None
