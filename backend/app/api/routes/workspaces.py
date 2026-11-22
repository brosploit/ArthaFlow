from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.get("", response_model=List[WorkspaceResponse])
def list_workspaces(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all workspaces owned by or shared with the authenticated user."""
    # Workspaces where user is owner or member
    owned = db.query(Workspace).filter(Workspace.owner_id == current_user.id).all()
    member_workspaces = (
        db.query(Workspace)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .filter(WorkspaceMember.user_id == current_user.id)
        .all()
    )
    all_ws = {w.id: w for w in (owned + member_workspaces)}.values()
    return [WorkspaceResponse.model_validate(w) for w in all_ws]


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(
    ws_in: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new isolated financial workspace."""
    ws = Workspace(
        name=ws_in.name,
        mode=ws_in.mode,
        currency=ws_in.currency,
        starting_cash=ws_in.starting_cash,
        owner_id=current_user.id,
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    member = WorkspaceMember(workspace_id=ws.id, user_id=current_user.id, role="owner")
    db.add(member)
    db.commit()

    return WorkspaceResponse.model_validate(ws)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve details of a specific workspace enforcing authorization."""
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found.")

    is_authorized = (
        ws.owner_id == current_user.id
        or db.query(WorkspaceMember)
        .filter(WorkspaceMember.workspace_id == ws.id, WorkspaceMember.user_id == current_user.id)
        .first()
        is not None
        or current_user.is_superuser
    )

    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace.")

    return WorkspaceResponse.model_validate(ws)
