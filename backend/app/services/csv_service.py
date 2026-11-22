import csv
import io
import re
import hashlib
from datetime import datetime, date
from typing import List, Dict, Any, Tuple, Optional
from dateutil import parser as date_parser
from sqlalchemy.orm import Session
from app.models.financial import Transaction, Account
from app.schemas.transaction import CSVImportSummary


def compute_transaction_fingerprint(
    workspace_id: str,
    tx_date: date,
    amount: float,
    description: str,
    counterparty: str,
    account_id: Optional[str] = None,
) -> str:
    """Create a deterministic SHA-256 fingerprint for duplicate detection."""
    clean_desc = re.sub(r"\s+", " ", description.strip().lower())
    clean_party = re.sub(r"\s+", " ", counterparty.strip().lower())
    raw = f"{workspace_id}|{tx_date.isoformat()}|{round(amount, 2)}|{clean_desc}|{clean_party}|{account_id or ''}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def detect_columns(headers: List[str]) -> Dict[str, str]:
    """Step 3 & 4: Automatically identify and map CSV columns using fuzzy patterns."""
    mapping = {}
    for h in headers:
        clean = h.strip().lower()
        if not mapping.get("date") and any(k in clean for k in ["date", "timestamp", "time", "posted"]):
            mapping["date"] = h
        elif not mapping.get("amount") and any(k in clean for k in ["amount", "value", "sum", "total", "net"]):
            mapping["amount"] = h
        elif not mapping.get("description") and any(k in clean for k in ["description", "narrative", "particulars", "memo", "details"]):
            mapping["description"] = h
        elif not mapping.get("type") and any(k in clean for k in ["type", "transaction type", "dr/cr"]):
            mapping["type"] = h
        elif not mapping.get("category") and any(k in clean for k in ["category", "tag", "class"]):
            mapping["category"] = h
        elif not mapping.get("counterparty") and any(k in clean for k in ["counterparty", "vendor", "payee", "merchant", "party"]):
            mapping["counterparty"] = h
        elif not mapping.get("account") and any(k in clean for k in ["account", "bank", "channel"]):
            mapping["account"] = h

    # Fallbacks if essential fields missing
    if not mapping.get("date") and len(headers) > 0:
        mapping["date"] = headers[0]
    if not mapping.get("description") and len(headers) > 1:
        mapping["description"] = headers[1]
    if not mapping.get("amount") and len(headers) > 2:
        mapping["amount"] = headers[2]

    return mapping


def parse_amount(val_str: Any) -> Tuple[float, Optional[str]]:
    """Step 6 & 7: Parse currency amount, handling parenthesis, signs, and commas."""
    if val_str is None:
        return 0.0, None

    s = str(val_str).strip()
    is_negative = False

    # Check parenthesis format: (1234.50)
    if s.startswith("(") and s.endswith(")"):
        is_negative = True
        s = s[1:-1].strip()

    if s.startswith("-"):
        is_negative = True
        s = s[1:].strip()

    # Remove currency symbols (₹, $, €, £), commas, whitespace
    cleaned = re.sub(r"[^\d.]", "", s)
    if not cleaned:
        return 0.0, None

    try:
        amt = float(cleaned)
        amt = -amt if is_negative else amt
        inferred_type = "expense" if is_negative or amt < 0 else "income"
        return abs(amt), inferred_type
    except ValueError:
        return 0.0, None


def sanitize_csv_field(val: Any) -> str:
    """Sanitize CSV text fields against formula/DDE injection (OWASP CSV Injection)."""
    if not val:
        return ""
    s = str(val).strip()
    if s and s[0] in ("=", "@", "\t", "\r"):
        s = "'" + s
    return s


def parse_date_robust(val_str: Any) -> Optional[date]:
    """Step 5: Robust date parsing supporting various international formats."""
    if not val_str:
        return None
    s = str(val_str).strip()
    try:
        # Dayfirst handles Indian/UK style dates (e.g. 31/10/2024 or 27-10-2024)
        parsed = date_parser.parse(s, dayfirst=True)
        return parsed.date()
    except Exception:
        return None


