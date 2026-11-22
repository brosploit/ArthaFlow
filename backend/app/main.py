import os
import time
from datetime import date, timedelta
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.routes import api_router
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.models.financial import Account, Transaction, RecurringTransaction
from app.core.security import hash_password

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ArthaFlow AI — Understand money. Predict possibilities. Make smarter decisions. AI-powered Financial Decision Intelligence Platform.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers_and_timing(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response


# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Understand money. Predict possibilities. Make smarter decisions.",
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}


def seed_demo_data(db: Session):
    """Seed initial Aarav Retail demo workspace for instant evaluation."""
    demo_user = db.query(User).filter(User.email == "aarav@aaravretail.in").first()
    if not demo_user:
        demo_user = User(
            email="aarav@aaravretail.in",
            hashed_password=hash_password("admin123"),
            full_name="Aarav Sharma",
            is_active=True,
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    ws = db.query(Workspace).filter(Workspace.owner_id == demo_user.id).first()
    if not ws:
        ws = Workspace(
            name="Aarav Retail Enterprises",
            mode="business",
            currency="INR",
            starting_cash=120000.0,
            owner_id=demo_user.id,
        )
        db.add(ws)
        db.commit()
        db.refresh(ws)

        member = WorkspaceMember(workspace_id=ws.id, user_id=demo_user.id, role="owner")
        db.add(member)

        # Seed Accounts
        hdfc = Account(
            workspace_id=ws.id,
            name="HDFC Primary Current A/c",
            type="checking",
            institution="HDFC Bank",
            account_number_mask="•••• 4892",
            balance=78400.0,
            currency="INR",
        )
        icici = Account(
            workspace_id=ws.id,
            name="ICICI Business Operations",
            type="checking",
            institution="ICICI Bank",
            account_number_mask="•••• 8104",
            balance=32600.0,
            currency="INR",
        )
        rzpy = Account(
            workspace_id=ws.id,
            name="Razorpay Gateway Settlement",
            type="wallet",
            institution="Razorpay",
            account_number_mask="•••• RZPY",
            balance=9000.0,
            currency="INR",
        )
        db.add_all([hdfc, icici, rzpy])
        db.commit()

        # Seed Recurring
        lease = RecurringTransaction(
            workspace_id=ws.id,
            name="Showroom Lease Rent",
            type="expense",
            category="Rent & Facilities",
            amount=22000.0,
            frequency="monthly",
            next_due_date=date.today() + timedelta(days=28),
            counterparty="Sharma Estates",
            is_active=True,
        )
        payroll = RecurringTransaction(
            workspace_id=ws.id,
            name="Staff Monthly Payroll",
            type="expense",
            category="Payroll",
            amount=45000.0,
            frequency="monthly",
            next_due_date=date.today() + timedelta(days=5),
            counterparty="Direct Bank Transfer",
            is_active=True,
        )
        db.add_all([lease, payroll])

        # Seed sample transactions
        txs = [
            Transaction(
                workspace_id=ws.id,
                date=date.today() - timedelta(days=1),
                amount=32500.0,
                type="income",
                category="Store Sales",
                description="Weekend Retail & POS Batch Clearance",
                counterparty="Walk-in Retail Customers",
                status="cleared",
                reference_no="POS-2024-9842",
            ),
            Transaction(
                workspace_id=ws.id,
                date=date.today() - timedelta(days=2),
                amount=14200.0,
                type="expense",
                category="Logistics",
                description="Delhivery Surface Freight - North Zone",
                counterparty="Delhivery Logistics Pvt Ltd",
                status="cleared",
                reference_no="INV-DLV-8941",
            ),
            Transaction(
                workspace_id=ws.id,
                date=date.today() - timedelta(days=3),
                amount=45000.0,
                type="income",
                category="Wholesale",
                description="Settlement Invoice #INV-2024-041",
                counterparty="FabIndia Franchise Outlet",
                status="cleared",
                reference_no="NEFT-HDFC-99120",
            ),
            Transaction(
                workspace_id=ws.id,
                date=date.today() - timedelta(days=4),
                amount=18500.0,
                type="expense",
                category="Raw Material",
                description="Surat Cotton Mills - Fabric Lot Batch A",
                counterparty="Surat Cotton Mills",
                status="cleared",
                reference_no="INV-SCM-4412",
            ),
            Transaction(
                workspace_id=ws.id,
                date=date.today() - timedelta(days=4),
                amount=18500.0,
                type="expense",
                category="Raw Material",
                description="Surat Cotton Mills - Duplicate Reference Flag",
                counterparty="Surat Cotton Mills",
                status="flagged",
                notes="AI Anomaly: Identical amount and counterparty within 3 hours",
                reference_no="INV-SCM-4412-B",
            ),
        ]
        db.add_all(txs)
        db.commit()


@app.on_event("startup")
def on_startup():
    if not os.getenv("TESTING"):
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_demo_data(db)
        finally:
            db.close()
