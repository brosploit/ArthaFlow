from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.workspace import Workspace
from app.schemas.forecast import ForecastResponse, ForecastGenerateRequest
from app.api.deps import get_current_workspace
from app.forecasting.engine import generate_cash_forecast

router = APIRouter(prefix="/forecasts", tags=["Forecasting"])


@router.get("", response_model=ForecastResponse)
def get_forecast(
    days: int = Query(30, ge=7, le=90),
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Retrieve 7-day or 30-day deterministic cash-flow forecast."""
    fc_data = generate_cash_forecast(db, workspace, horizon_days=days)
    return ForecastResponse(**fc_data)


@router.post("/generate", response_model=ForecastResponse)
def generate_forecast(
    req: ForecastGenerateRequest,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Trigger on-demand deterministic forecast with custom buffer parameters."""
    buffer_amt = req.safety_buffer or 40000.0
    fc_data = generate_cash_forecast(db, workspace, horizon_days=req.horizon_days, safety_buffer=buffer_amt)
    return ForecastResponse(**fc_data)
