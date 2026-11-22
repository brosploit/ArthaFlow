from sqlalchemy import Column, String, Float, Boolean, Date, DateTime, ForeignKey, Index, JSON, Text
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel, utc_now


class Forecast(TimeStampedModel):
    __tablename__ = "forecasts"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    generated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    horizon_days = Column(Float, default=30.0, nullable=False)
    starting_balance = Column(Float, nullable=False)
    ending_balance = Column(Float, nullable=False)
    net_change = Column(Float, nullable=False)
    lowest_balance = Column(Float, nullable=False)
    lowest_balance_date = Column(Date, nullable=False)
    safety_buffer = Column(Float, default=40000.0, nullable=False)
    shortage_detected = Column(Boolean, default=False, nullable=False)
    daily_data = Column(JSON, nullable=False)
    assumptions = Column(JSON, nullable=True)

    workspace = relationship("Workspace", back_populates="forecasts")


class RiskAlert(TimeStampedModel):
    __tablename__ = "risk_alerts"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)  # duplicate_payment, cash_buffer_breach, overdue_receivable, etc.
    severity = Column(String(50), default="medium", nullable=False)  # critical, high, medium, low
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    financial_impact = Column(Float, default=0.0, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    suggested_action = Column(Text, nullable=False)
    related_entity = Column(String(255), nullable=True)
    related_transactions = Column(JSON, nullable=True)
    detected_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    workspace = relationship("Workspace", back_populates="risk_alerts")


class Simulation(TimeStampedModel):
    __tablename__ = "simulations"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    scenario_type = Column(String(100), nullable=False)  # capex, delayed_receivable, revenue_shock, etc.
    parameters = Column(JSON, nullable=False)
    baseline_runway_days = Column(Float, default=0.0, nullable=False)
    simulated_runway_days = Column(Float, default=0.0, nullable=False)
    runway_delta_days = Column(Float, default=0.0, nullable=False)
    baseline_ending_cash = Column(Float, nullable=False)
    simulated_ending_cash = Column(Float, nullable=False)
    net_impact = Column(Float, nullable=False)
    lowest_cash_dip = Column(Float, nullable=False)
    lowest_cash_date = Column(Date, nullable=False)
    break_even_day = Column(Float, nullable=True)
    verdict = Column(String(50), default="SAFE", nullable=False)  # SAFE, CAUTION, HIGH_RISK
    risk_level = Column(String(50), default="low", nullable=False)
    confidence_score = Column(Float, default=90.0, nullable=False)
    rule_based_advice = Column(JSON, nullable=True)
    trajectory_data = Column(JSON, nullable=False)

    workspace = relationship("Workspace", back_populates="simulations")
    decisions = relationship("Decision", back_populates="simulation")


class Decision(TimeStampedModel):
    __tablename__ = "decisions"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    scenario_id = Column(String(36), ForeignKey("simulations.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="General", nullable=False)
    hypothesis = Column(Text, nullable=False)
    assumptions = Column(JSON, nullable=True)
    expected_outcomes = Column(JSON, nullable=False)
    status = Column(String(50), default="active", nullable=False)  # active, evaluated, superseded, abandoned
    decision_date = Column(Date, nullable=False)
    evaluation_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)

    workspace = relationship("Workspace", back_populates="decisions")
    simulation = relationship("Simulation", back_populates="decisions")
    outcomes = relationship("DecisionOutcome", back_populates="decision", cascade="all, delete-orphan")


class DecisionOutcome(TimeStampedModel):
    __tablename__ = "decision_outcomes"

    decision_id = Column(String(36), ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False, index=True)
    metric = Column(String(255), nullable=False)
    expected_value = Column(String(100), nullable=False)
    actual_value = Column(String(100), nullable=False)
    variance_percentage = Column(Float, nullable=True)
    verdict = Column(String(50), default="pending", nullable=False)  # exceeded, met, missed, pending
    evaluated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    notes = Column(Text, nullable=True)

    decision = relationship("Decision", back_populates="outcomes")


class AuditLog(TimeStampedModel):
    __tablename__ = "audit_logs"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False)  # create_transaction, upload_csv, run_simulation, etc.
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(36), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)

    workspace = relationship("Workspace", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
