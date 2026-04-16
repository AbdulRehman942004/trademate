from typing import Optional

from pydantic import BaseModel


class ChatRequest(BaseModel):
    """
    Body sent by the client to POST /v1/chat.

    message         — the user's latest message.
    conversation_id — opaque ID managed by the frontend; echoed back in every
                      SSE event so the client can route chunks correctly.
                      If omitted, a new conversation is created server-side.

    History is no longer sent by the client — the server loads the last
    20 turns from the DB automatically.
    """

    message: str
    conversation_id: Optional[str] = None
