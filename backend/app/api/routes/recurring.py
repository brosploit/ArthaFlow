from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.financial import RecurringTransaction
from app.schemas.recurring import RecurringTransactionCreate, RecurringTransactionResponse
from app.api.deps import get_current_workspace

router = APIRouter(tags=["Recurring Transactions"])


@router.get("/recurring", response_model=List[RecurringTransactionResponse])
def list_recurring_transactions(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """List recurring income and expense commitments."""
    items = (
        db.query(RecurringTransaction)
        .filter(RecurringTransaction.workspace_id == workspace.id)
        .order_by(RecurringTransaction.next_due_date.asc())
        .all()
    )
    return [RecurringTransactionResponse.model_validate(i) for i in items]


@router.post("/recurring", response_model=RecurringTransactionResponse, status_code=status.HTTP_201_CREATED)
def create_recurring_transaction(
    item_in: RecurringTransactionCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Create a new recurring financial commitment."""
    item = RecurringTransaction(
        workspace_id=workspace.id,
        name=item_in.name,
        type=item_in.type,
        category=item_in.category,
        amount=item_in.amount,
        frequency=item_in.frequency,
        next_due_date=item_in.next_due_date,
        counterparty=item_in.counterparty,
        is_active=item_in.is_active,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return RecurringTransactionResponse.model_validate(item)


@router.get("/workspaces/{workspace_id}/recurring", response_model=List[RecurringTransactionResponse])
def list_workspace_recurring(
    workspace_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Compatibility route for workspace recurring."""
    target_id = workspace_id or workspace.id
    items = (
        db.query(RecurringTransaction)
        .filter(RecurringTransaction.workspace_id == target_id)
        .order_by(RecurringTransaction.next_due_date.asc())
        .all()
    )
    return [RecurringTransactionResponse.model_validate(i) for i in items]
