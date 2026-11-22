from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account and initialize their personal workspace."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize default workspace for user
    default_ws = Workspace(
        name=f"{user_in.full_name}'s Workspace",
        mode="business",
        currency="INR",
        starting_cash=100000.0,
        owner_id=user.id,
    )
    db.add(default_ws)
    db.commit()
    db.refresh(default_ws)

    member = WorkspaceMember(workspace_id=default_ws.id, user_id=user.id, role="owner")
    db.add(member)
    db.commit()

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password, returning JWT access token."""
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        # Demo user special bypass
        if login_in.email == "aarav@aaravretail.in":
            if not user:
                user = User(
                    email="aarav@aaravretail.in",
                    hashed_password=hash_password("admin123"),
                    full_name="Aarav Sharma",
                    is_active=True,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
            )

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve details of the currently authenticated user."""
    return UserResponse.model_validate(current_user)
