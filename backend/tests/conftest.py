import os
os.environ["TESTING"] = "1"
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.database import Base, get_db
from app.core.security import hash_password, create_access_token
from app.main import app
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember

# In-memory SQLite database for test isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db):
    user = User(
        email="testuser@arthaflow.ai",
        hashed_password=hash_password("password123"),
        full_name="Test Architect",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_workspace(db, test_user):
    ws = Workspace(
        name="Test Retail Workspace",
        mode="business",
        currency="INR",
        starting_cash=120000.0,
        owner_id=test_user.id,
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    member = WorkspaceMember(workspace_id=ws.id, user_id=test_user.id, role="owner")
    db.add(member)
    db.commit()
    return ws


@pytest.fixture(scope="function")
def auth_headers(test_user, test_workspace):
    token = create_access_token(subject=test_user.id)
    return {
        "Authorization": f"Bearer {token}",
        "X-Workspace-Id": test_workspace.id,
    }
