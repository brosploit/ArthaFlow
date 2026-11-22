from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.workspace import Workspace
from app.schemas.ai import AIChatRequest, AIChatResponse
from app.api.deps import get_current_workspace
from app.ai_agent.agent import process_ai_chat_request

router = APIRouter(prefix="/ai", tags=["AI Financial Agent"])


@router.post("/chat", response_model=AIChatResponse)
def chat_with_agent(
    req: AIChatRequest,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
):
    """Interact with the AI Decision Agent via verified tool calling with zero hallucination."""
    return process_ai_chat_request(
        db=db,
        workspace=workspace,
        user_query=req.message,
        history=req.history,
    )
