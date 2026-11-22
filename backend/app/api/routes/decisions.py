from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.intelligence import Decision, DecisionOutcome
from app.schemas.decision import (
    DecisionCreate,
    DecisionResponse,
    DecisionOutcomeCreate,
    DecisionOutcomeResponse,
)
from app.api.deps import get_current_workspace

router = APIRouter(prefix="/decisions", tags=["Decision Memory"])


@router.post("", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED)
def create_decision(
    req: DecisionCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Preserve a financial decision, hypothesis, and expected outcomes."""
    today = date.today()
    decision = Decision(
        workspace_id=workspace.id,
        scenario_id=req.scenario_id,
        title=req.title,
        category=req.category,
        hypothesis=req.hypothesis,
        assumptions=req.assumptions,
        expected_outcomes=[o.model_dump() for o in req.expected_outcomes],
        status="active",
        decision_date=req.decision_date or today,
        evaluation_date=req.evaluation_date or (today + date.resolution * 30),
        notes=req.notes,
    )
    db.add(decision)
    db.commit()
    db.refresh(decision)
    return DecisionResponse.model_validate(decision)


@router.get("", response_model=List[DecisionResponse])
def list_decisions(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """List preserved decisions and compare expected vs actual outcomes."""
    decisions = (
        db.query(Decision)
        .filter(Decision.workspace_id == workspace.id)
        .order_by(Decision.created_at.desc())
        .all()
    )
    return [DecisionResponse.model_validate(d) for d in decisions]


@router.post("/{decision_id}/outcome", response_model=DecisionOutcomeResponse, status_code=status.HTTP_201_CREATED)
def record_decision_outcome(
    decision_id: str,
    req: DecisionOutcomeCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Record an observed real-world outcome and evaluate variance against modeled hypothesis."""
    dec = (
        db.query(Decision)
        .filter(Decision.id == decision_id, Decision.workspace_id == workspace.id)
        .first()
    )
    if not dec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Decision memory record not found.")

    outcome = DecisionOutcome(
        decision_id=dec.id,
        metric=req.metric,
        expected_value="Modeled Target",
        actual_value=req.actual_value,
        variance_percentage=req.variance_percentage,
        verdict=req.verdict,
        notes=req.notes,
    )
    db.add(outcome)
    
    # Update decision status to evaluated if active
    if dec.status == "active":
        dec.status = "evaluated"

    db.commit()
    db.refresh(outcome)
    return DecisionOutcomeResponse.model_validate(outcome)
