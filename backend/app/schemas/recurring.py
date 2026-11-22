from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class RecurringTransactionBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    type: str = Field("expense", pattern="^(income|expense)$")
    category: str = Field("Operating", max_length=100)
    amount: float = Field(..., gt=0.0)
    frequency: str = Field("monthly", pattern="^(daily|weekly|biweekly|monthly|quarterly|yearly)$")
    next_due_date: date
    counterparty: str = Field(..., min_length=1, max_length=255)
    is_active: bool = True


class RecurringTransactionCreate(RecurringTransactionBase):
    pass


class RecurringTransactionResponse(RecurringTransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    created_at: datetime
