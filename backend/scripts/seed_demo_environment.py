"""
ArthaFlow AI — Repeatable Demonstration Environment Seeder
Fictional Business: Aarav Retail Enterprises (Ahmedabad, India)
Currency: INR (₹)
All synthetic records are clearly marked as demonstration data.
"""

import os
import sys
from datetime import date, timedelta
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.database import Base, engine, SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.models.financial import Account, Transaction, RecurringTransaction, FinancialSnapshot
from app.models.intelligence import RiskAlert, Simulation, Decision, DecisionOutcome, Forecast
from app.services.audit_service import log_action


def seed_demo_environment():
    print("=================================================================")
    print("  ArthaFlow AI — Seeding Realistic Demonstration Environment     ")
    print("  Fictional Business: Aarav Retail Enterprises [DEMO]            ")
    print("  Currency: Indian Rupee (INR - ₹)                               ")
    print("=================================================================")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Demo User
        demo_email = "aarav@aaravretail.in"
        demo_user = db.query(User).filter(User.email == demo_email).first()
        if not demo_user:
            demo_user = User(
                email=demo_email,
                hashed_password=hash_password("admin123"),
                full_name="Aarav Sharma",
                is_active=True,
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"✓ Created Demo User: {demo_user.email} (Password: admin123)")
        else:
            print(f"✓ Existing Demo User Verified: {demo_user.email}")

        # 2. Demo Workspace
        ws_name = "Aarav Retail Enterprises [DEMO]"
        ws = db.query(Workspace).filter(Workspace.owner_id == demo_user.id).first()
        if not ws:
            ws = Workspace(
                name=ws_name,
                mode="business",
                currency="INR",
                starting_cash=120000.0,
                owner_id=demo_user.id,
            )
            db.add(ws)
            db.commit()
            db.refresh(ws)
            print(f"✓ Created Demo Workspace: {ws.name} (ID: {ws.id})")
        else:
            ws.name = ws_name
            ws.starting_cash = 120000.0
            db.commit()
            print(f"✓ Verified Demo Workspace: {ws.name}")

        # Ensure Workspace Membership
        member = (
            db.query(WorkspaceMember)
            .filter(WorkspaceMember.workspace_id == ws.id, WorkspaceMember.user_id == demo_user.id)
            .first()
        )
        if not member:
            member = WorkspaceMember(workspace_id=ws.id, user_id=demo_user.id, role="owner")
            db.add(member)
            db.commit()

        # Clean existing demo transactions, accounts, and alerts for idempotency
        db.query(RiskAlert).filter(RiskAlert.workspace_id == ws.id).delete()
        db.query(Transaction).filter(Transaction.workspace_id == ws.id).delete()
        db.query(RecurringTransaction).filter(RecurringTransaction.workspace_id == ws.id).delete()
        db.query(Account).filter(Account.workspace_id == ws.id).delete()
        db.query(Decision).filter(Decision.workspace_id == ws.id).delete()
        db.commit()
        print("✓ Purged old transient demo transactions for clean repeatable seed")

        # 3. Bank Accounts
        hdfc = Account(
            workspace_id=ws.id,
            name="HDFC Primary Current A/c",
            type="checking",
            institution="HDFC Bank",
            account_number_mask="•••• 4892",
            balance=78400.0,
            currency="INR",
            is_active=True,
        )
        icici = Account(
            workspace_id=ws.id,
            name="ICICI Business Operations",
            type="checking",
            institution="ICICI Bank",
            account_number_mask="•••• 8104",
            balance=32600.0,
            currency="INR",
            is_active=True,
        )
        rzpy = Account(
            workspace_id=ws.id,
            name="Razorpay Gateway Settlement",
            type="wallet",
            institution="Razorpay Payments",
            account_number_mask="•••• RZPY",
            balance=9000.0,
            currency="INR",
            is_active=True,
        )
        db.add_all([hdfc, icici, rzpy])
        db.commit()
        db.refresh(hdfc)
        print("✓ Seeded 3 Active Financial Accounts (Total Cash: ₹1,20,000.00)")

        # 4. Recurring Commitments
        today = date.today()
        recurring_items = [
            RecurringTransaction(
                workspace_id=ws.id,
                name="Commercial Showroom Lease Rent",
                type="expense",
                category="Rent & Facilities",
                amount=22000.0,
                frequency="monthly",
                next_due_date=today + timedelta(days=28),
                counterparty="Sharma Real Estate Trust",
                is_active=True,
            ),
            RecurringTransaction(
                workspace_id=ws.id,
                name="Staff Monthly Payroll Direct Transfer",
                type="expense",
                category="Payroll",
                amount=45000.0,
                frequency="monthly",
                next_due_date=today + timedelta(days=5),
                counterparty="Direct Salary Account",
                is_active=True,
            ),
            RecurringTransaction(
                workspace_id=ws.id,
                name="Shopify POS & Tally Cloud SaaS",
                type="expense",
                category="Software & SaaS",
                amount=3900.0,
                frequency="monthly",
                next_due_date=today + timedelta(days=24),
                counterparty="Shopify India / Tally",
                is_active=True,
            ),
            RecurringTransaction(
                workspace_id=ws.id,
                name="Airtel Commercial Fiber Internet",
                type="expense",
                category="Utilities",
                amount=1899.0,
                frequency="monthly",
                next_due_date=today + timedelta(days=21),
                counterparty="Bharti Airtel Ltd",
                is_active=True,
            ),
        ]
        db.add_all(recurring_items)
        db.commit()
        print(f"✓ Seeded {len(recurring_items)} Recurring Commitments (Payroll, Rent, SaaS)")

        # 5. Ledger Transactions (25+ transactions with duplicate & anomalies)
        tx_data = [
            (today - timedelta(days=28), 28450.0, "income", "Store Sales", "Walk-in Weekend Retail Sales Batch 1", "Walk-in Retail Customers", "cleared", "POS-2026-1025-01", None),
            (today - timedelta(days=27), 14820.0, "income", "Digital Payments", "HDFC Merchant QR Settlement", "PayTM/UPI Aggregator", "cleared", "QR-SETTLE-8812", None),
            (today - timedelta(days=26), 18500.0, "expense", "Raw Material", "Surat Cotton Mills - Fabric Lot Batch A", "Surat Cotton Mills", "cleared", "INV-SCM-4412", None),
            (today - timedelta(days=26), 18500.0, "expense", "Raw Material", "Surat Cotton Mills - Duplicate Reference Flag", "Surat Cotton Mills", "flagged", "INV-SCM-4412-B", "AI Anomaly: Identical amount and counterparty within 3 hours"),
            (today - timedelta(days=25), 1899.0, "expense", "Utilities", "Airtel Commercial Fiber Internet", "Bharti Airtel Ltd", "cleared", "BILL-OCT-99124", None),
            (today - timedelta(days=24), 38500.0, "income", "Wholesale", "Jaipur Block Prints Wholesale Inflow", "Jaipur Handloom Mart", "cleared", "NEFT-JHM-1029", None),
            (today - timedelta(days=23), 4650.0, "expense", "Utilities", "Torrent Power Showroom Electricity Bill", "Torrent Power Ltd", "cleared", "ELEC-2026-9041", None),
            (today - timedelta(days=22), 3900.0, "expense", "Software & SaaS", "Shopify POS & Tally Cloud SaaS", "Shopify India / Tally", "cleared", "SAAS-SUB-1031", None),
            (today - timedelta(days=21), 45000.0, "income", "Wholesale", "FabIndia Franchise Order Settlement", "FabIndia Franchise Outlet", "cleared", "NEFT-HDFC-99120", None),
            (today - timedelta(days=20), 12400.0, "expense", "Logistics", "Delhivery Express Surface Logistics", "Delhivery Logistics Pvt Ltd", "cleared", "INV-DLV-8941", None),
            (today - timedelta(days=19), 15000.0, "income", "Store Sales", "Kala Kendra Boutique Advance Payment", "Kala Kendra Fashion", "cleared", "UPI-KK-7721", None),
            (today - timedelta(days=18), 6800.0, "expense", "Packaging", "Packaging Materials Box Lot 500 units", "Navkar Packaging Hub", "cleared", "INV-NP-2204", None),
            (today - timedelta(days=17), 22000.0, "expense", "Rent & Facilities", "Commercial Showroom Lease Rent", "Sharma Real Estate Trust", "cleared", "CHQ-881240", None),
            (today - timedelta(days=16), 45000.0, "expense", "Payroll", "Staff Monthly Payroll Direct Transfer", "Staff Salary Batch", "cleared", "NEFT-SAL-1106", None),
            (today - timedelta(days=15), 8500.0, "expense", "Store Operations", "Boutique Seasonal Lighting & Display", "Om Electricals", "cleared", "INV-OME-551", None),
            (today - timedelta(days=14), 39400.0, "income", "Store Sales", "Walk-in Diwalifest Retail Clearance", "Walk-in Retail Customers", "cleared", "POS-2026-1108-01", None),
            (today - timedelta(days=13), 5200.0, "expense", "Logistics", "BlueDart Express Air Courier - South Zone", "BlueDart Express Ltd", "cleared", "INV-BDE-1049", None),
            (today - timedelta(days=12), 52000.0, "income", "Corporate Sales", "Corporate Gifting Order Advance (50 Kurtas)", "Infosys Employee Welfare Club", "cleared", "NEFT-INFY-4401", None),
            (today - timedelta(days=11), 24500.0, "expense", "Raw Material", "Ananya Silk House Raw Yarn Procurement", "Ananya Silk Mills", "cleared", "INV-ASM-901", None),
            (today - timedelta(days=10), 2400.0, "expense", "Office Expenses", "Tea, Coffee & Staff Refreshment Pantry", "Local Pantry Mart", "cleared", "CASH-PANTRY-1112", None),
            (today - timedelta(days=9), 31200.0, "income", "Store Sales", "Weekend Festive Footfall Sales", "Walk-in Retail Customers", "cleared", "POS-2026-1113-02", None),
            (today - timedelta(days=8), 16000.0, "expense", "Payroll", "Tailoring Master Piece-Rate Contractor", "Zameer Tailoring Works", "cleared", "UPI-ZTW-884", None),
            (today - timedelta(days=7), 3500.0, "expense", "Legal & Compliance", "Municipal Trade License Renewal Fee", "Ahmedabad Municipal Corp", "cleared", "GOV-LIC-2026", None),
            (today - timedelta(days=6), 48000.0, "income", "Corporate Sales", "Institutional Uniform Supply Tranche 1", "St. Xavier High School", "cleared", "NEFT-STX-9940", None),
            (today - timedelta(days=5), 14500.0, "expense", "Repairs & Maintenance", "Unusual Outflow: Showroom Air Conditioner Repair", "CoolAir Systems", "cleared", "INV-CAS-8810", "Anomaly: 340% higher than average maintenance spend"),
            (today - timedelta(days=4), 26400.0, "income", "Digital Payments", "Razorpay Online Web Store Sales Settlement", "Razorpay Gateway Settlements", "cleared", "RZP-BATCH-1118", None),
            (today - timedelta(days=3), 48000.0, "expense", "Raw Material", "Surat Cotton Mills - Festive Chanderi Silk Lot", "Surat Cotton Mills", "cleared", "INV-SCM-4590", "Large CapEx fabric purchase"),
            (today - timedelta(days=2), 22900.0, "income", "Store Sales", "Retail Boutique In-Store Card Collections", "HDFC POS Terminal Batch", "cleared", "POS-2026-1120-03", None),
        ]

        tx_objects = []
        for t_date, amt, t_type, cat, desc, party, stat, ref, notes in tx_data:
            tx_objects.append(
                Transaction(
                    workspace_id=ws.id,
                    account_id=hdfc.id,
                    date=t_date,
                    amount=amt,
                    type=t_type,
                    category=cat,
                    description=desc,
                    counterparty=party,
                    status=stat,
                    reference_no=ref,
                    notes=notes,
                )
            )
        db.add_all(tx_objects)
        db.commit()
        print(f"✓ Seeded {len(tx_objects)} Realistic Demo Transactions")

        # 6. Seed Explainable Risk Alerts
        alerts = [
            RiskAlert(
                workspace_id=ws.id,
                category="duplicate_payment",
                severity="high",
                title="Duplicate Supplier Charge Flagged",
                description="Identical debit of ₹18,500 to Surat Cotton Mills detected twice within 3 hours.",
                explanation="Invoice reference INV-SCM-4412 and INV-SCM-4412-B share identical amounts (₹18,500) and counterparty within a 3-hour window. Risk of duplicate payment disbursement.",
                financial_impact=18500.0,
                is_resolved=False,
                suggested_action="Contact Surat Cotton Mills accounts team to verify if Batch B was a duplicate transmission before releasing check.",
                related_entity="Surat Cotton Mills",
                related_transactions=[
                    {"description": "Surat Cotton Mills - Fabric Lot Batch A", "amount": 18500.0, "date": (today - timedelta(days=26)).isoformat()},
                    {"description": "Surat Cotton Mills - Duplicate Reference Flag", "amount": 18500.0, "date": (today - timedelta(days=26)).isoformat()},
                ],
            ),
            RiskAlert(
                workspace_id=ws.id,
                category="overdue_receivable_concentration",
                severity="medium",
                title="Overdue Concentration: Kala Kendra (12 Days)",
                description="Kala Kendra invoice #INV-2024-042 (₹28,500) is 12 days overdue, representing ~34% of pending wholesale receivables.",
                explanation="Delayed payment from a concentrated debtor directly restricts liquidity required for upcoming month-end payroll commitments.",
                financial_impact=28500.0,
                is_resolved=False,
                suggested_action="Send formal payment reminder and withhold dispatch of pending festive order until cleared.",
                related_entity="Kala Kendra Fashion House",
            ),
            RiskAlert(
                workspace_id=ws.id,
                category="cash_buffer_breach",
                severity="medium",
                title="Mid-Month Working Capital Buffer Squeeze",
                description="Upcoming obligations of ₹67,000 (Payroll + Rent) collide on Days 5-8 against emergency ₹40,000 buffer.",
                explanation="Fixed overheads (₹45,000 staff wages + ₹22,000 rent) will draw cash reserves down close to the minimum safety threshold unless planned receivables are collected on time.",
                financial_impact=67000.0,
                is_resolved=False,
                suggested_action="Expedite FabIndia wholesale settlement (₹35,000) or negotiate 15-day rent deferral with landlord.",
                related_entity="Sharma Estates / Payroll",
            ),
        ]
        db.add_all(alerts)
        db.commit()
        print(f"✓ Seeded {len(alerts)} Explainable Risk Intelligence Alerts")

        # 7. Seed Baseline Decision Memory
        decision = Decision(
            workspace_id=ws.id,
            title="Procure ₹50,000 Festive Fabric on 30% Advance Terms",
            category="CapEx / Procurement",
            hypothesis="Splitting payment into 30% advance (₹15k) and 70% Net 30 preserves the ₹40k buffer while unlocking ₹1,15,000 festive sales uplift.",
            assumptions=[
                "Vendor accepts 30% advance with Net 30 balance",
                "Festive retail footfall yields incremental sales starting Day 8",
                "Lowest cash dip remains above ₹50,000",
            ],
            expected_outcomes=[
                {"metric": "Lowest Cash Dip", "expected_value": "₹53,200", "timeframe": "Day 6"},
                {"metric": "Break-Even Day", "expected_value": "Day 22", "timeframe": "Day 22"},
                {"metric": "Net 30-Day Liquidity Yield", "expected_value": "+₹1,15,000", "timeframe": "Day 30"},
            ],
            status="active",
            decision_date=today - timedelta(days=10),
            evaluation_date=today + timedelta(days=20),
            notes="Logged from What-If Scenario Lab after verifying buffer safety.",
        )
        db.add(decision)
        db.commit()
        print("✓ Seeded Decision Memory Baseline (Hypothesis & Expected Outcome Calibration)")

        # Log audit entry
        log_action(
            db=db,
            workspace_id=ws.id,
            user_id=demo_user.id,
            action="seed_demo_environment",
            entity_type="workspace",
            entity_id=ws.id,
            details={"business": "Aarav Retail Enterprises", "currency": "INR", "records_count": len(tx_objects)},
        )

        print("\n=================================================================")
        print("  DEMO SEEDING COMPLETED SUCCESSFULLY!                           ")
        print("=================================================================")
        print(f"  Login Email:    {demo_email}")
        print(f"  Login Password: admin123")
        print(f"  Workspace:      {ws_name} (Starting Cash: ₹1,20,000.00)")
        print(f"  Transactions:   {len(tx_objects)} Records Seeded")
        print(f"  Sample Files:   demo_data/aarav_retail_bank_statement.csv")
        print("=================================================================\n")

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_environment()
