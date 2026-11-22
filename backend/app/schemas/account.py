from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class AccountBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    type: str = Field("checking", pattern="^(checking|savings|credit|wallet|escrow)$")
    institution: str = Field(..., min_length=2, max_length=255)
    account_number_mask: str = Field("••••", max_length=50)
    balance: float = Field(0.0)
    currency: str = Field("INR", max_length=10)
    is_active: bool = True


class AccountCreate(AccountBase):
    pass


class AccountResponse(AccountBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    last_synced_at: datetime
    created_at: datetime
