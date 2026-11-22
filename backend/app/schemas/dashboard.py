from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.transaction import TransactionResponse


class DashboardOverviewResponse(BaseModel):
    workspace_id: str
    workspace_name: str
    currency: str
    total_available_cash: float
    liquidity_runway_days: float
    monthly_run_rate: float
    monthly_burn_rate: float
    net_monthly_cash_flow: float
    receivables_pending: float
    payables_pending: float
    financial_health_score: float
    health_vitality: str
    accounts_summary: List[Dict[str, Any]]
    recent_transactions: List[TransactionResponse]
    active_risk_alerts_count: int


class CashflowDataPoint(BaseModel):
    date: str
    day_label: str
    inflow: float
    outflow: float
    net: float
    balance: float


class CashflowResponse(BaseModel):
    timeframe: str
    starting_balance: float
    ending_balance: float
    total_inflow: float
    total_outflow: float
    net_flow: float
    data_points: List[CashflowDataPoint]
