from fastapi import APIRouter, Depends, Query

from ...auth import get_current_admin
from ...auth.models import AdminUser
from ...clients.remnawave import RemnaWaveAdminAPIClient
from ...dependencies.remnawave import remnawave_client_dependency
from ...schemas.tokens import (
    TokenCreateRequest,
    TokenCreateResponse,
    TokenListResponse,
    TokenRevokeResponse,
)
from ...services.tokens import TokensService

router = APIRouter()


def get_tokens_service(
    client: RemnaWaveAdminAPIClient = Depends(remnawave_client_dependency),
) -> TokensService:
    return TokensService(client)


@router.get("/", response_model=TokenListResponse)
async def list_tokens(
    current_admin: AdminUser = Depends(get_current_admin),
    service: TokensService = Depends(get_tokens_service),
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: str | None = Query(default=None),
) -> TokenListResponse:
    return await service.list_tokens(limit=limit, offset=offset, search=search)


@router.post("/", response_model=TokenCreateResponse)
async def create_token(
    request: TokenCreateRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    service: TokensService = Depends(get_tokens_service),
) -> TokenCreateResponse:
    return await service.create_token(request)


@router.post("/{token_id}/revoke", response_model=TokenRevokeResponse)
async def revoke_token(
    token_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    service: TokensService = Depends(get_tokens_service),
) -> TokenRevokeResponse:
    return await service.revoke_token(token_id)
