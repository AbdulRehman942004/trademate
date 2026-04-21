"""
routes/chat.py — authenticated streaming chat endpoint.

POST /v1/chat
─────────────
• Requires a valid JWT (Bearer token).
• Accepts { message, conversation_id }.
• Loads conversation history from DB (last 20 turns) — client no longer
  needs to send history.
• Persists every user message and assistant reply to the messages table.
• Returns a Server-Sent Events (SSE) stream.

SSE event format
────────────────
  data: {"type": "token",   "content": "<chunk>", "conversation_id": "…"}\n\n
  data: {"type": "done",    "conversation_id": "…"}\n\n
  data: {"type": "error",   "detail": "<msg>",    "conversation_id": "…"}\n\n
"""

import json
import logging
import os
import uuid
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from langchain_core.messages import AIMessage, AIMessageChunk, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from sqlmodel import Session, select

from agent.bot import get_bot, route_widget_ctx
from database.database import engine
from models.conversation import Conversation, Message
from schemas.chat import ChatRequest
from security.security import decode_access_token

logger = logging.getLogger(__name__)

router  = APIRouter(prefix="/v1", tags=["chat"])
_bearer = HTTPBearer()

# Maximum number of previous turns loaded from DB as context
_HISTORY_TURNS = 20


# ── auth dependency ────────────────────────────────────────────────────────────


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


# ── DB helpers ─────────────────────────────────────────────────────────────────


def _get_or_create_conversation(
    session: Session,
    conversation_id: str,
    user_id: int,
    first_message: str,
) -> Conversation:
    """Return existing conversation or create a new one."""
    conv = session.get(Conversation, conversation_id)
    if conv:
        if conv.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this conversation.",
            )
        return conv

    # Auto-title from first 80 chars of the opening message
    title = first_message.strip()[:80]
    conv  = Conversation(id=conversation_id, user_id=user_id, title=title)
    session.add(conv)
    session.commit()
    session.refresh(conv)
    logger.info("━━━ [DB] New conversation created: %s  title=%r", conversation_id, title)
    return conv


def _load_history(session: Session, conversation_id: str) -> list:
    """Load the last _HISTORY_TURNS messages as LangChain message objects."""
    rows = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(_HISTORY_TURNS)
    ).all()

    # Reverse so oldest-first order for the LLM
    rows = list(reversed(rows))

    messages = []
    for row in rows:
        if row.role == "user":
            messages.append(HumanMessage(content=row.content))
        else:
            messages.append(AIMessage(content=row.content))

    if rows:
        logger.info("━━━ [DB] Loaded %d history turn(s) for conversation %s", len(rows), conversation_id)
    return messages


def _save_message(
    session: Session,
    conversation_id: str,
    role: str,
    content: str,
    tools_used: list[str] | None = None,
    sources_hit: list[str] | None = None,
) -> None:
    """Persist a single message to the DB."""
    msg = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        tools_used=json.dumps(tools_used) if tools_used else None,
        sources_hit=json.dumps(sources_hit) if sources_hit else None,
    )
    session.add(msg)

    # Bump conversation updated_at so list endpoint sorts correctly
    conv = session.get(Conversation, conversation_id)
    if conv:
        from datetime import datetime
        conv.updated_at = datetime.utcnow()
        session.add(conv)

    session.commit()


# ── SSE helper ─────────────────────────────────────────────────────────────────


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


# ── Title generation ───────────────────────────────────────────────────────────

_title_llm: ChatOpenAI | None = None

def _get_title_llm() -> ChatOpenAI:
    global _title_llm
    if _title_llm is None:
        api_key = os.getenv("OPENAI_API_KEY")
        _title_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, streaming=False, openai_api_key=api_key)
    return _title_llm


async def _generate_title(user_message: str, assistant_reply: str) -> str:
    """Generate a short conversation title from the first exchange."""
    try:
        llm = _get_title_llm()
        response = llm.invoke([
            SystemMessage(content=(
                "Generate a very short title (3-6 words) for this conversation. "
                "Return ONLY the title text. No quotes, no punctuation at the end, no explanation."
            )),
            HumanMessage(content=f"User: {user_message[:300]}\nAssistant: {assistant_reply[:300]}"),
        ])
        title = response.content.strip()[:80]
        logger.info("━━━ [TITLE] Generated: %r", title)
        return title
    except Exception as exc:
        logger.warning("━━━ [TITLE] Generation failed: %s", exc)
        return user_message.strip()[:60]


