from typing import Dict, Optional

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    api_version: Optional[str] = None
    bot_version: Optional[str] = None
    components: Dict[str, bool]
    features: Dict[str, bool]
    latency_ms: float
