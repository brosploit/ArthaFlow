from fastapi import APIRouter
from app.api.routes.auth import router as auth_router
from app.api.routes.workspaces import router as workspaces_router
from app.api.routes.accounts import router as accounts_router
from app.api.routes.transactions import router as transactions_router
from app.api.routes.recurring import router as recurring_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.digital_twin import router as digital_twin_router
from app.api.routes.forecasting import router as forecasting_router
from app.api.routes.risk import router as risk_router
from app.api.routes.simulations import router as simulations_router
from app.api.routes.ai import router as ai_router
from app.api.routes.decisions import router as decisions_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(workspaces_router)
api_router.include_router(accounts_router)
api_router.include_router(transactions_router)
api_router.include_router(recurring_router)
api_router.include_router(dashboard_router)
api_router.include_router(digital_twin_router)
api_router.include_router(forecasting_router)
api_router.include_router(risk_router)
api_router.include_router(simulations_router)
api_router.include_router(ai_router)
api_router.include_router(decisions_router)

__all__ = ["api_router"]
