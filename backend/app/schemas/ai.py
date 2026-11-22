from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class AIChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[AIChatMessage]] = []


class AIToolExecutionRecord(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result_summary: str


class AIVerifiedFigure(BaseModel):
    label: str
    value: str
    source: str


class AIChatResponse(BaseModel):
    content: str
    tool_calls_executed: List[AIToolExecutionRecord] = []
    verified_figures: List[AIVerifiedFigure] = []
    suggested_followups: List[str] = []
