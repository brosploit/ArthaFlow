from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.intelligence import RiskAlert
from app.schemas.risk import RiskAlertResponse, RiskAnalyzeRequest
from app.api.deps import get_current_workspace
from app.risk_engine.detector import run_risk_analysis

router = APIRouter(prefix="/risks", tags=["Risk Intelligence"])


@router.get("", response_model=List[RiskAlertResponse])
def get_risk_alerts(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Retrieve explainable risk alerts (duplicate debits, overdue concentration, buffer squeeze)."""
    alerts = run_risk_analysis(db, workspace)
    return [RiskAlertResponse.model_validate(a) for a in alerts]


@router.post("/analyze", response_model=List[RiskAlertResponse])
def trigger_risk_audit(
    req: RiskAnalyzeRequest,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Re-run deterministic risk audit across current ledger records."""
    alerts = run_risk_analysis(db, workspace)
    return [RiskAlertResponse.model_validate(a) for a in alerts]


@router.post("/{alert_id}/resolve", response_model=RiskAlertResponse)
def resolve_risk_alert(
    alert_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Mark an audited risk alert as reviewed and resolved."""
    alert = (
        db.query(RiskAlert)
        .filter(RiskAlert.id == alert_id, RiskAlert.workspace_id == workspace.id)
        .first()
    )
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk alert not found.")

    alert.is_resolved = True
    db.commit()
    db.refresh(alert)
    return RiskAlertResponse.model_validate(alert)
