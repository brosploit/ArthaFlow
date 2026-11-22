from datetime import date
from app.models.financial import Transaction, Account
from app.financial_engine.calculator import calculate_financial_summary, get_available_cash, calculate_digital_twin_metrics


def test_deterministic_financial_calculations(db, test_workspace):
    # Add known income and expenses
    t1 = Transaction(
        workspace_id=test_workspace.id,
        date=date.today(),
        amount=50000.0,
        type="income",
        category="Sales",
        description="Client Retainer",
        counterparty="Client A",
        status="cleared",
    )
    t2 = Transaction(
        workspace_id=test_workspace.id,
        date=date.today(),
        amount=20000.0,
        type="expense",
        category="Rent",
        description="Office Lease",
        counterparty="Landlord",
        status="cleared",
    )
    t3 = Transaction(
        workspace_id=test_workspace.id,
        date=date.today(),
        amount=5000.0,
        type="expense",
        category="Utilities",
        description="Electricity bill",
        counterparty="Power Corp",
        status="cleared",
    )
    db.add_all([t1, t2, t3])
    db.commit()

    summary = calculate_financial_summary(db, test_workspace.id)
    assert summary["total_income"] == 50000.0
    assert summary["total_expenses"] == 25000.0
    assert summary["net_cash_flow"] == 25000.0
    assert summary["category_breakdown"]["Rent"] == 20000.0
    assert summary["category_breakdown"]["Utilities"] == 5000.0


def test_available_cash_convention(db, test_workspace):
    # With accounts present, cash must equal sum of active accounts, not historical totals
    acc1 = Account(
        workspace_id=test_workspace.id,
        name="HDFC Current",
        institution="HDFC",
        balance=78400.0,
        currency="INR",
        is_active=True,
    )
    acc2 = Account(
        workspace_id=test_workspace.id,
        name="ICICI Ops",
        institution="ICICI",
        balance=32600.0,
        currency="INR",
        is_active=True,
    )
    db.add_all([acc1, acc2])
    db.commit()

    cash = get_available_cash(db, test_workspace)
    assert cash == 111000.0  # 78400 + 32600


def test_digital_twin_health_score(db, test_workspace):
    metrics = calculate_digital_twin_metrics(db, test_workspace)
    assert "liquidity_runway_days" in metrics
    assert "financial_health_score" in metrics
    assert 0 <= metrics["financial_health_score"] <= 100
    assert metrics["financial_vitality"] in ["Critical", "Vulnerable", "Stable", "Robust"]
