from typing import List
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.financial import Transaction, RecurringTransaction
from app.schemas.digital_twin import DigitalTwinResponse, TimelineResponse, TimelineEvent
from app.api.deps import get_current_workspace
from app.financial_engine.calculator import calculate_digital_twin_metrics

router = APIRouter(prefix="/digital-twin", tags=["Digital Twin"])


@router.get("", response_model=DigitalTwinResponse)
def get_digital_twin(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Retrieve full unified time-aware representation of the Financial Digital Twin."""
    twin_data = calculate_digital_twin_metrics(db, workspace)
    return DigitalTwinResponse(**twin_data)


@router.get("/timeline", response_model=TimelineResponse)
def get_digital_twin_timeline(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Retrieve chronologically mapped inflows, pending obligations, and recurring schedules."""
    today = date.today()
    events: List[TimelineEvent] = []

    # 1. Pending transactions
    pending_txs = (
        db.query(Transaction)
        .filter(Transaction.workspace_id == workspace.id, Transaction.status == "pending")
        .order_by(Transaction.date.asc())
        .limit(20)
        .all()
    )
    for tx in pending_txs:
        events.append(
            TimelineEvent(
                id=tx.id,
                date=tx.date,
                title=tx.description,
                type="inflow" if tx.type == "income" else "outflow",
                amount=tx.amount,
                category=tx.category,
                is_recurring=tx.is_recurring,
            )
        )

    # 2. Recurring schedules
    recurring_items = (
        db.query(RecurringTransaction)
        .filter(RecurringTransaction.workspace_id == workspace.id, RecurringTransaction.is_active.is_(True))
        .all()
    )
    for rec in recurring_items:
        events.append(
            TimelineEvent(
                id=rec.id,
                date=rec.next_due_date,
                title=f"Recurring: {rec.name}",
                type="inflow" if rec.type == "income" else "outflow",
                amount=rec.amount,
                category=rec.category,
                is_recurring=True,
            )
        )

    # Default representative milestones if DB is newly seeded
    if not events:
        events = [
            TimelineEvent(
                id="evt-1",
                date=today + timedelta(days=2),
                title="Freight Logistics Payment (BlueDart)",
                type="outflow",
                amount=8400.0,
                category="Logistics",
                is_recurring=True,
            ),
            TimelineEvent(
                id="evt-2",
                date=today + timedelta(days=4),
                title="Confirmed Customer Receivable (Heritage Silks)",
                type="inflow",
                amount=54000.0,
                category="Wholesale",
                is_recurring=False,
            ),
            TimelineEvent(
                id="evt-3",
                date=today + timedelta(days=5),
                title="Staff Monthly Payroll",
                type="outflow",
                amount=45000.0,
                category="Payroll",
                is_recurring=True,
            ),
            TimelineEvent(
                id="evt-4",
                date=today + timedelta(days=8),
                title="Overdue Boutique Clearance (Kala Kendra)",
                type="inflow",
                amount=28500.0,
                category="Wholesale",
                is_recurring=False,
            ),
            TimelineEvent(
                id="evt-5",
                date=today + timedelta(days=10),
                title="Raw Fabric Lot Settlement (Ahmedabad Weaver)",
                type="outflow",
                amount=35000.0,
                category="Raw Material",
                is_recurring=False,
            ),
        ]

    events.sort(key=lambda x: x.date)
    return TimelineResponse(workspace_id=workspace.id, events=events)
