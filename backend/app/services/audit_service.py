from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from app.models.intelligence import AuditLog


def log_action(
    db: Session,
    workspace_id: str,
    action: str,
    entity_type: str,
    user_id: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Safely log financial actions avoiding sensitive account credentials."""
    safe_details = {}
    if details:
        for k, v in details.items():
            if any(s in k.lower() for s in ["password", "token", "secret", "cvv", "card"]):
                safe_details[k] = "[REDACTED]"
            else:
                safe_details[k] = v

    log = AuditLog(
        workspace_id=workspace_id,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=safe_details,
        ip_address=ip_address,
    )
    db.add(log)
    db.commit()
    return log
