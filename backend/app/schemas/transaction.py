from datetime import date, datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    account_id: Optional[str] = None
    date: date
    amount: float = Field(..., gt=0.0)
    type: str = Field(..., pattern="^(income|expense|transfer)$")
    category: str = Field("General", max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    counterparty: str = Field("Unknown", max_length=255)
    status: str = Field("cleared", pattern="^(cleared|pending|flagged)$")
    is_recurring: bool = False
    reference_no: Optional[str] = None
    notes: Optional[str] = None


class TransactionResponse(BaseModel):
    id: str
    workspace_id: str
    account_id: Optional[str]
    date: date
    amount: float
    type: str
    category: str
    description: str
    counterparty: str
    status: str
    is_recurring: bool
    reference_no: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionSummaryResponse(BaseModel):
    total_income: float
    total_expenses: float
    net_cash_flow: float
    transaction_count: int
    category_breakdown: Dict[str, float]
    type_breakdown: Dict[str, float]


class CSVImportSummary(BaseModel):
    filename: str
    total_rows: int
    imported_count: int
    duplicate_count: int
    skipped_count: int
    detected_columns: Dict[str, str]
    detected_categories: List[Dict[str, Any]]
    sample_preview: List[Dict[str, Any]]
    validation_errors: List[str] = []
