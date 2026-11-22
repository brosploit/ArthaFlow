from app.models.user import User
from app.models.workspace import Workspace
from app.core.security import hash_password, create_access_token


def test_workspace_creation(client, auth_headers):
    res = client.post(
        "/api/v1/workspaces",
        headers=auth_headers,
        json={"name": "Second Branch Store", "mode": "business", "currency": "INR", "starting_cash": 75000.0},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Second Branch Store"
    assert data["starting_cash"] == 75000.0


def test_workspace_isolation_unauthorized_user(client, db, test_workspace):
    # Create another user with their own workspace
    other_user = User(
        email="other@arthaflow.ai",
        hashed_password=hash_password("password123"),
        full_name="Other User",
        is_active=True,
    )
    db.add(other_user)
    db.commit()

    other_token = create_access_token(subject=other_user.id)
    other_headers = {"Authorization": f"Bearer {other_token}"}

    # Attempt to access test_workspace using other_user credentials
    res = client.get(f"/api/v1/workspaces/{test_workspace.id}", headers=other_headers)
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]


def test_transaction_workspace_isolation(client, db, test_workspace, auth_headers):
    # Create transaction in test_workspace
    from app.models.financial import Transaction
    from datetime import date

    tx = Transaction(
        workspace_id=test_workspace.id,
        date=date.today(),
        amount=5000.0,
        type="expense",
        category="Test Category",
        description="Confidential Expense",
        counterparty="Vendor X",
        status="cleared",
    )
    db.add(tx)
    db.commit()

    # User in another workspace should NOT see this transaction
    other_user = User(
        email="third@arthaflow.ai",
        hashed_password=hash_password("password123"),
        full_name="Third User",
        is_active=True,
    )
    db.add(other_user)
    db.commit()

    other_ws = Workspace(
        name="Third Workspace",
        mode="individual",
        currency="INR",
        starting_cash=10000.0,
        owner_id=other_user.id,
    )
    db.add(other_ws)
    db.commit()

    other_token = create_access_token(subject=other_user.id)
    other_headers = {
        "Authorization": f"Bearer {other_token}",
        "X-Workspace-Id": other_ws.id,
    }

    res = client.get("/api/v1/transactions", headers=other_headers)
    assert res.status_code == 200
    assert len(res.json()) == 0  # Completely isolated
