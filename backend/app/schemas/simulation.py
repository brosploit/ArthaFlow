from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    scenario_type: str = Field(..., pattern="^(capex|delayed_receivable|revenue_shock|expense_spike|new_recurring)$")
    parameters: Dict[str, Any]


class SimulationTrajectoryPoint(BaseModel):
    date: str
    day_number: int
    baseline_balance: float
    simulated_balance: float
    variance: float


class SimulationResponse(BaseModel):
    id: str
    workspace_id: str
    title: str
    scenario_type: str
    parameters: Dict[str, Any]
    baseline_runway_days: float
    simulated_runway_days: float
    runway_delta_days: float
    baseline_ending_cash: float
    simulated_ending_cash: float
    net_impact: float
    lowest_cash_dip: float
    lowest_cash_date: str
    break_even_day: Optional[float]
    verdict: str  # SAFE, CAUTION, HIGH_RISK
    risk_level: str
    confidence_score: float
    rule_based_advice: List[str]
    trajectory_data: List[SimulationTrajectoryPoint]
    created_at: datetime

    class Config:
        from_attributes = True
