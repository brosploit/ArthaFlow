def test_capex_what_if_simulation_safe(client, auth_headers):
    # CapEx ₹50k with 30% advance and 115k uplift should result in SAFE verdict
    payload = {
        "title": "Purchase Fabric Inventory",
        "scenario_type": "capex",
        "parameters": {
            "outflow_amount": 50000.0,
            "upfront_percentage": 30.0,
            "deferred_days": 30,
            "expected_sales_uplift": 115000.0,
        },
    }
    res = client.post("/api/v1/simulations", headers=auth_headers, json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["scenario_type"] == "capex"
    assert data["verdict"] == "SAFE"
    assert data["break_even_day"] is not None
    assert data["net_impact"] > 0
    assert len(data["trajectory_data"]) == 30


def test_capex_simulation_buffer_breach(client, auth_headers):
    # CapEx ₹140k with 100% upfront on ₹120k cash should cause emergency buffer breach
    payload = {
        "title": "Massive Machinery Purchase",
        "scenario_type": "capex",
        "parameters": {
            "outflow_amount": 140000.0,
            "upfront_percentage": 100.0,
            "deferred_days": 0,
            "expected_sales_uplift": 10000.0,
        },
    }
    res = client.post("/api/v1/simulations", headers=auth_headers, json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["verdict"] in ["CAUTION", "HIGH_RISK"]
    assert data["lowest_cash_dip"] < 40000.0
