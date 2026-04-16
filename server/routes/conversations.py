"""
routes/conversations.py — conversation history endpoints.

GET  /v1/conversations                → list user's conversations (newest first)
GET  /v1/conversations/{id}/messages  → full message history for one conversation
"""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlmodel import Session, select

from database.database import engine
from models.conversation import Conversation, Message
from security.security import decode_access_token

logger = logging.getLogger(__name__)

router  = APIRouter(prefix="/v1", tags=["conversations"])
_bearer = HTTPBearer()


# ── auth ───────────────────────────────────────────────────────────────────────


def _get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> int:
    payload = decode_access_token(credentials.credentials)
    try:
        return int(payload["id"])
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )


# ── response schemas ───────────────────────────────────────────────────────────


class ConversationOut(BaseModel):
    id: str
    title: str | None
    created_at: str
    updated_at: str


class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    tools_used: list[str] | None
    created_at: str


# ── endpoints ──────────────────────────────────────────────────────────────────


@router.get("/conversations", response_model=List[ConversationOut])
def list_conversations(user_id: int = Depends(_get_current_user_id)):
    """Return all conversations for the authenticated user, newest first."""
    with Session(engine) as session:
        rows = session.exec(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        ).all()

    logger.info("[DB] list_conversations → user_id=%d  count=%d", user_id, len(rows))
    return [
        ConversationOut(
            id=r.id,
            title=r.title,
            created_at=r.created_at.isoformat(),
            updated_at=r.updated_at.isoformat(),
        )
        for r in rows
    ]


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageOut])
def get_messages(
    conversation_id: str,
    user_id: int = Depends(_get_current_user_id),
):
    """Return all messages for a conversation (oldest first). Verifies ownership."""
    import json

    with Session(engine) as session:
        conv = session.get(Conversation, conversation_id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        if conv.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        rows = session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        ).all()

    logger.info(
        "[DB] get_messages → conv=%s  user_id=%d  count=%d",
        conversation_id, user_id, len(rows),
    )
    return [
        MessageOut(
            id=r.id,
            role=r.role,
            content=r.content,
            tools_used=json.loads(r.tools_used) if r.tools_used else None,
            created_at=r.created_at.isoformat(),
        )
        for r in rows
    ]
