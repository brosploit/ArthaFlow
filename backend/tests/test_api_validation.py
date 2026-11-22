def test_validation_invalid_workspace_mode(client, auth_headers):
    # Mode must be 'business' or 'individual'
    res = client.post(
        "/api/v1/workspaces",
        headers=auth_headers,
        json={"name": "Bad Mode", "mode": "invalid_mode", "currency": "INR"},
    )
    assert res.status_code == 422


def test_validation_negative_starting_cash(client, auth_headers):
    # Starting cash cannot be negative
    res = client.post(
        "/api/v1/workspaces",
        headers=auth_headers,
        json={"name": "Negative Cash", "mode": "business", "starting_cash": -500.0},
    )
    assert res.status_code == 422


def test_ai_chat_deterministic_tool_execution(client, auth_headers):
    res = client.post(
        "/api/v1/ai/chat",
        headers=auth_headers,
        json={"message": "Can I afford to purchase 50000 fabric inventory today?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["tool_calls_executed"]) > 0
    assert data["tool_calls_executed"][0]["tool_name"] == "run_what_if_simulation"
    assert len(data["verified_figures"]) > 0
    assert "SAFE" in data["content"] or "Upfront" in data["content"]


def test_decision_memory_lifecycle(client, auth_headers):
    # Create decision
    create_payload = {
        "title": "Vendor Transition to Net 30",
        "category": "Terms",
        "hypothesis": "Negotiating 30-day terms will preserve ₹35k cash buffer.",
        "expected_outcomes": [
            {"metric": "Lowest Cash Dip", "expected_value": "₹53,200", "timeframe": "Day 6"}
        ],
    }
    res = client.post("/api/v1/decisions", headers=auth_headers, json=create_payload)
    assert res.status_code == 201
    dec_id = res.json()["id"]

    # Record actual outcome
    outcome_payload = {
        "metric": "Lowest Cash Dip",
        "actual_value": "₹54,100",
        "variance_percentage": 1.7,
        "verdict": "met",
    }
    res_outcome = client.post(f"/api/v1/decisions/{dec_id}/outcome", headers=auth_headers, json=outcome_payload)
    assert res_outcome.status_code == 201
    assert res_outcome.json()["verdict"] == "met"


def test_production_health_check_endpoints(client):
    """Verify both /health and /api/v1/health probe active database connectivity."""
    for path in ["/health", "/api/v1/health"]:
        res = client.get(path)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        assert "version" in data
        assert "platform" in data