def process_csv_file(
    db: Session,
    workspace_id: str,
    file_bytes: bytes,
    filename: str,
    default_account_id: Optional[str] = None,
) -> CSVImportSummary:
    """Execute complete 10-step CSV ingestion pipeline."""
    # Step 1 & 2: Decode and detect delimiter
    text = None
    for enc in ["utf-8-sig", "utf-8", "latin1", "cp1252"]:
        try:
            text = file_bytes.decode(enc)
            break
        except UnicodeDecodeError:
            continue

    if text is None:
        return CSVImportSummary(
            filename=filename,
            total_rows=0,
            imported_count=0,
            duplicate_count=0,
            skipped_count=0,
            detected_columns={},
            detected_categories=[],
            sample_preview=[],
            validation_errors=["Failed to decode CSV with supported encodings (UTF-8, Latin1)."],
        )

    lines = [l for l in text.splitlines() if l.strip()]
    if not lines:
        return CSVImportSummary(
            filename=filename,
            total_rows=0,
            imported_count=0,
            duplicate_count=0,
            skipped_count=0,
            detected_columns={},
            detected_categories=[],
            sample_preview=[],
            validation_errors=["Uploaded file is empty."],
        )

    # Sniff delimiter
    sample = "\n".join(lines[:10])
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",\t;|")
        delimiter = dialect.delimiter
    except Exception:
        delimiter = ","

    reader = csv.reader(io.StringIO(text), delimiter=delimiter)
    try:
        headers = next(reader)
    except StopIteration:
        return CSVImportSummary(
            filename=filename,
            total_rows=0,
            imported_count=0,
            duplicate_count=0,
            skipped_count=0,
            detected_columns={},
            detected_categories=[],
            sample_preview=[],
            validation_errors=["No header row found."],
        )

    # Step 3 & 4: Detect columns and build map
    col_map = detect_columns(headers)
    date_col = col_map.get("date")
    desc_col = col_map.get("description")
    amt_col = col_map.get("amount")
    type_col = col_map.get("type")
    cat_col = col_map.get("category")
    party_col = col_map.get("counterparty")

    header_indices = {h: i for i, h in enumerate(headers)}
    date_idx = header_indices.get(date_col)
    desc_idx = header_indices.get(desc_col)
    amt_idx = header_indices.get(amt_col)
    type_idx = header_indices.get(type_col) if type_col else None
    cat_idx = header_indices.get(cat_col) if cat_col else None
    party_idx = header_indices.get(party_col) if party_col else None

    # Load existing fingerprints in workspace for Step 8 duplicate detection
    existing_fps = set(
        f[0]
        for f in db.query(Transaction.hash_fingerprint)
        .filter(Transaction.workspace_id == workspace_id, Transaction.hash_fingerprint.isnot(None))
        .all()
    )

    imported_txs: List[Transaction] = []
    duplicate_count = 0
    skipped_count = 0
    validation_errors: List[str] = []
    detected_cats_map: Dict[str, int] = {}
    sample_preview: List[Dict[str, Any]] = []

    for row_num, row in enumerate(reader, start=2):
        if not row or not any(row):
            continue

        if len(row) <= max(filter(lambda x: x is not None, [date_idx, desc_idx, amt_idx])):
            skipped_count += 1
            validation_errors.append(f"Row {row_num}: Malformed row has insufficient columns.")
            continue

        raw_date = row[date_idx] if date_idx is not None else ""
        raw_desc = row[desc_idx] if desc_idx is not None else "Bank Transaction"
        raw_amt = row[amt_idx] if amt_idx is not None else "0"
        raw_type = row[type_idx] if type_idx is not None and type_idx < len(row) else ""
        raw_cat = row[cat_idx] if cat_idx is not None and cat_idx < len(row) else "Uncategorized"
        raw_party = row[party_idx] if party_idx is not None and party_idx < len(row) else ""

        # Step 5: Parse date
        parsed_date = parse_date_robust(raw_date)
        if not parsed_date:
            skipped_count += 1
            validation_errors.append(f"Row {row_num}: Invalid date format '{raw_date}'.")
            continue

        # Step 6: Parse amount
        amount, inferred_type = parse_amount(raw_amt)
        if amount <= 0:
            skipped_count += 1
            validation_errors.append(f"Row {row_num}: Non-positive or unparseable amount '{raw_amt}'.")
            continue

        # Step 7: Determine type
        final_type = "expense"
        clean_raw_type = raw_type.strip().lower()
        if "credit" in clean_raw_type or "income" in clean_raw_type or "deposit" in clean_raw_type:
            final_type = "income"
        elif "debit" in clean_raw_type or "expense" in clean_raw_type or "withdrawal" in clean_raw_type:
            final_type = "expense"
        elif inferred_type:
            final_type = inferred_type

        # Step 9: Normalization & CSV Injection defense
        clean_desc = sanitize_csv_field(raw_desc) or "Transaction"
        clean_party = sanitize_csv_field(raw_party) or clean_desc
        clean_cat = sanitize_csv_field(raw_cat) or "General"
        detected_cats_map[clean_cat] = detected_cats_map.get(clean_cat, 0) + 1

        # Step 8: Duplicate detection via fingerprint
        fp = compute_transaction_fingerprint(
            workspace_id=workspace_id,
            tx_date=parsed_date,
            amount=amount,
            description=clean_desc,
            counterparty=clean_party,
            account_id=default_account_id,
        )

        if fp in existing_fps:
            duplicate_count += 1
            continue

        existing_fps.add(fp)

        tx = Transaction(
            workspace_id=workspace_id,
            account_id=default_account_id,
            date=parsed_date,
            amount=amount,
            type=final_type,
            category=clean_cat,
            description=clean_desc,
            counterparty=clean_party,
            status="cleared",
            is_recurring=False,
            hash_fingerprint=fp,
            raw_data={"csv_row": row},
        )
        imported_txs.append(tx)

        if len(sample_preview) < 5:
            sample_preview.append({
                "date": parsed_date.isoformat(),
                "description": clean_desc,
                "amount": amount,
                "type": final_type,
                "category": clean_cat,
                "counterparty": clean_party,
            })

    # Bulk persist valid imported transactions
    if imported_txs:
        db.bulk_save_objects(imported_txs)
        db.commit()

    detected_categories_list = [{"category": k, "count": v} for k, v in detected_cats_map.items()]

    return CSVImportSummary(
        filename=filename,
        total_rows=len(lines) - 1,
        imported_count=len(imported_txs),
        duplicate_count=duplicate_count,
        skipped_count=skipped_count,
        detected_columns=col_map,
        detected_categories=detected_categories_list,
        sample_preview=sample_preview,
        validation_errors=validation_errors[:20],  # Cap reported errors to avoid massive payloads
    )
