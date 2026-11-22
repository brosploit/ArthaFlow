from datetime import date
from app.models.financial import Transaction


def test_duplicate_charge_detection(client, db, test_workspace, auth_headers):
    # Insert two identical debits within 24 hours
    t1 = Transaction(
        workspace_id=test_workspace.id,
        date=date.today(),
        amount=18500.0,
        type="expense",
        category="Raw Material",
        description="Surat Cotton Mills - Lot A",
        counterparty="Surat Cotton Mills",
        status="cleared",
    )
    t2 = Transaction(
        workspace_id=test_workspace.id,
        date=date.today(),
        amount=18500.0,
        type="expense",
        category="Raw Material",
        description="Surat Cotton Mills - Lot B",
        counterparty="Surat Cotton Mills",
        status="cleared",
    )
    db.add_all([t1, t2])
    db.commit()

    res = client.get("/api/v1/risks", headers=auth_headers)
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) >= 1
    dup_alert = next((a for a in alerts if a["category"] == "duplicate_payment"), None)
    assert dup_alert is not None
    assert dup_alert["financial_impact"] == 18500.0


def test_resolve_risk_alert(client, auth_headers):
    res = client.get("/api/v1/risks", headers=auth_headers)
    alerts = res.json()
    assert len(alerts) > 0
    target_id = alerts[0]["id"]

    res_resolve = client.post(f"/api/v1/risks/{target_id}/resolve", headers=auth_headers)
    assert res_resolve.status_code == 200
    assert res_resolve.json()["is_resolved"] is True
