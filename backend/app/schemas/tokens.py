from typing import List, Optional

from pydantic import BaseModel, Field


class Token(BaseModel):
    id: int
    name: str
    token_prefix: str = Field(alias="token_prefix")
    created_at: Optional[str] = None
    last_used_at: Optional[str] = None
    last_used_ip: Optional[str] = None
    expires_at: Optional[str] = None
    is_active: bool = Field(default=True, alias="is_active")
    scopes: List[str] = Field(default_factory=list)


class TokenListResponse(BaseModel):
    items: List[Token] = Field(default_factory=list)
    total: int
    limit: int
    offset: int


class TokenCreateRequest(BaseModel):
    name: str
    expires_at: Optional[str] = None
    scopes: List[str] = Field(default_factory=list)


class TokenCreateResponse(BaseModel):
    token: Token
    plain_token: Optional[str] = None


class TokenRevokeResponse(BaseModel):
    success: bool
