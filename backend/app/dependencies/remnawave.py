from collections.abc import AsyncGenerator

from ..clients.remnawave import RemnaWaveAdminAPIClient
from ..core.config import get_settings


async def remnawave_client_dependency() -> AsyncGenerator[RemnaWaveAdminAPIClient, None]:
    settings = get_settings()

    async with RemnaWaveAdminAPIClient(
        base_url=str(settings.remnawave_api_base_url),
        token=settings.remnawave_api_token,
        timeout=settings.remnawave_api_timeout,
        retries=settings.remnawave_api_retries,
    ) as client:
        yield client
