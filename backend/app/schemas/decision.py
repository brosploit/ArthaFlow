from typing import List, Optional, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel, Field


class ExpectedOutcomeItem(BaseModel):
    metric: str
    expected_value: str
    timeframe: str


class DecisionCreate(BaseModel):
    scenario_id: Optional[str] = None
    title: str = Field(..., min_length=3, max_length=255)
    category: str = Field("General", max_length=100)
    hypothesis: str = Field(..., min_length=5)
    assumptions: Optional[List[str]] = []
    expected_outcomes: List[ExpectedOutcomeItem]
    decision_date: Optional[date] = None
    evaluation_date: Optional[date] = None
    notes: Optional[str] = None


class DecisionOutcomeCreate(BaseModel):
    metric: str
    actual_value: str
    variance_percentage: Optional[float] = None
    verdict: str = Field("met", pattern="^(exceeded|met|missed|pending)$")
    notes: Optional[str] = None


class DecisionOutcomeResponse(BaseModel):
    id: str
    decision_id: str
    metric: str
    expected_value: str
    actual_value: str
    variance_percentage: Optional[float]
    verdict: str
    evaluated_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True


class DecisionResponse(BaseModel):
    id: str
    workspace_id: str
    scenario_id: Optional[str]
    title: str
    category: str
    hypothesis: str
    assumptions: List[str]
    expected_outcomes: List[Dict[str, Any]]
    status: str
    decision_date: date
    evaluation_date: date
    notes: Optional[str]
    outcomes: List[DecisionOutcomeResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
