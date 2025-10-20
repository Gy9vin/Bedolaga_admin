from fastapi import APIRouter, Depends

from ...auth import get_current_admin
from ...auth.models import AdminUser
from ...clients.remnawave import RemnaWaveAdminAPIClient
from ...dependencies.remnawave import remnawave_client_dependency
from ...schemas.stats import StatsOverviewResponse
from ...services.stats import StatsService

router = APIRouter()


@router.get("/overview", response_model=StatsOverviewResponse)
async def stats_overview(
    current_admin: AdminUser = Depends(get_current_admin),
    client: RemnaWaveAdminAPIClient = Depends(remnawave_client_dependency),
) -> StatsOverviewResponse:
    service = StatsService(client)
    return await service.get_overview()
