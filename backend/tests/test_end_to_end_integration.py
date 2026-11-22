import io
from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient


def test_complete_14_step_integration_lifecycle(client: TestClient):
    """Execute the complete 14-step integration test specified by the integration requirements."""

    # -------------------------------------------------------------
    # Step 1: Register a demo user
    # -------------------------------------------------------------
    reg_payload = {
        "email": "lead_integrator@arthaflow.ai",
        "password": "strongPassword123",
        "full_name": "Vikram Patel",
    }
    res_reg = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_reg.status_code == 201, f"Step 1 Failed: {res_reg.text}"
    reg_data = res_reg.json()
    token = reg_data["access_token"]
    user_id = reg_data["user"]["id"]
    assert token and user_id

    auth_headers = {"Authorization": f"Bearer {token}"}

    # -------------------------------------------------------------
    # Step 2: Create a workspace
    # -------------------------------------------------------------
    ws_payload = {
        "name": "Vikram Textiles & Garments",
        "mode": "business",
        "currency": "INR",
        "starting_cash": 150000.0,
    }
    res_ws = client.post("/api/v1/workspaces", headers=auth_headers, json=ws_payload)
    assert res_ws.status_code == 201, f"Step 2 Failed: {res_ws.text}"
    ws = res_ws.json()
    workspace_id = ws["id"]
    assert ws["name"] == "Vikram Textiles & Garments"
    assert ws["starting_cash"] == 150000.0

    # Attach workspace header for all subsequent calls
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Workspace-Id": workspace_id,
    }

    # -------------------------------------------------------------
    # Step 3: Import a sample CSV
    # -------------------------------------------------------------
    sample_csv_content = (
        "Date,Description,Amount,Type,Category,Counterparty\n"
        "2026-11-01,Ananya Silk House Wholesale,45000,income,Wholesale,Ananya Silk\n"
        "2026-11-03,Surat Yarn Suppliers Lot 1,18500,expense,Raw Material,Surat Yarn\n"
        "2026-11-03,Surat Yarn Suppliers Duplicate,18500,expense,Raw Material,Surat Yarn\n"
        "2026-11-05,Commercial Unit Rent,25000,expense,Rent,Landlord Realty\n"
        "2026-11-08,Staff Monthly Payroll,35000,expense,Payroll,Staff\n"
        "2026-11-12,Retail Boutique Cash Sales,62000,income,Retail Sales,Walk-in Customers\n"
    )
    csv_file = io.BytesIO(sample_csv_content.encode("utf-8"))
    files = {"file": ("statement_nov_2026.csv", csv_file, "text/csv")}

    res_csv = client.post("/api/v1/transactions/import", headers=headers, files=files)
    assert res_csv.status_code == 200, f"Step 3 Failed: {res_csv.text}"
    csv_summary = res_csv.json()
    assert csv_summary["total_rows"] == 6
    assert csv_summary["imported_count"] == 6

    # -------------------------------------------------------------
    # Step 4: Verify imported transactions
    # -------------------------------------------------------------
    res_tx = client.get("/api/v1/transactions", headers=headers)
    assert res_tx.status_code == 200, f"Step 4 Failed: {res_tx.text}"
    transactions = res_tx.json()
    assert len(transactions) >= 6
    desc_list = [t["description"] for t in transactions]
    assert "Ananya Silk House Wholesale" in desc_list
    assert "Commercial Unit Rent" in desc_list

    # -------------------------------------------------------------
    # Step 5: Open the dashboard
    # -------------------------------------------------------------
    res_dash = client.get("/api/v1/dashboard/overview", headers=headers)
    assert res_dash.status_code == 200, f"Step 5 Failed: {res_dash.text}"
    dashboard = res_dash.json()
    assert dashboard["workspace_id"] == workspace_id
    assert dashboard["workspace_name"] == "Vikram Textiles & Garments"

    # -------------------------------------------------------------
    # Step 6: Verify financial totals
    # -------------------------------------------------------------
    # Starting Cash: 150,000
    # Inflow: 45,000 + 62,000 = 107,000
    # Outflow: 18,500 + 18,500 + 25,000 + 35,000 = 97,000
    # Net: 107,000 - 97,000 = +10,000
    # Ending Available Cash: 150,000 + 10,000 = 160,000
    res_summary = client.get("/api/v1/transactions/summary", headers=headers)
    assert res_summary.status_code == 200, f"Step 6 Failed: {res_summary.text}"
    fin_summary = res_summary.json()
    assert fin_summary["total_income"] == 107000.0
    assert fin_summary["total_expenses"] == 97000.0
    assert fin_summary["net_cash_flow"] == 10000.0
    assert dashboard["total_available_cash"] == 160000.0

    # -------------------------------------------------------------
    # Step 7: View the Digital Twin
    # -------------------------------------------------------------
    res_twin = client.get("/api/v1/digital-twin", headers=headers)
    assert res_twin.status_code == 200, f"Step 7 Failed: {res_twin.text}"
    twin = res_twin.json()
    assert twin["total_available_cash"] == 160000.0
    assert twin["financial_health_score"] > 0
    assert twin["financial_vitality"] in ["Critical", "Vulnerable", "Stable", "Robust", "Exceptional"]
    assert "runway_score" in twin["health_breakdown"]

    # -------------------------------------------------------------
    # Step 8: Generate 7-day and 30-day forecasts
    # -------------------------------------------------------------
    # 7-day
    res_fc7 = client.get("/api/v1/forecasts?horizon_days=7", headers=headers)
    assert res_fc7.status_code == 200, f"Step 8 (7-day) Failed: {res_fc7.text}"
    fc7 = res_fc7.json()
    assert len(fc7["daily_forecasts"]) == 7
    assert fc7["starting_balance"] == 160000.0

    # 30-day
    res_fc30 = client.get("/api/v1/forecasts?horizon_days=30", headers=headers)
    assert res_fc30.status_code == 200, f"Step 8 (30-day) Failed: {res_fc30.text}"
    fc30 = res_fc30.json()
    assert len(fc30["daily_forecasts"]) == 30
    assert fc30["lowest_balance"] > 0
    assert fc30["safety_buffer"] == 40000.0

    # -------------------------------------------------------------
    # Step 9: Generate risk alerts
    # -------------------------------------------------------------
    res_risks = client.get("/api/v1/risks", headers=headers)
    assert res_risks.status_code == 200, f"Step 9 Failed: {res_risks.text}"
    risks = res_risks.json()
    # Duplicate charge detection should detect the two identical 18,500 Surat Yarn charges
    duplicate_alert = next((r for r in risks if r["category"] == "duplicate_payment"), None)
    assert duplicate_alert is not None, "Duplicate risk alert was not triggered"
    assert duplicate_alert["financial_impact"] == 18500.0
    assert duplicate_alert["severity"] in ["high", "critical", "medium"]

    # -------------------------------------------------------------
    # Step 10: Run a ₹50,000 inventory purchase scenario
    # -------------------------------------------------------------
    sim_payload = {
        "title": "Purchase ₹50,000 Seasonal Fabric Inventory",
        "scenario_type": "capex",
        "parameters": {
            "outflow_amount": 50000.0,
            "upfront_percentage": 30.0,
            "deferred_days": 30,
            "expected_sales_uplift": 115000.0,
        },
    }
    res_sim = client.post("/api/v1/simulations", headers=headers, json=sim_payload)
    assert res_sim.status_code == 201, f"Step 10 Failed: {res_sim.text}"
    sim = res_sim.json()
    assert sim["title"] == "Purchase ₹50,000 Seasonal Fabric Inventory"
    assert sim["verdict"] == "SAFE"
    assert sim["net_impact"] > 0
    assert len(sim["trajectory_data"]) > 0

    # -------------------------------------------------------------
    # Step 11: Ask the AI agent to explain the result
    # -------------------------------------------------------------
    ai_payload = {
        "message": "Can I afford to purchase 50000 fabric inventory today?",
        "history": [],
    }
    res_ai = client.post("/api/v1/ai/chat", headers=headers, json=ai_payload)
    assert res_ai.status_code == 200, f"Step 11 Failed: {res_ai.text}"
    ai_response = res_ai.json()
    assert len(ai_response["tool_calls_executed"]) > 0
    assert ai_response["tool_calls_executed"][0]["tool_name"] == "run_what_if_simulation"
    assert len(ai_response["verified_figures"]) > 0
    assert "SAFE" in ai_response["content"] or "Upfront" in ai_response["content"]

    # -------------------------------------------------------------
    # Step 12: Save the simulation as a decision
    # -------------------------------------------------------------
    decision_payload = {
        "scenario_id": sim["id"],
        "title": "Procure ₹50,000 Seasonal Fabric on 30% Advance",
        "category": "CapEx / Procurement",
        "hypothesis": "Splitting payment into 30% advance preserves buffer while unlocking ₹1,15,000 sales uplift.",
        "assumptions": [
            "Vendor accepts 30% advance with Net 30 balance",
            "Wholesale uplift begins materializing on Day 8",
        ],
        "expected_outcomes": [
            {
                "metric": "Lowest Cash Dip",
                "expected_value": f"₹{sim['lowest_cash_dip']:,.0f}",
                "timeframe": "Day 6",
            },
            {
                "metric": "Break-Even Day",
                "expected_value": f"Day {int(sim['break_even_day'] or 22)}",
                "timeframe": "Day 22",
            },
            {
                "metric": "Net 30-Day Liquidity Gain",
                "expected_value": f"+₹{sim['net_impact']:,.0f}",
                "timeframe": "Day 30",
            },
        ],
        "notes": "Verified safe by ArthaFlow deterministic scenario engine.",
    }
    res_dec = client.post("/api/v1/decisions", headers=headers, json=decision_payload)
    assert res_dec.status_code == 201, f"Step 12 Failed: {res_dec.text}"
    decision = res_dec.json()
    decision_id = decision["id"]
    assert decision["title"] == "Procure ₹50,000 Seasonal Fabric on 30% Advance"
    assert len(decision["expected_outcomes"]) == 3

    # -------------------------------------------------------------
    # Step 13: Record a sample actual outcome
    # -------------------------------------------------------------
    outcome_payload = {
        "metric": "Lowest Cash Dip",
        "actual_value": f"₹{sim['lowest_cash_dip'] + 800:,.0f}",
        "variance_percentage": 1.2,
        "verdict": "met",
        "notes": "Actual cash buffer dipped within 1.2% of simulation model prediction.",
    }
    res_outcome = client.post(
        f"/api/v1/decisions/{decision_id}/outcome",
        headers=headers,
        json=outcome_payload,
    )
    assert res_outcome.status_code == 201, f"Step 13 Failed: {res_outcome.text}"
    outcome = res_outcome.json()
    assert outcome["metric"] == "Lowest Cash Dip"
    assert outcome["verdict"] == "met"

    # -------------------------------------------------------------
    # Step 14: Verify the decision comparison
    # -------------------------------------------------------------
    res_dec_list = client.get("/api/v1/decisions", headers=headers)
    assert res_dec_list.status_code == 200, f"Step 14 Failed: {res_dec_list.text}"
    dec_list = res_dec_list.json()
    saved_dec = next((d for d in dec_list if d["id"] == decision_id), None)
    assert saved_dec is not None
    assert len(saved_dec["outcomes"]) >= 1
    assert saved_dec["outcomes"][0]["verdict"] == "met"
    assert saved_dec["outcomes"][0]["variance_percentage"] == 1.2
