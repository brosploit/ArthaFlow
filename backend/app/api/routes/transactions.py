from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.workspace import Workspace
from app.models.financial import Transaction
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionSummaryResponse,
    CSVImportSummary,
)
from app.api.deps import get_current_user, get_current_workspace
from app.services.csv_service import process_csv_file
from app.financial_engine.calculator import calculate_financial_summary
from app.services.audit_service import log_action

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/import", response_model=CSVImportSummary)
async def import_csv_statement(
    file: UploadFile = File(...),
    account_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Upload and validate bank statement CSV using the 10-step ingestion pipeline."""
    # Validate extension
    filename = file.filename or "statement.csv"
    if not (filename.endswith(".csv") or filename.endswith(".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CSV files (.csv, .txt) are supported.",
        )

    # Validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_CSV_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_CSV_UPLOAD_BYTES // (1024*1024)}MB.",
        )

    summary = process_csv_file(
        db=db,
        workspace_id=workspace.id,
        file_bytes=contents,
        filename=filename,
        default_account_id=account_id,
    )

    log_action(
        db=db,
        workspace_id=workspace.id,
        user_id=current_user.id,
        action="import_csv_statement",
        entity_type="transaction",
        details={
            "filename": filename,
            "imported": summary.imported_count,
            "duplicates": summary.duplicate_count,
            "skipped": summary.skipped_count,
        },
    )

    return summary


@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    type: Optional[str] = Query(None, pattern="^(income|expense|transfer)$"),
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Retrieve filterable, paginated transactions for the active workspace."""
    query = db.query(Transaction).filter(Transaction.workspace_id == workspace.id)

    if type:
        query = query.filter(Transaction.type == type)
    if category:
        query = query.filter(Transaction.category == category)
    if status:
        query = query.filter(Transaction.status == status)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Transaction.description.ilike(pattern))
            | (Transaction.counterparty.ilike(pattern))
            | (Transaction.category.ilike(pattern))
            | (Transaction.reference_no.ilike(pattern))
        )

    txs = query.order_by(Transaction.date.desc(), Transaction.created_at.desc()).offset(skip).limit(limit).all()
    return [TransactionResponse.model_validate(t) for t in txs]


@router.get("/summary", response_model=TransactionSummaryResponse)
def get_transaction_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Retrieve deterministic financial summary and category breakdown."""
    summary = calculate_financial_summary(db, workspace.id, start_date=start_date, end_date=end_date)
    return TransactionSummaryResponse(**summary)


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction_detail(
    transaction_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Retrieve a single transaction ensuring workspace isolation."""
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.workspace_id == workspace.id)
        .first()
    )
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found in this workspace.")
    return TransactionResponse.model_validate(tx)
