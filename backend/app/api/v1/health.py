from fastapi import APIRouter, Depends

from ...auth import get_current_admin
from ...auth.models import AdminUser
from ...clients.remnawave import RemnaWaveAdminAPIClient
from ...dependencies.remnawave import remnawave_client_dependency
from ...services.health import HealthService
from ...schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def healthcheck(
    current_admin: AdminUser = Depends(get_current_admin),
    client: RemnaWaveAdminAPIClient = Depends(remnawave_client_dependency),
) -> HealthResponse:
    service = HealthService(client)
    return await service.get_health()
