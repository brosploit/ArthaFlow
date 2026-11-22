from typing import List, Optional
from datetime import date
from pydantic import BaseModel, Field


class ForecastGenerateRequest(BaseModel):
    horizon_days: int = Field(30, ge=7, le=90)
    safety_buffer: Optional[float] = None


class DailyForecastItem(BaseModel):
    date: str
    day_label: str
    opening_balance: float
    expected_inflows: float
    expected_outflows: float
    net_change: float
    closing_balance: float
    confidence_low: float
    confidence_high: float
    scheduled_events: Optional[List[str]] = None


class ForecastResponse(BaseModel):
    id: str
    workspace_id: str
    generated_at: str
    horizon_days: int
    starting_balance: float
    ending_balance: float
    net_change: float
    lowest_balance: float
    lowest_balance_date: str
    safety_buffer: float
    shortage_detected: bool
    assumptions: List[str]
    uncertainty_range_percentage: float
    daily_forecasts: List[DailyForecastItem]
