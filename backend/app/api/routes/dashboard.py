from typing import List, Dict, Any
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.financial import Transaction
from app.models.intelligence import RiskAlert
from app.schemas.dashboard import DashboardOverviewResponse, CashflowResponse, CashflowDataPoint
from app.schemas.transaction import TransactionResponse
from app.api.deps import get_current_workspace
from app.financial_engine.calculator import calculate_digital_twin_metrics, get_available_cash
from app.forecasting.engine import generate_cash_forecast

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Retrieve high-level dashboard metrics, cash balances, runway, and alerts."""
    twin = calculate_digital_twin_metrics(db, workspace)
    recent_txs = (
        db.query(Transaction)
        .filter(Transaction.workspace_id == workspace.id)
        .order_by(Transaction.date.desc())
        .limit(5)
        .all()
    )
    active_risks_count = (
        db.query(RiskAlert)
        .filter(RiskAlert.workspace_id == workspace.id, RiskAlert.is_resolved.is_(False))
        .count()
    )

    return DashboardOverviewResponse(
        workspace_id=workspace.id,
        workspace_name=workspace.name,
        currency=workspace.currency,
        total_available_cash=twin["total_available_cash"],
        liquidity_runway_days=twin["liquidity_runway_days"],
        monthly_run_rate=twin["monthly_run_rate"],
        monthly_burn_rate=twin["monthly_burn_rate"],
        net_monthly_cash_flow=twin["net_monthly_cash_flow"],
        receivables_pending=twin["receivables"]["total_pending"],
        payables_pending=twin["payables"]["total_pending"],
        financial_health_score=twin["financial_health_score"],
        health_vitality=twin["financial_vitality"],
        accounts_summary=twin["accounts_breakdown"],
        recent_transactions=[TransactionResponse.model_validate(t) for t in recent_txs],
        active_risk_alerts_count=active_risks_count,
    )


@router.get("/cashflow", response_model=CashflowResponse)
def get_dashboard_cashflow(
    timeframe_days: int = 30,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Retrieve cash-flow trajectory curve with daily inflows and outflows."""
    fc = generate_cash_forecast(db, workspace, horizon_days=timeframe_days)
    data_points = [
        CashflowDataPoint(
            date=d["date"],
            day_label=d["day_label"],
            inflow=d["expected_inflows"],
            outflow=d["expected_outflows"],
            net=d["net_change"],
            balance=d["closing_balance"],
        )
        for d in fc["daily_forecasts"]
    ]

    return CashflowResponse(
        timeframe=f"{timeframe_days}_days",
        starting_balance=fc["starting_balance"],
        ending_balance=fc["ending_balance"],
        total_inflow=round(sum(d.inflow for d in data_points), 2),
        total_outflow=round(sum(d.outflow for d in data_points), 2),
        net_flow=fc["net_change"],
        data_points=data_points,
    )
