from typing import List, Dict, Any, Optional
from datetime import date
from pydantic import BaseModel


class DigitalTwinAccountBreakdown(BaseModel):
    account_id: str
    account_name: str
    institution: str
    balance: float
    share_percentage: float


class DigitalTwinReceivablesPayables(BaseModel):
    total_pending: float
    total_overdue: float
    expected_next_30_days: float
    count: int


class HealthScoreBreakdown(BaseModel):
    runway_score: float
    cash_buffer_score: float
    receivable_collection_score: float
    operating_margin_score: float


class DigitalTwinResponse(BaseModel):
    workspace_id: str
    as_of_date: str
    total_available_cash: float
    accounts_breakdown: List[DigitalTwinAccountBreakdown]
    liquidity_runway_days: float
    monthly_burn_rate: float
    monthly_run_rate: float
    net_monthly_cash_flow: float
    operating_buffer_months: float
    receivables: DigitalTwinReceivablesPayables
    payables: DigitalTwinReceivablesPayables
    financial_health_score: float
    financial_vitality: str
    health_breakdown: HealthScoreBreakdown


class TimelineEvent(BaseModel):
    id: str
    date: date
    title: str
    type: str  # inflow, outflow, milestone
    amount: float
    category: str
    is_recurring: bool


class TimelineResponse(BaseModel):
    workspace_id: str
    events: List[TimelineEvent]
