from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import jwt

from ...core.config import get_settings


def create_access_token(subject: str, additional_claims: Dict[str, Any] | None = None) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.admin_jwt_expires_minutes)).timestamp()),
    }
    if additional_claims:
        payload.update(additional_claims)
    return jwt.encode(payload, settings.admin_jwt_secret, algorithm=settings.admin_jwt_algorithm)


def decode_access_token(token: str) -> Dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.admin_jwt_secret, algorithms=[settings.admin_jwt_algorithm])
