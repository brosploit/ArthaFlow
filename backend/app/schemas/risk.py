from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel


class RiskAlertResponse(BaseModel):
    id: str
    workspace_id: str
    category: str
    severity: str
    title: str
    description: str
    explanation: str
    financial_impact: float
    is_resolved: bool
    suggested_action: str
    related_entity: Optional[str] = None
    related_transactions: Optional[List[Dict[str, Any]]] = None
    detected_at: datetime

    class Config:
        from_attributes = True


class RiskAnalyzeRequest(BaseModel):
    reanalyze_duplicates: bool = True
    lookback_days: int = 60
