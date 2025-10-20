from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class StatsBlock(BaseModel):
    total: int = Field(default=0)
    active: Optional[int] = None
    new: Optional[int] = None
    warning: Optional[str] = None


class StatsPaymentsBlock(BaseModel):
    total_kopeks: int = Field(default=0)
    total_rubles: float = Field(default=0)
    today_kopeks: int = Field(default=0)
    today_rubles: float = Field(default=0)


class StatsOverviewResponse(BaseModel):
    users: StatsBlock
    subscriptions: StatsBlock
    support: StatsBlock
    payments: StatsPaymentsBlock
    meta: Dict[str, Any] = Field(default_factory=dict)
