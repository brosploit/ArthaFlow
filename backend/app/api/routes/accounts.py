from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.financial import Account
from app.schemas.account import AccountCreate, AccountResponse
from app.api.deps import get_current_workspace

router = APIRouter(tags=["Accounts"])


@router.get("/accounts", response_model=List[AccountResponse])
def list_accounts(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """List financial accounts belonging to the active workspace."""
    accounts = (
        db.query(Account)
        .filter(Account.workspace_id == workspace.id)
        .order_by(Account.balance.desc())
        .all()
    )
    return [AccountResponse.model_validate(a) for a in accounts]


@router.post("/accounts", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    acc_in: AccountCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Add a new bank or wallet account to workspace."""
    account = Account(
        workspace_id=workspace.id,
        name=acc_in.name,
        type=acc_in.type,
        institution=acc_in.institution,
        account_number_mask=acc_in.account_number_mask,
        balance=acc_in.balance,
        currency=acc_in.currency,
        is_active=acc_in.is_active,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return AccountResponse.model_validate(account)


@router.get("/workspaces/{workspace_id}/accounts", response_model=List[AccountResponse])
def list_workspace_accounts(
    workspace_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Compatibility route for workspace accounts."""
    target_id = workspace_id or workspace.id
    accounts = (
        db.query(Account)
        .filter(Account.workspace_id == target_id)
        .order_by(Account.balance.desc())
        .all()
    )
    return [AccountResponse.model_validate(a) for a in accounts]
