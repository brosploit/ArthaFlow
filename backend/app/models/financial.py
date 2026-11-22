from sqlalchemy import Column, String, Float, Boolean, Date, DateTime, ForeignKey, Index, JSON, Text
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel, utc_now


class Account(TimeStampedModel):
    __tablename__ = "accounts"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), default="checking", nullable=False)  # checking, savings, credit, wallet, escrow
    institution = Column(String(255), nullable=False)
    account_number_mask = Column(String(50), default="••••", nullable=False)
    balance = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_synced_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    workspace = relationship("Workspace", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")


class TransactionCategory(TimeStampedModel):
    __tablename__ = "transaction_categories"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), default="expense", nullable=False)  # income, expense, transfer
    color = Column(String(20), default="#10b981", nullable=False)

    workspace = relationship("Workspace", back_populates="categories")


class Transaction(TimeStampedModel):
    __tablename__ = "transactions"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id = Column(String(36), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True, index=True)
    
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String(50), nullable=False)  # income, expense, transfer
    category = Column(String(100), default="Uncategorized", nullable=False, index=True)
    description = Column(String(500), nullable=False)
    counterparty = Column(String(255), default="Unknown", nullable=False)
    status = Column(String(50), default="cleared", nullable=False)  # cleared, pending, flagged
    is_recurring = Column(Boolean, default=False, nullable=False)
    reference_no = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    hash_fingerprint = Column(String(64), nullable=True, index=True)
    raw_data = Column(JSON, nullable=True)

    workspace = relationship("Workspace", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")

    __table_args__ = (
        Index("idx_transactions_ws_date", "workspace_id", "date"),
        Index("idx_transactions_ws_hash", "workspace_id", "hash_fingerprint"),
    )


class RecurringTransaction(TimeStampedModel):
    __tablename__ = "recurring_transactions"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), default="expense", nullable=False)  # income, expense
    category = Column(String(100), default="Operating", nullable=False)
    amount = Column(Float, nullable=False)
    frequency = Column(String(50), default="monthly", nullable=False)  # daily, weekly, monthly, quarterly, yearly
    next_due_date = Column(Date, nullable=False)
    counterparty = Column(String(255), default="Vendor", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    workspace = relationship("Workspace", back_populates="recurring_transactions")


class FinancialSnapshot(TimeStampedModel):
    __tablename__ = "financial_snapshots"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    snapshot_date = Column(Date, nullable=False, index=True)
    total_cash = Column(Float, nullable=False)
    monthly_burn_rate = Column(Float, default=0.0, nullable=False)
    monthly_run_rate = Column(Float, default=0.0, nullable=False)
    runway_days = Column(Float, default=0.0, nullable=False)
    health_score = Column(Float, default=0.0, nullable=False)
    data = Column(JSON, nullable=True)

    workspace = relationship("Workspace", back_populates="snapshots")
