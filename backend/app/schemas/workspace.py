from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    mode: str = Field("business", pattern="^(business|individual)$")
    currency: str = Field("INR", max_length=10)
    starting_cash: float = Field(0.0, ge=0.0)


class WorkspaceMemberResponse(BaseModel):
    id: str
    workspace_id: str
    user_id: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    mode: str
    currency: str
    starting_cash: float
    owner_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
