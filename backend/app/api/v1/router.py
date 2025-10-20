from fastapi import APIRouter

from . import health, stats

router = APIRouter()
router.include_router(health.router, tags=["health"])
router.include_router(stats.router, prefix="/stats", tags=["stats"])
