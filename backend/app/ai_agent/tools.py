from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.workspace import Workspace
from app.financial_engine.calculator import calculate_digital_twin_metrics, calculate_financial_summary
from app.forecasting.engine import generate_cash_forecast
from app.financial_engine.simulation import execute_simulation
from app.risk_engine.detector import run_risk_analysis


def tool_get_digital_twin(db: Session, workspace: Workspace) -> Dict[str, Any]:
    """Verified Tool: Retrieves exact real-time Digital Twin liquidity and runway."""
    return calculate_digital_twin_metrics(db, workspace)


def tool_get_cash_forecast(db: Session, workspace: Workspace, days: int = 30) -> Dict[str, Any]:
    """Verified Tool: Computes forward-looking deterministic cash trajectory."""
    return generate_cash_forecast(db, workspace, horizon_days=days)


def tool_run_what_if_simulation(
    db: Session,
    workspace: Workspace,
    scenario_type: str,
    parameters: Dict[str, Any],
) -> Dict[str, Any]:
    """Verified Tool: Simulates hypothetical financial decisions and returns delta metrics."""
    title = f"AI Agent Simulation: {scenario_type}"
    sim = execute_simulation(db, workspace, title, scenario_type, parameters)
    return {
        "verdict": sim.verdict,
        "lowest_cash_dip": sim.lowest_cash_dip,
        "break_even_day": sim.break_even_day,
        "net_impact": sim.net_impact,
        "rule_based_advice": sim.rule_based_advice,
    }


def tool_get_risk_alerts(db: Session, workspace: Workspace) -> List[Dict[str, Any]]:
    """Verified Tool: Audits active ledger anomalies and risk alerts."""
    alerts = run_risk_analysis(db, workspace)
    return [
        {
            "id": a.id,
            "category": a.category,
            "severity": a.severity,
            "title": a.title,
            "financial_impact": a.financial_impact,
            "explanation": a.explanation,
        }
        for a in alerts
        if not a.is_resolved
    ]
