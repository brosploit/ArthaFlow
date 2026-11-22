from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel, utc_now


class Workspace(TimeStampedModel):
    __tablename__ = "workspaces"

    name = Column(String(255), nullable=False)
    mode = Column(String(50), default="business", nullable=False)  # "business" or "individual"
    currency = Column(String(10), default="INR", nullable=False)
    starting_cash = Column(Float, default=0.0, nullable=False)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    owner = relationship("User", back_populates="owned_workspaces")
    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    accounts = relationship("Account", back_populates="workspace", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="workspace", cascade="all, delete-orphan")
    categories = relationship("TransactionCategory", back_populates="workspace", cascade="all, delete-orphan")
    recurring_transactions = relationship("RecurringTransaction", back_populates="workspace", cascade="all, delete-orphan")
    snapshots = relationship("FinancialSnapshot", back_populates="workspace", cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="workspace", cascade="all, delete-orphan")
    risk_alerts = relationship("RiskAlert", back_populates="workspace", cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="workspace", cascade="all, delete-orphan")
    decisions = relationship("Decision", back_populates="workspace", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="workspace", cascade="all, delete-orphan")


class WorkspaceMember(TimeStampedModel):
    __tablename__ = "workspace_members"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), default="member", nullable=False)  # "owner", "admin", "member", "viewer"

    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="memberships")