# ── streaming agent runner ─────────────────────────────────────────────────────


async def _stream_agent(
    message: str,
    conversation_id: str,
    user_id: int,
) -> AsyncGenerator[str, None]:
    try:
        with Session(engine) as session:
            # Ensure conversation exists
            _get_or_create_conversation(session, conversation_id, user_id, message)

            # Load history from DB
            history_messages = _load_history(session, conversation_id)

            # First message in this conversation → title needs to be generated
            is_first_message = len(history_messages) == 0

            # Save the incoming user message immediately
            _save_message(session, conversation_id, "user", message)

        graph = get_bot()

        # Build message list: history + new user message
        messages = history_messages + [HumanMessage(content=message)]
        initial_state = {"messages": messages}

        tools_called: list[str] = []
        reply_chunks: list[str] = []

        # Per-request widget store: evaluate_shipping_routes tool appends here
        widget_store: list = []
        token = route_widget_ctx.set(widget_store)

        async for chunk, metadata in graph.astream(initial_state, stream_mode="messages"):
            # Track tool calls for logging + persistence
            node = metadata.get("langgraph_node", "")
            if node == "tools" and hasattr(chunk, "name") and chunk.name:
                if chunk.name not in tools_called:
                    tools_called.append(chunk.name)
                    logger.info("━━━ [TOOL CALL] → %s", chunk.name)

            # Forward AI token chunks to client
            if (
                isinstance(chunk, AIMessageChunk)
                and chunk.content
                and isinstance(chunk.content, str)
            ):
                reply_chunks.append(chunk.content)
                yield _sse({
                    "type": "token",
                    "content": chunk.content,
                    "conversation_id": conversation_id,
                })

        # Restore context var
        route_widget_ctx.reset(token)

        # Persist the full assistant reply
        full_reply = "".join(reply_chunks)
        if full_reply:
            with Session(engine) as session:
                _save_message(
                    session,
                    conversation_id,
                    "assistant",
                    full_reply,
                    tools_used=tools_called or None,
                    sources_hit=tools_called or None,
                )

        if tools_called:
            logger.info("━━━ [DONE]    Sources used: %s", ", ".join(tools_called))
        else:
            logger.warning(
                "━━━ [DONE]    ⚠ No tools called — LLM answered from training knowledge only."
            )

        yield _sse({"type": "done", "conversation_id": conversation_id})

        # If the route tool was called, emit one widget event per result.
        # The tool may be called multiple times (e.g. air vs sea comparison,
        # or two-destination query) — all results must be sent.
        for i, widget_data in enumerate(widget_store):
            yield _sse({
                "type": "widget",
                "widget_type": "route_evaluation",
                "data": widget_data,
                "conversation_id": conversation_id,
            })
        if widget_store:
            logger.info(
                "━━━ [WIDGET] Sent %d route_evaluation widget(s) for conv %s",
                len(widget_store), conversation_id,
            )

        # Generate and stream title only for the first message
        if is_first_message and full_reply:
            title = await _generate_title(message, full_reply)
            # Persist title to DB
            with Session(engine) as session:
                conv = session.get(Conversation, conversation_id)
                if conv:
                    conv.title = title
                    session.add(conv)
                    session.commit()
            # Send title event to frontend
            yield _sse({"type": "title", "title": title, "conversation_id": conversation_id})

    except Exception as exc:
        logger.exception("Agent error for conversation %s", conversation_id)
        yield _sse({"type": "error", "detail": str(exc), "conversation_id": conversation_id})


# ── route ──────────────────────────────────────────────────────────────────────


@router.post("/chat")
async def chat(
    body: ChatRequest,
    user_id: int = Depends(_get_current_user_id),
):
    conversation_id = body.conversation_id or str(uuid.uuid4())

    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info("━━━ [REQUEST] user_id=%d  conv=%s", user_id, conversation_id)
    logger.info("━━━ [QUERY]   %r", body.message[:200])

    return StreamingResponse(
        _stream_agent(body.message, conversation_id, user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
