from fastapi import APIRouter

from . import health, stats, subscriptions, tokens, users

router = APIRouter()
router.include_router(health.router, tags=["health"])
router.include_router(stats.router, prefix="/stats", tags=["stats"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
router.include_router(tokens.router, prefix="/tokens", tags=["tokens"])
