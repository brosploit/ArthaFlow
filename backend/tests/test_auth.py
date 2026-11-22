def test_register_success(client):
    res = client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@arthaflow.ai", "password": "securepassword123", "full_name": "New Founder"},
    )
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@arthaflow.ai"


def test_register_duplicate_email(client, test_user):
    res = client.post(
        "/api/v1/auth/register",
        json={"email": test_user.email, "password": "password123", "full_name": "Duplicate User"},
    )
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]


def test_login_success(client, test_user):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "password123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["id"] == test_user.id


def test_login_incorrect_password(client, test_user):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "wrongpassword"},
    )
    assert res.status_code == 401


def test_get_me(client, auth_headers, test_user):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name
